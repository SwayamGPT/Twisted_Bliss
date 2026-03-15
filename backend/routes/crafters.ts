import express from 'express';
import { Crafter, Order } from '../models';
import { connectDB } from '../config/db';
import { AuthRequest, createAuditLog, validateBody, crafterSchemaZod } from '../middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const crafters = await Crafter.find();
    res.json(crafters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateBody(crafterSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const crafter = new Crafter(req.body);
    await crafter.save();
    await createAuditLog(req as AuthRequest, 'Created Crafter', `Added new crafter: ${crafter.name}`);
    res.json(crafter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateBody(crafterSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const crafter = await Crafter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Crafter', `Updated details for crafter ID: ${req.params.id}`);
    res.json(crafter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    await Crafter.findByIdAndDelete(req.params.id);
    await Order.deleteMany({ crafterId: req.params.id });
    await createAuditLog(req as AuthRequest, 'Deleted Crafter', `Removed crafter ID: ${req.params.id} and their orders.`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
