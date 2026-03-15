import express from 'express';
import { AuditLog } from '../models';
import { connectDB } from '../config/db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
