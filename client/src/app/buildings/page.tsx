'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingsApi, roomsApi, Building, Room } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pencil, Trash2, Plus, Building2, DoorOpen } from 'lucide-react';

interface BuildingFormData {
    building_name: string;
}

interface RoomFormData {
    room_name: string;
    building_id: number;
}

export default function BuildingsPage() {
    const queryClient = useQueryClient();
    const [isBuildingCreateOpen, setIsBuildingCreateOpen] = useState(false);
    const [isBuildingEditOpen, setIsBuildingEditOpen] = useState(false);
    const [isBuildingDeleteOpen, setIsBuildingDeleteOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
        null
    );

    const [isRoomCreateOpen, setIsRoomCreateOpen] = useState(false);
    const [isRoomEditOpen, setIsRoomEditOpen] = useState(false);
    const [isRoomDeleteOpen, setIsRoomDeleteOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const [buildingFormData, setBuildingFormData] = useState<BuildingFormData>({
        building_name: '',
    });

    const [roomFormData, setRoomFormData] = useState<RoomFormData>({
        room_name: '',
        building_id: 0,
    });

    const { data: buildings, isLoading: buildingsLoading } = useQuery({
        queryKey: ['buildings'],
        queryFn: async () => {
            const response = await buildingsApi.getAll();
            return response.data;
        },
    });

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await roomsApi.getAll();
            return response.data;
        },
    });

    const createBuildingMutation = useMutation({
        mutationFn: (data: BuildingFormData) => buildingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildings'] });
            setIsBuildingCreateOpen(false);
            resetBuildingForm();
        },
    });

    const updateBuildingMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: BuildingFormData }) =>
            buildingsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildings'] });
            setIsBuildingEditOpen(false);
            setSelectedBuilding(null);
            resetBuildingForm();
        },
    });

    const deleteBuildingMutation = useMutation({
        mutationFn: (id: number) => buildingsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildings'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsBuildingDeleteOpen(false);
            setSelectedBuilding(null);
        },
    });

    const createRoomMutation = useMutation({
        mutationFn: (data: RoomFormData) => roomsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsRoomCreateOpen(false);
            resetRoomForm();
        },
    });

    const updateRoomMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: RoomFormData }) =>
            roomsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsRoomEditOpen(false);
            setSelectedRoom(null);
            resetRoomForm();
        },
    });

    const deleteRoomMutation = useMutation({
        mutationFn: (id: number) => roomsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsRoomDeleteOpen(false);
            setSelectedRoom(null);
        },
    });

    const resetBuildingForm = () => {
        setBuildingFormData({ building_name: '' });
    };

    const resetRoomForm = () => {
        setRoomFormData({ room_name: '', building_id: 0 });
    };

    const handleCreateBuilding = () => {
        setIsBuildingCreateOpen(true);
        resetBuildingForm();
    };

    const handleEditBuilding = (building: Building) => {
        setSelectedBuilding(building);
        setBuildingFormData({ building_name: building.building_name });
        setIsBuildingEditOpen(true);
    };

    const handleDeleteBuilding = (building: Building) => {
        setSelectedBuilding(building);
        setIsBuildingDeleteOpen(true);
    };

    const handleSubmitCreateBuilding = () => {
        createBuildingMutation.mutate(buildingFormData);
    };

    const handleSubmitEditBuilding = () => {
        if (selectedBuilding) {
            updateBuildingMutation.mutate({
                id: selectedBuilding.building_id,
                data: buildingFormData,
            });
        }
    };

    const handleSubmitDeleteBuilding = () => {
        if (selectedBuilding) {
            deleteBuildingMutation.mutate(selectedBuilding.building_id);
        }
    };

    const handleCreateRoom = (buildingId: number) => {
        setRoomFormData({ room_name: '', building_id: buildingId });
        setIsRoomCreateOpen(true);
    };

    const handleEditRoom = (room: Room) => {
        setSelectedRoom(room);
        setRoomFormData({
            room_name: room.room_name,
            building_id: room.building_id,
        });
        setIsRoomEditOpen(true);
    };

    const handleDeleteRoom = (room: Room) => {
        setSelectedRoom(room);
        setIsRoomDeleteOpen(true);
    };

    const handleSubmitCreateRoom = () => {
        createRoomMutation.mutate(roomFormData);
    };

    const handleSubmitEditRoom = () => {
        if (selectedRoom) {
            updateRoomMutation.mutate({
                id: selectedRoom.room_id,
                data: roomFormData,
            });
        }
    };

    const handleSubmitDeleteRoom = () => {
        if (selectedRoom) {
            deleteRoomMutation.mutate(selectedRoom.room_id);
        }
    };

    const getRoomsByBuilding = (buildingId: number): Room[] => {
        return rooms?.filter((room) => room.building_id === buildingId) || [];
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Buildings & Rooms</h1>
                    <Button onClick={handleCreateBuilding} className="ml-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Building
                    </Button>
                </div>

                {buildingsLoading || roomsLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : buildings && buildings.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No buildings found. Create your first building!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {buildings?.map((building) => {
                            const buildingRooms = getRoomsByBuilding(
                                building.building_id
                            );
                            return (
                                <Card key={building.building_id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {building.building_name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        ID:{' '}
                                                        {building.building_id} •{' '}
                                                        {buildingRooms.length}{' '}
                                                        room
                                                        {buildingRooms.length !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleCreateRoom(
                                                            building.building_id
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleEditBuilding(
                                                            building
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleDeleteBuilding(
                                                            building
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {buildingRooms.length === 0 ? (
                                            <div className="text-center py-3 text-muted-foreground text-sm">
                                                No rooms in this building yet
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                {buildingRooms.map((room) => (
                                                    <div
                                                        key={room.room_id}
                                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <DoorOpen className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm font-medium">
                                                                {room.room_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ID:{' '}
                                                                {room.room_id}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() =>
                                                                    handleEditRoom(
                                                                        room
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() =>
                                                                    handleDeleteRoom(
                                                                        room
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Dialogs remain the same */}
                <Dialog
                    open={isBuildingCreateOpen}
                    onOpenChange={setIsBuildingCreateOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Building</DialogTitle>
                            <DialogDescription>
                                Add a new building to the system
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="building_name">
                                    Building Name *
                                </Label>
                                <Input
                                    id="building_name"
                                    value={buildingFormData.building_name}
                                    onChange={(e) =>
                                        setBuildingFormData({
                                            ...buildingFormData,
                                            building_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter building name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsBuildingCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitCreateBuilding}
                                disabled={
                                    !buildingFormData.building_name ||
                                    createBuildingMutation.isPending
                                }
                            >
                                {createBuildingMutation.isPending
                                    ? 'Creating...'
                                    : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isBuildingEditOpen}
                    onOpenChange={setIsBuildingEditOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Building</DialogTitle>
                            <DialogDescription>
                                Update the building details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_building_name">
                                    Building Name *
                                </Label>
                                <Input
                                    id="edit_building_name"
                                    value={buildingFormData.building_name}
                                    onChange={(e) =>
                                        setBuildingFormData({
                                            ...buildingFormData,
                                            building_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter building name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsBuildingEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitEditBuilding}
                                disabled={
                                    !buildingFormData.building_name ||
                                    updateBuildingMutation.isPending
                                }
                            >
                                {updateBuildingMutation.isPending
                                    ? 'Updating...'
                                    : 'Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isBuildingDeleteOpen}
                    onOpenChange={setIsBuildingDeleteOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Building</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "
                                {selectedBuilding?.building_name}"? This will
                                also delete all rooms in this building. This
                                action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsBuildingDeleteOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSubmitDeleteBuilding}
                                disabled={deleteBuildingMutation.isPending}
                            >
                                {deleteBuildingMutation.isPending
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isRoomCreateOpen}
                    onOpenChange={setIsRoomCreateOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Room</DialogTitle>
                            <DialogDescription>
                                Add a new room to{' '}
                                {
                                    buildings?.find(
                                        (b) =>
                                            b.building_id ===
                                            roomFormData.building_id
                                    )?.building_name
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="room_name">Room Name *</Label>
                                <Input
                                    id="room_name"
                                    value={roomFormData.room_name}
                                    onChange={(e) =>
                                        setRoomFormData({
                                            ...roomFormData,
                                            room_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter room name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsRoomCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitCreateRoom}
                                disabled={
                                    !roomFormData.room_name ||
                                    createRoomMutation.isPending
                                }
                            >
                                {createRoomMutation.isPending
                                    ? 'Creating...'
                                    : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isRoomEditOpen} onOpenChange={setIsRoomEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Room</DialogTitle>
                            <DialogDescription>
                                Update the room details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_room_name">
                                    Room Name *
                                </Label>
                                <Input
                                    id="edit_room_name"
                                    value={roomFormData.room_name}
                                    onChange={(e) =>
                                        setRoomFormData({
                                            ...roomFormData,
                                            room_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter room name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_building">
                                    Building *
                                </Label>
                                <select
                                    id="edit_building"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={roomFormData.building_id}
                                    onChange={(e) =>
                                        setRoomFormData({
                                            ...roomFormData,
                                            building_id: Number(e.target.value),
                                        })
                                    }
                                >
                                    {buildings?.map((building) => (
                                        <option
                                            key={building.building_id}
                                            value={building.building_id}
                                        >
                                            {building.building_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsRoomEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitEditRoom}
                                disabled={
                                    !roomFormData.room_name ||
                                    updateRoomMutation.isPending
                                }
                            >
                                {updateRoomMutation.isPending
                                    ? 'Updating...'
                                    : 'Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isRoomDeleteOpen}
                    onOpenChange={setIsRoomDeleteOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Room</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "
                                {selectedRoom?.room_name}"? This action cannot
                                be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsRoomDeleteOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSubmitDeleteRoom}
                                disabled={deleteRoomMutation.isPending}
                            >
                                {deleteRoomMutation.isPending
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
