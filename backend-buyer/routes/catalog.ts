import express from 'express';
import { BuyerCollection } from '../models/index.js';
import { connectDB } from '../config/db.js';

const router = express.Router();

router.get('/collections', async (req, res) => {
  try {
    await connectDB();
    const collections = await BuyerCollection.find({}, { _id: 0 });
    res.json(collections);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch collections: ${err.message}` });
  }
});

export default router;
