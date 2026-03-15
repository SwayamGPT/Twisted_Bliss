import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { connectDB } from '../config/db.js';
import { AuthRequest, createAuditLog } from '../middleware/index.js';

const router = express.Router();

router.post('/setup', async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_please_change';
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = new User({ name, email: normalizedEmail, passwordHash });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, email: normalizedEmail, profilePhotoUrl: user.profilePhotoUrl } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req: AuthRequest, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_please_change';
  try {
    await connectDB();
    const { name, email, password, profilePhotoUrl } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ 
      name, 
      email: normalizedEmail, 
      passwordHash, 
      profilePhotoUrl: profilePhotoUrl || '',
      role: 'Admin'
    });
    await user.save();

    await createAuditLog(req, 'Created User', `Added new user: ${name} (${normalizedEmail})`);
    res.json({ id: user._id, name, email: normalizedEmail, profilePhotoUrl: user.profilePhotoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_please_change';
  try {
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error('DB Connection error during login:', dbErr);
      return res.status(503).json({ error: 'Service Unavailable: Database connection failed. Please check your MongoDB URI.' });
    }
    
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePhotoUrl: user.profilePhotoUrl } });
  } catch (err: any) {
    console.error('Login error:', err);
    next(err); // Pass to global error handler
  }
});

router.get('/me', async (req: AuthRequest, res) => {
  res.json(req.user);
});

router.put('/me', async (req: AuthRequest, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_please_change';
  try {
    await connectDB();
    const { name, email, password, profilePhotoUrl } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }
    
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-passwordHash');
    res.json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
