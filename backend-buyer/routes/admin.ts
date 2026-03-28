import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BuyerCollection, BuyerOrder } from '../models/index.js';
import { connectDB } from '../config/db.js';
import { getBuyerCurrentUser, isBuyerAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin middleware to all routes in this router
router.use(getBuyerCurrentUser as express.RequestHandler);
router.use(isBuyerAdmin as express.RequestHandler);

// Collections management
router.get('/collections', async (req, res) => {
  try {
    await connectDB();
    const collections = await BuyerCollection.find({}, { _id: 0 });
    res.json(collections);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to load collections: ${err.message}` });
  }
});

router.post('/collections', async (req, res) => {
  try {
    await connectDB();
    const { id, title, description, image, items } = req.body;
    
    const existing = await BuyerCollection.findOne({ id });
    if (existing) {
      return res.status(409).json({ error: 'Collection id already exists' });
    }

    const collection = new BuyerCollection({ id, title, description, image, items });
    await collection.save();
    res.status(201).json(collection);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create collection: ${err.message}` });
  }
});

router.put('/collections/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (id !== req.body.id) {
      return res.status(400).json({ error: 'Collection id mismatch' });
    }

    const updated = await BuyerCollection.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update collection: ${err.message}` });
  }
});

router.delete('/collections/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const deleted = await BuyerCollection.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to delete collection: ${err.message}` });
  }
});

// Admin manual order creation (for testing or internal use)
router.post('/orders', async (req, res) => {
  try {
    await connectDB();
    const { items, totalAmount, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order items cannot be empty' });
    }
    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than zero' });
    }

    const shortOrderId = `TB-${uuidv4().substring(0, 6).toUpperCase()}`;
    const order = new BuyerOrder({
      order_id: shortOrderId,
      items,
      totalAmount,
      customerEmail,
      status: 'admin_created',
      created_at: new Date(),
      updated_at: new Date()
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order_id: shortOrderId });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create order: ${err.message}` });
  }
});

export default router;
