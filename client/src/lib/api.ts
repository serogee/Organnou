import axios from 'axios';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface Topic {
    topic_id: number;
    topic_name: string;
    parent_topic_id: number | null;
}

export interface Building {
    building_id: number;
    building_name: string;
}

export interface Room {
    room_id: number;
    room_name: string;
    building_id: number;
}

export interface Announcement {
    announcement_id: number;
    title: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    topics: Topic[];
    rooms: Room[];
}

export interface CreateAnnouncementData {
    title: string;
    description: string;
    start_date?: string | null;
    end_date?: string | null;
    topic_ids?: number[];
    room_ids?: number[];
}

export interface UpdateAnnouncementData extends CreateAnnouncementData {
    announcement_id: number;
}

// API functions
export const topicsApi = {
    getAll: () => api.get<Topic[]>('/topics'),
    getById: (id: number) => api.get<Topic>(`/topics/${id}`),
    create: (data: { topic_name: string; parent_topic_id?: number | null }) =>
        api.post<Topic>('/topics', data),
    update: (
        id: number,
        data: { topic_name: string; parent_topic_id?: number | null }
    ) => api.put<Topic>(`/topics/${id}`, data),
    delete: (id: number) => api.delete(`/topics/${id}`),
};

export const buildingsApi = {
    getAll: () => api.get<Building[]>('/buildings'),
    getById: (id: number) => api.get<Building>(`/buildings/${id}`),
    create: (data: { building_name: string }) =>
        api.post<Building>('/buildings', data),
    update: (id: number, data: { building_name: string }) =>
        api.put<Building>(`/buildings/${id}`, data),
    delete: (id: number) => api.delete(`/buildings/${id}`),
};

export const roomsApi = {
    getAll: () => api.get<Room[]>('/rooms'),
    getById: (id: number) => api.get<Room>(`/rooms/${id}`),
    getByBuilding: (buildingId: number) =>
        api.get<Room[]>(`/rooms/building/${buildingId}`),
    create: (data: { room_name: string; building_id: number }) =>
        api.post<Room>('/rooms', data),
    update: (id: number, data: { room_name: string; building_id: number }) =>
        api.put<Room>(`/rooms/${id}`, data),
    delete: (id: number) => api.delete(`/rooms/${id}`),
};

export const announcementsApi = {
    getAll: (topicIds?: number[]) => {
        const params =
            topicIds && topicIds.length > 0
                ? { topicIds: topicIds.join(',') }
                : {};
        return api.get<Announcement[]>('/announcements', { params });
    },
    getById: (id: number) => api.get<Announcement>(`/announcements/${id}`),
    create: (data: CreateAnnouncementData) =>
        api.post<Announcement>('/announcements', data),
    update: (id: number, data: CreateAnnouncementData) =>
        api.put<Announcement>(`/announcements/${id}`, data),
    delete: (id: number) => api.delete(`/announcements/${id}`),
};
