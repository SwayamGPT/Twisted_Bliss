import express from 'express';
import { CustomerOrder } from '../models';
import { connectDB } from '../config/db';
import { AuthRequest, createAuditLog, validateBody, customerOrderSchemaZod } from '../middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const orders = await CustomerOrder.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateBody(customerOrderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = new CustomerOrder(req.body);
    await order.save();
    await createAuditLog(req as AuthRequest, 'Created Customer Order', `Added order for customer: ${order.customerName}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateBody(customerOrderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = await CustomerOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Customer Order', `Updated order ID: ${req.params.id}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    await CustomerOrder.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Customer Order', `Deleted order ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
