import { Request, Response } from 'express';
import pool from '../config/database';
import { Room, ResultSetHeader } from '../types';

export const getAllRooms = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const [rows] = await pool.query<Room[]>(
            'SELECT * FROM room ORDER BY room_name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

export const getRoomById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<Room[]>(
            'SELECT * FROM room WHERE room_id = ?',
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};

export const getRoomsByBuilding = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { buildingId } = req.params;
        const [rows] = await pool.query<Room[]>(
            'SELECT * FROM room WHERE building_id = ? ORDER BY room_name',
            [buildingId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rooms by building:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

export const createRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { room_name, building_id } = req.body;

        if (!room_name || !building_id) {
            res.status(400).json({
                error: 'Room name and building ID are required',
            });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO room (room_name, building_id) VALUES (?, ?)',
            [room_name, building_id]
        );

        const [rows] = await pool.query<Room[]>(
            'SELECT * FROM room WHERE room_id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

export const updateRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { room_name, building_id } = req.body;

        if (!room_name || !building_id) {
            res.status(400).json({
                error: 'Room name and building ID are required',
            });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE room SET room_name = ?, building_id = ? WHERE room_id = ?',
            [room_name, building_id, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const [rows] = await pool.query<Room[]>(
            'SELECT * FROM room WHERE room_id = ?',
            [id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Failed to update room' });
    }
};

export const deleteRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM room WHERE room_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};
