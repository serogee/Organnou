'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    announcementsApi,
    topicsApi,
    roomsApi,
    Announcement,
    Topic,
    Room,
} from '@/lib/api';
import {
    Calendar,
    dateFnsLocalizer,
    Views,
    View,
    SlotInfo,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: Announcement;
    isDeadline: boolean;
}

interface AnnouncementFormData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    topic_ids: number[];
    room_ids: number[];
}

export default function CalendarPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<Announcement | null>(null);
    const [isDeadlineOnly, setIsDeadlineOnly] = useState(false);
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        topic_ids: [],
        room_ids: [],
    });

    const { data: announcements } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const response = await announcementsApi.getAll();
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

    const events: CalendarEvent[] = useMemo(() => {
        if (!announcements) return [];

        return announcements
            .filter((a) => a.end_date) // Only show announcements with end_date (deadline)
            .map((announcement) => {
                const hasStartDate = !!announcement.start_date;
                const endDate = new Date(announcement.end_date!);
                const startDate = hasStartDate
                    ? new Date(announcement.start_date!)
                    : endDate; // Use end_date as display point for deadline-only

                return {
                    id: announcement.announcement_id,
                    title: announcement.title,
                    start: startDate,
                    end: endDate,
                    resource: announcement,
                    isDeadline: !hasStartDate,
                };
            });
    }, [announcements]);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            topic_ids: [],
            room_ids: [],
        });
        setIsDeadlineOnly(false);
    };

    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        const start = slotInfo.start;
        const end = slotInfo.end;

        // Check if user dragged (selected a time range) or just clicked
        const isDragged = start.getTime() !== end.getTime();

        if (isDragged) {
            // User dragged - fill both start and end dates
            setIsDeadlineOnly(false);
            setFormData({
                title: '',
                description: '',
                start_date: format(start, "yyyy-MM-dd'T'HH:mm"),
                end_date: format(end, "yyyy-MM-dd'T'HH:mm"),
                topic_ids: [],
                room_ids: [],
            });
        } else {
            // User just clicked - only deadline (end date)
            setIsDeadlineOnly(true);
            setFormData({
                title: '',
                description: '',
                start_date: '',
                end_date: format(start, "yyyy-MM-dd'T'HH:mm"),
                topic_ids: [],
                room_ids: [],
            });
        }

        setIsCreateOpen(true);
    }, []);

    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            const announcement = event.resource;
            setSelectedAnnouncement(announcement);

            const validTopicIds = announcement.topics
                .map((t: Topic) => t.topic_id)
                .filter((id) => topics?.some((t) => t.topic_id === id));
            const validRoomIds = announcement.rooms
                .map((r: Room) => r.room_id)
                .filter((id) => rooms?.some((r) => r.room_id === id));

            setIsDeadlineOnly(!announcement.start_date);

            // Format dates properly for datetime-local input
            const formatForInput = (dateStr: string | null) => {
                if (!dateStr) return '';
                // Handle both ISO format and other formats
                try {
                    const date = new Date(dateStr);
                    // Format as YYYY-MM-DDTHH:mm (required for datetime-local input)
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                } catch (e) {
                    return '';
                }
            };

            setFormData({
                title: announcement.title,
                description: announcement.description,
                start_date: formatForInput(announcement.start_date),
                end_date: formatForInput(announcement.end_date),
                topic_ids: validTopicIds,
                room_ids: validRoomIds,
            });
            setIsEditOpen(true);
        },
        [topics, rooms]
    );

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

    const eventStyleGetter = (event: CalendarEvent) => {
        const style: React.CSSProperties = {
            backgroundColor: event.isDeadline ? '#dc2626' : '#3b82f6',
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
        };
        return { style };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold">Calendar View</h1>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">How to use:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                <strong>Click any date</strong> to create a
                                deadline-only announcement (shown in red)
                            </li>
                            <li>
                                <strong>Drag across dates/times</strong> to
                                create an announcement with start and end dates
                                (shown in blue)
                            </li>
                            <li>
                                <strong>Click an event</strong> to view, edit,
                                or delete it
                            </li>
                            <li>
                                <strong>Blue events</strong> have both start and
                                end dates
                            </li>
                            <li>
                                <strong>Red events</strong> are deadline-only
                                announcements
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="bg-white p-4 rounded-lg shadow"
                    style={{
                        height: 'calc(100vh - 280px)',
                        minHeight: '500px',
                    }}
                >
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        views={[
                            Views.MONTH,
                            Views.WEEK,
                            Views.DAY,
                            Views.AGENDA,
                        ]}
                        view={currentView}
                        onView={setCurrentView}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        eventPropGetter={eventStyleGetter}
                        popup
                    />
                </div>

                {/* Create Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                {isDeadlineOnly
                                    ? 'Creating a deadline-only announcement. You can add a start date below to create a duration.'
                                    : "Creating an announcement with a duration. Uncheck 'Add start date' to make it deadline-only."}
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
                                    placeholder="Enter announcement title"
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
                                    placeholder="Enter announcement description"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        id="add-start-date"
                                        checked={!isDeadlineOnly}
                                        onChange={(e) => {
                                            setIsDeadlineOnly(
                                                !e.target.checked
                                            );
                                            if (!e.target.checked) {
                                                setFormData({
                                                    ...formData,
                                                    start_date: '',
                                                });
                                            }
                                        }}
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="add-start-date"
                                        className="cursor-pointer"
                                    >
                                        Add start date (optional)
                                    </Label>
                                </div>
                                {!isDeadlineOnly && (
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
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Deadline *</Label>
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
                                    !formData.end_date ||
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

                {/* Edit Dialog */}
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
                                    placeholder="Enter announcement title"
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
                                    placeholder="Enter announcement description"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        id="edit-add-start-date"
                                        checked={!isDeadlineOnly}
                                        onChange={(e) => {
                                            setIsDeadlineOnly(
                                                !e.target.checked
                                            );
                                            if (!e.target.checked) {
                                                setFormData({
                                                    ...formData,
                                                    start_date: '',
                                                });
                                            }
                                        }}
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="edit-add-start-date"
                                        className="cursor-pointer"
                                    >
                                        Add start date (optional)
                                    </Label>
                                </div>
                                {!isDeadlineOnly && (
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
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-end_date">
                                    Deadline *
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
                                variant="destructive"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setIsDeleteOpen(true);
                                }}
                                className="mr-auto"
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={handleSubmitEdit}
                                disabled={
                                    !formData.title ||
                                    !formData.description ||
                                    !formData.end_date ||
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

                {/* Delete Dialog */}
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
