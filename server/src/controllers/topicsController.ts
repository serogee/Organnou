import { Request, Response } from 'express';
import pool from '../config/database';
import { Topic, ResultSetHeader } from '../types';

export const getAllTopics = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const [rows] = await pool.query<Topic[]>(
            'SELECT * FROM topics ORDER BY topic_name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
};

export const getTopicById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<Topic[]>(
            'SELECT * FROM topics WHERE topic_id = ?',
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Topic not found' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Failed to fetch topic' });
    }
};

export const createTopic = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { topic_name, parent_topic_id } = req.body;

        if (!topic_name) {
            res.status(400).json({ error: 'Topic name is required' });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO topics (topic_name, parent_topic_id) VALUES (?, ?)',
            [topic_name, parent_topic_id || null]
        );

        const [rows] = await pool.query<Topic[]>(
            'SELECT * FROM topics WHERE topic_id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ error: 'Failed to create topic' });
    }
};

export const updateTopic = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { topic_name, parent_topic_id } = req.body;

        if (!topic_name) {
            res.status(400).json({ error: 'Topic name is required' });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE topics SET topic_name = ?, parent_topic_id = ? WHERE topic_id = ?',
            [topic_name, parent_topic_id || null, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Topic not found' });
            return;
        }

        const [rows] = await pool.query<Topic[]>(
            'SELECT * FROM topics WHERE topic_id = ?',
            [id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Failed to update topic' });
    }
};

export const deleteTopic = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM topics WHERE topic_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Topic not found' });
            return;
        }

        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ error: 'Failed to delete topic' });
    }
};
