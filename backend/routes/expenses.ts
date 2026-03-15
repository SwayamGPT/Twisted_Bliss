import express from 'express';
import { Expense } from '../models';
import { connectDB } from '../config/db';
import { AuthRequest, createAuditLog, validateBody, expenseSchemaZod } from '../middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateBody(expenseSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const expense = new Expense(req.body);
    await expense.save();
    await createAuditLog(req as AuthRequest, 'Logged Expense', `Amount: ₹${expense.amount}, Desc: ${expense.description}`);
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateBody(expenseSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Expense', `Updated expense ID: ${req.params.id}`);
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    await Expense.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Expense', `Removed expense ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
