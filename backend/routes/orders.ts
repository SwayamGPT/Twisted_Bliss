import express from 'express';
import { Order } from '../models';
import { connectDB } from '../config/db';
import { AuthRequest, createAuditLog, validateBody, orderSchemaZod } from '../middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateBody(orderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = new Order(req.body);
    await order.save();
    await createAuditLog(req as AuthRequest, 'Created Crafter Order', `Added order for piece: ${order.piece}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateBody(orderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Crafter Order', `Updated order ID: ${req.params.id}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    await Order.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Crafter Order', `Deleted order ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
