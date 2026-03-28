import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { BuyerUser } from '../models/index.js';
import { connectDB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_EXPIRE_MINUTES || '0', 10);

// Password hashing logic matching Python's pbkdf2_hmac
export const hashPassword = (password: string, salt?: string): string => {
  const currentSalt = salt || crypto.randomBytes(16).toString('hex');
  const pwdHash = crypto.pbkdf2Sync(
    password,
    Buffer.from(currentSalt, 'hex'),
    100000,
    32,
    'sha256'
  ).toString('hex');
  return `${currentSalt}$${pwdHash}`;
};

export const verifyPassword = (password: string, hashed_password: string): boolean => {
  try {
    const [salt] = hashed_password.split('$');
    const recalculated = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(recalculated), Buffer.from(hashed_password));
  } catch (err) {
    return false;
  }
};

export const createAccessToken = (payload: object): string => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${JWT_EXPIRE_MINUTES}m` });
};

export interface AuthRequest extends Request {
  user?: any;
}

export const getBuyerCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const payload: any = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await BuyerUser.findOne({ email: payload.email }).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isBuyerAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
