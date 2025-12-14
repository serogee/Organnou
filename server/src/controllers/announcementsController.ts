import { Request, Response } from 'express';
import pool from '../config/database';
import {
    Announcement,
    Topic,
    Room,
    AnnouncementWithRelations,
    ResultSetHeader,
} from '../types';
import { RowDataPacket } from 'mysql2';

// Helper function to get all descendant topic IDs recursively
const getDescendantTopics = async (topicId: number): Promise<number[]> => {
    const descendants: number[] = [topicId];
    const [children] = await pool.query<Topic[]>(
        'SELECT topic_id FROM topic WHERE parent_topic_id = ?',
        [topicId]
    );

    for (const child of children) {
        const childDescendants = await getDescendantTopics(child.topic_id);
        descendants.push(...childDescendants);
    }

    return descendants;
};

export const getAllAnnouncements = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const topicIds = req.query.topicIds as string | undefined;

        let query = 'SELECT DISTINCT a.* FROM announcement a';
        const params: number[] = [];

        if (topicIds) {
            const topicIdArray = topicIds.split(',').map(Number);

            // For each requested topic, get all descendants (including the parent itself)
            const expandedTopicSets: number[][] = [];
            for (const topicId of topicIdArray) {
                const descendants = await getDescendantTopics(topicId);
                expandedTopicSets.push(descendants);
            }

            // Build query with AND logic - announcement must have at least one topic from each set
            query += ' WHERE ';
            const conditions: string[] = [];

            for (let i = 0; i < expandedTopicSets.length; i++) {
                const topicSet = expandedTopicSets[i];
                const placeholders = topicSet.map(() => '?').join(',');
                conditions.push(`a.announcement_id IN (
          SELECT announcement_id FROM announcement_topic 
          WHERE topic_id IN (${placeholders})
        )`);
                params.push(...topicSet);
            }

            query += conditions.join(' AND ');
        }

        query += ' ORDER BY a.created_at DESC';

        const [announcements] = await pool.query<Announcement[]>(query, params);

        const announcementsWithDetails: AnnouncementWithRelations[] =
            await Promise.all(
                announcements.map(async (announcement) => {
                    const [topics] = await pool.query<Topic[]>(
                        `SELECT t.* FROM topic t
           INNER JOIN announcement_topic at ON t.topic_id = at.topic_id
           WHERE at.announcement_id = ?`,
                        [announcement.announcement_id]
                    );

                    const [rooms] = await pool.query<Room[]>(
                        `SELECT r.* FROM room r
           INNER JOIN announcement_room ar ON r.room_id = ar.room_id
           WHERE ar.announcement_id = ?`,
                        [announcement.announcement_id]
                    );

                    return { ...announcement, topics, rooms };
                })
            );

        res.json(announcementsWithDetails);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

export const getAnnouncementById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query<Announcement[]>(
            'SELECT * FROM announcement WHERE announcement_id = ?',
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Announcement not found' });
            return;
        }

        const announcement = rows[0];

        const [topics] = await pool.query<Topic[]>(
            `SELECT t.* FROM topic t
            INNER JOIN announcement_topic at ON t.topic_id = at.topic_id
            WHERE at.announcement_id = ?`,
            [id]
        );

        const [rooms] = await pool.query<Room[]>(
            `SELECT r.* FROM room r
            INNER JOIN announcement_room ar ON r.room_id = ar.room_id
            WHERE ar.announcement_id = ?`,
            [id]
        );

        const result: AnnouncementWithRelations = {
            ...announcement,
            topics,
            rooms,
        };
        res.json(result);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ error: 'Failed to fetch announcement' });
    }
};

export const createAnnouncement = async (
    req: Request,
    res: Response
): Promise<void> => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            title,
            description,
            start_date,
            end_date,
            topic_ids,
            room_ids,
        } = req.body;

        if (!title || !description) {
            res.status(400).json({
                error: 'Title and description are required',
            });
            await connection.rollback();
            return;
        }

        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO announcement (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
            [title, description, start_date || null, end_date || null]
        );

        const announcementId = result.insertId;

        // Insert topics
        if (topic_ids && Array.isArray(topic_ids) && topic_ids.length > 0) {
            const topicValues = topic_ids.map((topicId: number) => [
                announcementId,
                topicId,
            ]);
            await connection.query(
                'INSERT INTO announcement_topic (announcement_id, topic_id) VALUES ?',
                [topicValues]
            );
        }

        // Insert rooms
        if (room_ids && Array.isArray(room_ids) && room_ids.length > 0) {
            const roomValues = room_ids.map((roomId: number) => [
                announcementId,
                roomId,
            ]);
            await connection.query(
                'INSERT INTO announcement_room (announcement_id, room_id) VALUES ?',
                [roomValues]
            );
        }

        await connection.commit();

        const [rows] = await pool.query<Announcement[]>(
            'SELECT * FROM announcement WHERE announcement_id = ?',
            [announcementId]
        );

        const [topics] = await pool.query<Topic[]>(
            `SELECT t.* FROM topic t
            INNER JOIN announcement_topic at ON t.topic_id = at.topic_id
            WHERE at.announcement_id = ?`,
            [announcementId]
        );

        const [rooms] = await pool.query<Room[]>(
            `SELECT r.* FROM room r
            INNER JOIN announcement_room ar ON r.room_id = ar.room_id
            WHERE ar.announcement_id = ?`,
            [announcementId]
        );

        const newAnnouncement: AnnouncementWithRelations = {
            ...rows[0],
            topics,
            rooms,
        };
        res.status(201).json(newAnnouncement);
    } catch (error) {
        await connection.rollback();
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    } finally {
        connection.release();
    }
};

export const updateAnnouncement = async (
    req: Request,
    res: Response
): Promise<void> => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            title,
            description,
            start_date,
            end_date,
            topic_ids,
            room_ids,
        } = req.body;

        if (!title || !description) {
            res.status(400).json({
                error: 'Title and description are required',
            });
            await connection.rollback();
            return;
        }

        const [result] = await connection.query<ResultSetHeader>(
            'UPDATE announcement SET title = ?, description = ?, start_date = ?, end_date = ? WHERE announcement_id = ?',
            [title, description, start_date || null, end_date || null, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Announcement not found' });
            await connection.rollback();
            return;
        }

        // Delete existing topics and rooms
        await connection.query(
            'DELETE FROM announcement_topic WHERE announcement_id = ?',
            [id]
        );
        await connection.query(
            'DELETE FROM announcement_room WHERE announcement_id = ?',
            [id]
        );

        // Insert new topics
        if (topic_ids && Array.isArray(topic_ids) && topic_ids.length > 0) {
            const topicValues = topic_ids.map((topicId: number) => [
                id,
                topicId,
            ]);
            await connection.query(
                'INSERT INTO announcement_topic (announcement_id, topic_id) VALUES ?',
                [topicValues]
            );
        }

        // Insert new rooms
        if (room_ids && Array.isArray(room_ids) && room_ids.length > 0) {
            const roomValues = room_ids.map((roomId: number) => [id, roomId]);
            await connection.query(
                'INSERT INTO announcement_room (announcement_id, room_id) VALUES ?',
                [roomValues]
            );
        }

        await connection.commit();

        const [rows] = await pool.query<Announcement[]>(
            'SELECT * FROM announcement WHERE announcement_id = ?',
            [id]
        );

        const [topics] = await pool.query<Topic[]>(
            `SELECT t.* FROM topic t
            INNER JOIN announcement_topic at ON t.topic_id = at.topic_id
            WHERE at.announcement_id = ?`,
            [id]
        );

        const [rooms] = await pool.query<Room[]>(
            `SELECT r.* FROM room r
            INNER JOIN announcement_room ar ON r.room_id = ar.room_id
            WHERE ar.announcement_id = ?`,
            [id]
        );

        const updatedAnnouncement: AnnouncementWithRelations = {
            ...rows[0],
            topics,
            rooms,
        };
        res.json(updatedAnnouncement);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating announcement:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
    } finally {
        connection.release();
    }
};

export const deleteAnnouncement = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM announcement WHERE announcement_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Announcement not found' });
            return;
        }

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
};
