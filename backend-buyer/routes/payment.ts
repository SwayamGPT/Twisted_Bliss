import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { BuyerOrder } from '../models/index.js';
import { connectDB } from '../config/db.js';

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const getRazorpayClient = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured');
  }
  // @ts-ignore - Razorpay types are missing or incomplete
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

router.post('/create-order', async (req, res) => {
  try {
    await connectDB();
    const { items, totalAmount, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than zero' });
    }

    const client = getRazorpayClient();
    const shortOrderId = `TB-${uuidv4().substring(0, 6).toUpperCase()}`;

    const razorpayOrder = await client.orders.create({
      amount: totalAmount * 100, // amount in paisa
      currency: 'INR',
      receipt: shortOrderId,
    });

    const order = new BuyerOrder({
      order_id: shortOrderId,
      items,
      totalAmount,
      customerEmail,
      razorpay_order_id: razorpayOrder.id,
      status: 'payment_pending',
      created_at: new Date(),
      updated_at: new Date()
    });

    await order.save();

    res.json({
      order_id: shortOrderId,
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: RAZORPAY_KEY_ID,
      amount: totalAmount * 100,
      currency: 'INR'
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create payment order: ${err.message}` });
  }
});

router.post('/verify', async (req, res) => {
  try {
    await connectDB();
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await BuyerOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          razorpay_payment_id,
          status: 'paid',
          updated_at: new Date()
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Payment verified successfully', order_id });
  } catch (err: any) {
    res.status(500).json({ error: `Payment verification failed: ${err.message}` });
  }
});

export default router;
