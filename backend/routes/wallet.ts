import express from 'express';
import { WalletTransaction } from '../models';
import { connectDB } from '../config/db';
import { AuthRequest, createAuditLog, validateBody, walletTxnSchemaZod } from '../middleware';

const router = express.Router();

router.get('/transactions', async (req, res) => {
  try {
    await connectDB();
    const transactions = await WalletTransaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transactions', validateBody(walletTxnSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const transaction = new WalletTransaction(req.body);
    await transaction.save();
    await createAuditLog(req as AuthRequest, 'Wallet Transaction', `Type: ${transaction.type}, Amount: ${transaction.amount}, Aggregator: ${transaction.aggregator}`);
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/transactions/:id', async (req, res) => {
  try {
    await connectDB();
    await WalletTransaction.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Wallet Transaction', `Deleted txn ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
