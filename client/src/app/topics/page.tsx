'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi, Topic } from '@/lib/api';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';

interface TopicFormData {
    topic_name: string;
    parent_topic_id: number | null;
}

interface TopicNode extends Topic {
    children: TopicNode[];
}

export default function TopicsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const [formData, setFormData] = useState<TopicFormData>({
        topic_name: '',
        parent_topic_id: null,
    });

    const { data: topics, isLoading } = useQuery({
        queryKey: ['topics'],
        queryFn: async () => {
            const response = await topicsApi.getAll();
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: TopicFormData) => topicsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
            setIsCreateOpen(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TopicFormData }) =>
            topicsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
            setIsEditOpen(false);
            setSelectedTopic(null);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => topicsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
            setIsDeleteOpen(false);
            setSelectedTopic(null);
        },
    });

    const resetForm = () => {
        setFormData({
            topic_name: '',
            parent_topic_id: null,
        });
    };

    const buildTopicTree = (topics: Topic[]): TopicNode[] => {
        const topicMap = new Map<number, TopicNode>();
        const rootTopics: TopicNode[] = [];

        topics.forEach((topic) => {
            topicMap.set(topic.topic_id, { ...topic, children: [] });
        });

        topics.forEach((topic) => {
            const node = topicMap.get(topic.topic_id)!;
            if (topic.parent_topic_id === null) {
                rootTopics.push(node);
            } else {
                const parent = topicMap.get(topic.parent_topic_id);
                if (parent) {
                    parent.children.push(node);
                } else {
                    rootTopics.push(node);
                }
            }
        });

        return rootTopics;
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !topics) return;

        const { draggableId, destination } = result;
        const topicId = parseInt(draggableId.replace('topic-', ''));
        const newParentId =
            destination.droppableId === 'root'
                ? null
                : parseInt(destination.droppableId.replace('topic-', ''));

        const topic = topics.find((t) => t.topic_id === topicId);
        if (!topic) return;

        // Prevent dropping a topic onto itself or its descendants
        if (newParentId === topicId) return;

        updateMutation.mutate({
            id: topicId,
            data: {
                topic_name: topic.topic_name,
                parent_topic_id: newParentId,
            },
        });
    };

    const renderTopicTree = (
        nodes: TopicNode[],
        level = 0
    ): React.ReactNode => {
        return nodes.map((node, index) => (
            <Draggable
                key={node.topic_id}
                draggableId={`topic-${node.topic_id}`}
                index={index}
            >
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                            ...provided.draggableProps.style,
                            marginLeft: `${level * 24}px`,
                        }}
                    >
                        <Card className="mb-2">
                            <CardContent className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab flex-shrink-0"
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium">
                                            {node.topic_name}
                                        </span>
                                        {node.parent_topic_id && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                                (Child of{' '}
                                                {
                                                    topics?.find(
                                                        (t) =>
                                                            t.topic_id ===
                                                            node.parent_topic_id
                                                    )?.topic_name
                                                }
                                                )
                                            </span>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            ID: {node.topic_id}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(node)}
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(node)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {node.children.length > 0 && (
                            <Droppable
                                droppableId={`topic-${node.topic_id}`}
                                type="TOPIC"
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {renderTopicTree(
                                            node.children,
                                            level + 1
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        )}
                    </div>
                )}
            </Draggable>
        ));
    };

    const handleCreate = () => {
        setIsCreateOpen(true);
        resetForm();
    };

    const handleEdit = (topic: Topic) => {
        setSelectedTopic(topic);
        setFormData({
            topic_name: topic.topic_name,
            parent_topic_id: topic.parent_topic_id,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsDeleteOpen(true);
    };

    const handleSubmitCreate = () => {
        createMutation.mutate(formData);
    };

    const handleSubmitEdit = () => {
        if (selectedTopic) {
            updateMutation.mutate({
                id: selectedTopic.topic_id,
                data: formData,
            });
        }
    };

    const handleSubmitDelete = () => {
        if (selectedTopic) {
            deleteMutation.mutate(selectedTopic.topic_id);
        }
    };

    const topicTree = topics ? buildTopicTree(topics) : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Topics</h1>
                    <Button onClick={handleCreate} className="ml-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Topic
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading topics...</div>
                ) : topics && topics.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No topics found. Create your first topic!
                        </CardContent>
                    </Card>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="root" type="TOPIC">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {renderTopicTree(topicTree)}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Topic</DialogTitle>
                            <DialogDescription>
                                Add a new topic to the system
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="topic_name">Topic Name *</Label>
                                <Input
                                    id="topic_name"
                                    value={formData.topic_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            topic_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter topic name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parent_topic">
                                    Parent Topic (Optional)
                                </Label>
                                <Select
                                    value={
                                        formData.parent_topic_id?.toString() ||
                                        'none'
                                    }
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            parent_topic_id:
                                                value === 'none'
                                                    ? null
                                                    : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None (Root Topic)
                                        </SelectItem>
                                        {topics?.map((topic) => (
                                            <SelectItem
                                                key={topic.topic_id}
                                                value={topic.topic_id.toString()}
                                            >
                                                {topic.topic_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    !formData.topic_name ||
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Topic</DialogTitle>
                            <DialogDescription>
                                Update the topic details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_topic_name">
                                    Topic Name *
                                </Label>
                                <Input
                                    id="edit_topic_name"
                                    value={formData.topic_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            topic_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter topic name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_parent_topic">
                                    Parent Topic (Optional)
                                </Label>
                                <Select
                                    value={
                                        formData.parent_topic_id?.toString() ||
                                        'none'
                                    }
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            parent_topic_id:
                                                value === 'none'
                                                    ? null
                                                    : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None (Root Topic)
                                        </SelectItem>
                                        {topics
                                            ?.filter(
                                                (topic) =>
                                                    topic.topic_id !==
                                                    selectedTopic?.topic_id
                                            )
                                            .map((topic) => (
                                                <SelectItem
                                                    key={topic.topic_id}
                                                    value={topic.topic_id.toString()}
                                                >
                                                    {topic.topic_name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
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
                                    !formData.topic_name ||
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
                            <DialogTitle>Delete Topic</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "
                                {selectedTopic?.topic_name}"? This action cannot
                                be undone.
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
