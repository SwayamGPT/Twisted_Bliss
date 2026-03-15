import express from 'express';
import { InventoryItem } from '../models/index.js';
import { connectDB } from '../config/db.js';
import { AuthRequest, createAuditLog, validateBody, inventoryItemSchemaZod } from '../middleware/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateBody(inventoryItemSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const item = new InventoryItem(req.body);
    await item.save();
    await createAuditLog(req as AuthRequest, 'Added Inventory Item', `Added ${item.quantity} ${item.unit} of ${item.name}`);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateBody(inventoryItemSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Inventory Item', `Updated item ID: ${req.params.id}`);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    await InventoryItem.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Inventory Item', `Removed item ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
