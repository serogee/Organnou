import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import topicsRouter from './routes/topics';
import buildingsRouter from './routes/buildings';
import roomsRouter from './routes/rooms';
import announcementsRouter from './routes/announcements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/topics', topicsRouter);
app.use('/api/buildings', buildingsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/announcements', announcementsRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
