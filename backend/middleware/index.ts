import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { User, AuditLog } from '../models/index.js';
import { connectDB } from '../config/db.js';

export const crafterSchemaZod = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  hooks: z.number().optional().default(0)
});

export const orderSchemaZod = z.object({
  crafterId: z.string().min(1, "Crafter ID is required"),
  orderDate: z.string().min(1, "Order date is required"),
  piece: z.string().min(1, "Piece is required"),
  qtyOrdered: z.number().min(1, "Quantity must be at least 1"),
  materialCost: z.number().min(0).default(0)
}).passthrough();

export const customerOrderSchemaZod = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  orderDate: z.string().min(1, "Order date is required"),
  products: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    qty: z.number().min(1)
  })).min(1, "At least one product is required"),
  totalAmount: z.number().min(0)
}).passthrough();

export const walletTxnSchemaZod = z.object({
  date: z.string().min(1),
  aggregator: z.string().min(1),
  type: z.enum(['add_funds', 'deduct_shipping']),
  amount: z.number().positive("Amount must be greater than 0")
}).passthrough();

export const inventoryItemSchemaZod = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  costPerUnit: z.number().min(0).default(0)
}).passthrough();

export const expenseSchemaZod = z.object({
  date: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0),
  description: z.string().min(1)
}).passthrough();

export const validateBody = (schema: z.ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const zodErr = error as any;
      return res.status(400).json({ error: zodErr.errors.map((e: any) => `${e.path.join('.') || 'field'}: ${e.message}`).join(' | ') });
    }
    res.status(400).json({ error: "Invalid data submitted." });
  }
};

export interface AuthRequest extends express.Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET environment variable is not configured' });
  }
  
  // Normalize path for check
  const path = req.path.replace(/^\/api/, '');
  if (path === '/health' || path === '/setup' || path === '/login') return next();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please check your login credentials.' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error('DB Connection Error in requireAuth:', dbErr);
      return res.status(503).json({ error: 'Service Unavailable: Database connection failed.' });
    }
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User removed.' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const createAuditLog = async (req: AuthRequest, action: string, details: string = '') => {
  try {
    if (req.user) {
      await AuditLog.create({
        userId: req.user._id,
        userName: req.user.name,
        action,
        details
      });
    }
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
