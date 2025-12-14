import { Request, Response } from 'express';
import pool from '../config/database';
import { Building, ResultSetHeader } from '../types';

export const getAllBuildings = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const [rows] = await pool.query<Building[]>(
            'SELECT * FROM building ORDER BY building_name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        res.status(500).json({ error: 'Failed to fetch buildings' });
    }
};

export const getBuildingById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<Building[]>(
            'SELECT * FROM building WHERE building_id = ?',
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Building not found' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching building:', error);
        res.status(500).json({ error: 'Failed to fetch building' });
    }
};

export const createBuilding = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { building_name } = req.body;

        if (!building_name) {
            res.status(400).json({ error: 'Building name is required' });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO building (building_name) VALUES (?)',
            [building_name]
        );

        const [rows] = await pool.query<Building[]>(
            'SELECT * FROM building WHERE building_id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating building:', error);
        res.status(500).json({ error: 'Failed to create building' });
    }
};

export const updateBuilding = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { building_name } = req.body;

        if (!building_name) {
            res.status(400).json({ error: 'Building name is required' });
            return;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE building SET building_name = ? WHERE building_id = ?',
            [building_name, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Building not found' });
            return;
        }

        const [rows] = await pool.query<Building[]>(
            'SELECT * FROM building WHERE building_id = ?',
            [id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating building:', error);
        res.status(500).json({ error: 'Failed to update building' });
    }
};

export const deleteBuilding = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM building WHERE building_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Building not found' });
            return;
        }

        res.json({ message: 'Building deleted successfully' });
    } catch (error) {
        console.error('Error deleting building:', error);
        res.status(500).json({ error: 'Failed to delete building' });
    }
};
