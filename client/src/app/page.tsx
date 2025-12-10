'use client';

import { useQuery } from '@tanstack/react-query';
import { announcementsApi, topicsApi, buildingsApi, roomsApi } from '@/lib/api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Building2,
    MessageSquare,
    Tag,
    DoorOpen,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
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

    const { data: buildings } = useQuery({
        queryKey: ['buildings'],
        queryFn: async () => {
            const response = await buildingsApi.getAll();
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Organnou: Classroom Announcement System
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Manage announcements, topics, buildings, and rooms
                        efficiently
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Announcements
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {announcements?.length || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Topics
                            </CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {topics?.length || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Buildings
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {buildings?.length || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {rooms?.length || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        <Link href="/announcements">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <MessageSquare className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle>Announcements</CardTitle>
                                    <CardDescription>
                                        Create and manage announcements with
                                        topics and rooms
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/calendar">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle>Calendar</CardTitle>
                                    <CardDescription>
                                        Create and manage announcements with
                                        calendar view
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/topics">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                        <Tag className="w-6 h-6 text-green-600" />
                                    </div>
                                    <CardTitle>Topics</CardTitle>
                                    <CardDescription>
                                        Organize topics in a hierarchical tree
                                        structure
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/buildings">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                        <Building2 className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <CardTitle>Buildings & Rooms</CardTitle>
                                    <CardDescription>
                                        Manage buildings and their associated
                                        rooms
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
