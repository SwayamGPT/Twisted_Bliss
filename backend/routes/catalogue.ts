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

export default router;
