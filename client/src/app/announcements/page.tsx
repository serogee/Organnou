'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    announcementsApi,
    topicsApi,
    roomsApi,
    Announcement,
    Topic,
    Room,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface AnnouncementFormData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    topic_ids: number[];
    room_ids: number[];
}

export default function AnnouncementsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<Announcement | null>(null);
    const [filterTopicIds, setFilterTopicIds] = useState<number[]>([]);
    const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('');

    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        topic_ids: [],
        room_ids: [],
    });

    const { data: announcements, isLoading } = useQuery({
        queryKey: ['announcements', filterTopicIds],
        queryFn: async () => {
            const response = await announcementsApi.getAll(
                filterTopicIds.length > 0 ? filterTopicIds : undefined
            );
            return response.data;
        },
    });

    const { data: topics } = useQuery({
        queryKey: ['topics'],
        queryFn: async () => {
            const response = await topicsApi.getAll();
            return response.data;
        },
    });

    const { data: rooms } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await roomsApi.getAll();
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: AnnouncementFormData) =>
            announcementsApi.create({
                ...data,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setIsCreateOpen(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: AnnouncementFormData;
        }) =>
            announcementsApi.update(id, {
                ...data,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setIsEditOpen(false);
            setSelectedAnnouncement(null);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => announcementsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setIsDeleteOpen(false);
            setSelectedAnnouncement(null);
        },
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            topic_ids: [],
            room_ids: [],
        });
    };

    const handleCreate = () => {
        setIsCreateOpen(true);
        resetForm();
    };

    const handleEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        // Filter out deleted topics/rooms
        const validTopicIds = announcement.topics
            .map((t: Topic) => t.topic_id)
            .filter((id) => topics?.some((t) => t.topic_id === id));
        const validRoomIds = announcement.rooms
            .map((r: Room) => r.room_id)
            .filter((id) => rooms?.some((r) => r.room_id === id));

        // Convert ISO date strings to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatDateForInput = (dateString: string | null) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
            title: announcement.title,
            description: announcement.description,
            start_date: formatDateForInput(announcement.start_date),
            end_date: formatDateForInput(announcement.end_date),
            topic_ids: validTopicIds,
            room_ids: validRoomIds,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsDeleteOpen(true);
    };

    const handleSubmitCreate = () => {
        createMutation.mutate(formData);
    };

    const handleSubmitEdit = () => {
        if (selectedAnnouncement) {
            updateMutation.mutate({
                id: selectedAnnouncement.announcement_id,
                data: formData,
            });
        }
    };

    const handleSubmitDelete = () => {
        if (selectedAnnouncement) {
            deleteMutation.mutate(selectedAnnouncement.announcement_id);
        }
    };

    const toggleTopicSelection = (topicId: number) => {
        setFormData((prev) => ({
            ...prev,
            topic_ids: prev.topic_ids.includes(topicId)
                ? prev.topic_ids.filter((id) => id !== topicId)
                : [...prev.topic_ids, topicId],
        }));
    };

    const toggleRoomSelection = (roomId: number) => {
        setFormData((prev) => ({
            ...prev,
            room_ids: prev.room_ids.includes(roomId)
                ? prev.room_ids.filter((id) => id !== roomId)
                : [...prev.room_ids, roomId],
        }));
    };

    const addTopicFilter = () => {
        if (
            selectedTopicFilter &&
            !filterTopicIds.includes(Number(selectedTopicFilter))
        ) {
            setFilterTopicIds([...filterTopicIds, Number(selectedTopicFilter)]);
            setSelectedTopicFilter('');
        }
    };

    const removeTopicFilter = (topicId: number) => {
        setFilterTopicIds(filterTopicIds.filter((id) => id !== topicId));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Announcements</h1>
                    <Button onClick={handleCreate} className="ml-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter by Topics
                        </CardTitle>
                        <CardDescription>
                            Select topics to filter announcements (AND logic -
                            must have all selected topics)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={selectedTopicFilter}
                                onChange={(e) =>
                                    setSelectedTopicFilter(e.target.value)
                                }
                            >
                                <option value="">Select a topic...</option>
                                {topics?.map((topic: Topic) => (
                                    <option
                                        key={topic.topic_id}
                                        value={topic.topic_id}
                                    >
                                        {topic.topic_name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={addTopicFilter}
                                disabled={!selectedTopicFilter}
                            >
                                Add Filter
                            </Button>
                        </div>
                        {filterTopicIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterTopicIds.map((topicId) => {
                                    const topic = topics?.find(
                                        (t: Topic) => t.topic_id === topicId
                                    );
                                    return (
                                        <div
                                            key={topicId}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {topic?.topic_name}
                                            <button
                                                onClick={() =>
                                                    removeTopicFilter(topicId)
                                                }
                                                className="hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="text-center py-8">
                        Loading announcements...
                    </div>
                ) : announcements && announcements.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No announcements found. Create your first
                            announcement!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {announcements?.map((announcement: Announcement) => (
                            <Card
                                key={announcement.announcement_id}
                                className="flex flex-col"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg truncate">
                                                {announcement.title}
                                            </CardTitle>
                                            <span className="text-xs text-muted-foreground">
                                                ID:{' '}
                                                {announcement.announcement_id}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    handleEdit(announcement)
                                                }
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    handleDelete(announcement)
                                                }
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription className="line-clamp-2 text-sm mt-2">
                                        {announcement.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pt-0 space-y-3">
                                    {(announcement.start_date ||
                                        announcement.end_date) && (
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {announcement.start_date && (
                                                <div>
                                                    Start:{' '}
                                                    {format(
                                                        new Date(
                                                            announcement.start_date
                                                        ),
                                                        'MMM d, yyyy h:mm a'
                                                    )}
                                                </div>
                                            )}
                                            {announcement.end_date && (
                                                <div>
                                                    End:{' '}
                                                    {format(
                                                        new Date(
                                                            announcement.end_date
                                                        ),
                                                        'MMM d, yyyy h:mm a'
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {announcement.topics.length > 0 && (
                                        <div>
                                            <div className="text-xs font-medium mb-1">
                                                Topics:
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {announcement.topics.map(
                                                    (topic: Topic) => (
                                                        <span
                                                            key={topic.topic_id}
                                                            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                                                        >
                                                            {topic.topic_name}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {announcement.rooms.length > 0 && (
                                        <div>
                                            <div className="text-xs font-medium mb-1">
                                                Rooms:
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {announcement.rooms.map(
                                                    (room: Room) => (
                                                        <span
                                                            key={room.room_id}
                                                            className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs"
                                                        >
                                                            {room.room_name}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create/Edit/Delete Dialogs - Same as before but with updated handleEdit */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                Fill in the details to create a new announcement
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={4}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">
                                    Start Date (Optional)
                                </Label>
                                <Input
                                    id="start_date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">
                                    End Date (Optional)
                                </Label>
                                <Input
                                    id="end_date"
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Topics (Optional)</Label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                                    {topics?.map((topic: Topic) => (
                                        <div
                                            key={topic.topic_id}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`topic-${topic.topic_id}`}
                                                checked={formData.topic_ids.includes(
                                                    topic.topic_id
                                                )}
                                                onChange={() =>
                                                    toggleTopicSelection(
                                                        topic.topic_id
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                            <label
                                                htmlFor={`topic-${topic.topic_id}`}
                                                className="text-sm"
                                            >
                                                {topic.topic_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Rooms (Optional)</Label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                                    {rooms?.map((room: Room) => (
                                        <div
                                            key={room.room_id}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`room-${room.room_id}`}
                                                checked={formData.room_ids.includes(
                                                    room.room_id
                                                )}
                                                onChange={() =>
                                                    toggleRoomSelection(
                                                        room.room_id
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                            <label
                                                htmlFor={`room-${room.room_id}`}
                                                className="text-sm"
                                            >
                                                {room.room_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitCreate}
                                disabled={
                                    !formData.title ||
                                    !formData.description ||
                                    createMutation.isPending
                                }
                            >
                                {createMutation.isPending
                                    ? 'Creating...'
                                    : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Announcement</DialogTitle>
                            <DialogDescription>
                                Update the announcement details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">
                                    Description *
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={4}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-start_date">
                                    Start Date (Optional)
                                </Label>
                                <Input
                                    id="edit-start_date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-end_date">
                                    End Date (Optional)
                                </Label>
                                <Input
                                    id="edit-end_date"
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Topics (Optional)</Label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                                    {topics?.map((topic: Topic) => (
                                        <div
                                            key={topic.topic_id}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`edit-topic-${topic.topic_id}`}
                                                checked={formData.topic_ids.includes(
                                                    topic.topic_id
                                                )}
                                                onChange={() =>
                                                    toggleTopicSelection(
                                                        topic.topic_id
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                            <label
                                                htmlFor={`edit-topic-${topic.topic_id}`}
                                                className="text-sm"
                                            >
                                                {topic.topic_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Rooms (Optional)</Label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                                    {rooms?.map((room: Room) => (
                                        <div
                                            key={room.room_id}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`edit-room-${room.room_id}`}
                                                checked={formData.room_ids.includes(
                                                    room.room_id
                                                )}
                                                onChange={() =>
                                                    toggleRoomSelection(
                                                        room.room_id
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                            <label
                                                htmlFor={`edit-room-${room.room_id}`}
                                                className="text-sm"
                                            >
                                                {room.room_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitEdit}
                                disabled={
                                    !formData.title ||
                                    !formData.description ||
                                    updateMutation.isPending
                                }
                            >
                                {updateMutation.isPending
                                    ? 'Updating...'
                                    : 'Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Announcement</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "
                                {selectedAnnouncement?.title}"? This action
                                cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSubmitDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
