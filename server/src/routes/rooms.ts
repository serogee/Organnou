import express from 'express';
import {
    getAllRooms,
    getRoomById,
    getRoomsByBuilding,
    createRoom,
    updateRoom,
    deleteRoom,
} from '../controllers/roomsController';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.get('/building/:buildingId', getRoomsByBuilding);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
