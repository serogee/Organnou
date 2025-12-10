import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Topic extends RowDataPacket {
    topic_id: number;
    topic_name: string;
    parent_topic_id: number | null;
}

export interface Building extends RowDataPacket {
    building_id: number;
    building_name: string;
}

export interface Room extends RowDataPacket {
    room_id: number;
    room_name: string;
    building_id: number;
}

export interface Announcement extends RowDataPacket {
    announcement_id: number;
    title: string;
    description: string;
    start_date: Date | null;
    end_date: Date | null;
    created_at: Date;
}

export interface AnnouncementWithRelations extends Announcement {
    topics: Topic[];
    rooms: Room[];
}

export { ResultSetHeader };
