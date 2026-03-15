import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import insightsRouter from './routes/insights.js';
import { SyncService } from './services/syncService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/insights', insightsRouter);

// Manual Sync Trigger
app.post('/api/sync', async (req, res) => {
  const syncService = new SyncService();
  try {
    await syncService.sync();
    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
