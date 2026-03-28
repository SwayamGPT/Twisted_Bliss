import express from 'express';
import { BuyerUser } from '../models/index.js';
import { connectDB } from '../config/db.js';
import { hashPassword, verifyPassword, createAccessToken, getBuyerCurrentUser, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await BuyerUser.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new BuyerUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      role: 'customer'
    });
    await user.save();

    const token = createAccessToken({ email: user.email, role: user.role });
    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (err: any) {
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await BuyerUser.findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createAccessToken({ email: user.email, role: user.role });
    res.json({
      access_token: token,
      token_type: 'bearer',
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (err: any) {
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
});

router.get('/me', getBuyerCurrentUser as express.RequestHandler, (req: AuthRequest, res) => {
  try {
    res.json({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
});

export default router;
