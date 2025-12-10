import express from 'express';
import {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../controllers/announcementsController';

const router = express.Router();

router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
