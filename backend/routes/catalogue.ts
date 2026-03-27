import express from 'express';
import { Catalogue, AuditLog } from '../models/index.js';

const router = express.Router();

// Get internal (Admin) catalogue if needed, though they usually use /api/public/catalogue.
router.get('/', async (req, res) => {
  try {
    const items = await Catalogue.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new product to catalogue (Admin protected endpoint)
router.post('/', async (req: any, res) => {
  try {
    const newItem = new Catalogue(req.body);
    await newItem.save();
    
    if (req.user) {
      await new AuditLog({
        userId: req.user._id,
        userName: req.user.name || 'Admin',
        action: 'Added Catalogue Product',
        details: newItem.name
      }).save();
    }
    
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.put('/:id', async (req: any, res) => {
  try {
    const updated = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    
    if (req.user) {
      await new AuditLog({
        userId: req.user._id,
        userName: req.user.name || 'Admin',
        action: 'Updated Catalogue Product',
        details: updated.name
      }).save();
    }
    
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.delete('/:id', async (req: any, res) => {
  try {
    const deleted = await Catalogue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    
    if (req.user) {
      await new AuditLog({
        userId: req.user._id,
        userName: req.user.name || 'Admin',
        action: 'Deleted Catalogue Product',
        details: deleted.name
      }).save();
    }
    
    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
