import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BuyerOrder } from '../models/index.js';
import { connectDB } from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await connectDB();
    const { items, totalAmount, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    const shortOrderId = `TB-${uuidv4().substring(0, 6).toUpperCase()}`;
    const order = new BuyerOrder({
      order_id: shortOrderId,
      items,
      totalAmount,
      customerEmail,
      status: 'created',
      created_at: new Date(),
      updated_at: new Date()
    });

    await order.save();
    res.status(201).json({ message: 'Order saved successfully', order_id: shortOrderId });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create order: ${err.message}` });
  }
});

export default router;
