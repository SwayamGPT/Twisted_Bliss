import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection (Lazy Initialization)
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const connectDB = async () => {
  if (isConnected) return;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  connectionPromise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      // Add event listeners for debugging
      if (mongoose.connection.listeners('connected').length === 0) {
        mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
        mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
        mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 to prevent querySrv ECONNREFUSED on some Windows networks
      });
      isConnected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};

// Mongoose Models
const crafterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  hooks: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  crafterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crafter', required: true },
  orderDate: { type: String, required: true },
  piece: { type: String, required: true },
  materialsObj: {
    yarns: [{ color: String, qty: String }],
    stuffing: String,
    wire: String,
    eyes: String,
  },
  qtyOrdered: { type: Number, required: true },
  qtyReceived: { type: Number, default: 0 },
  timeTaken: { type: String, default: 'Pending' },
  materialCost: { type: Number, required: true },
  laborCost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  totalLabor: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

const customerOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  customerAddress: { type: String },
  orderDate: { type: String, required: true },
  completedDate: { type: String, default: null }, // Used for calculating fulfillment time metrics
  products: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  }],
  shippingCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
});

const walletTransactionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  aggregator: { type: String, required: true }, // e.g. "Shiprocket", "Shipmozo"
  type: { type: String, enum: ['add_funds', 'deduct_shipping'], required: true },
  amount: { type: Number, required: true, min: 0 },
  referenceId: { type: String }, // Optional Tracking ID/Transaction ID
});

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "Yarn", "Stuffing", "Packaging"
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true }, // e.g. "skeins", "grams", "boxes"
  costPerUnit: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 0 }
});

const expenseSchema = new mongoose.Schema({
  date: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Marketing", "Software", "Packaging"
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profilePhotoUrl: { type: String, default: '' },
  role: { type: String, default: 'Admin' }
});

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Crafter = mongoose.models.Crafter || mongoose.model('Crafter', crafterSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const CustomerOrder = mongoose.models.CustomerOrder || mongoose.model('CustomerOrder', customerOrderSchema);
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

const crafterSchemaZod = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  hooks: z.number().optional().default(0)
});

const orderSchemaZod = z.object({
  crafterId: z.string().min(1, "Crafter ID is required"),
  orderDate: z.string().min(1, "Order date is required"),
  piece: z.string().min(1, "Piece is required"),
  qtyOrdered: z.number().min(1, "Quantity must be at least 1"),
  materialCost: z.number().min(0).default(0)
}).passthrough();

const customerOrderSchemaZod = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  orderDate: z.string().min(1, "Order date is required"),
  products: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    qty: z.number().min(1)
  })).min(1, "At least one product is required"),
  totalAmount: z.number().min(0)
}).passthrough();

const walletTxnSchemaZod = z.object({
  date: z.string().min(1),
  aggregator: z.string().min(1),
  type: z.enum(['add_funds', 'deduct_shipping']),
  amount: z.number().positive("Amount must be greater than 0")
}).passthrough();

const inventoryItemSchemaZod = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  costPerUnit: z.number().min(0).default(0)
}).passthrough();

const expenseSchemaZod = z.object({
  date: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0),
  description: z.string().min(1)
}).passthrough();

const validateBody = (schema: z.ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

interface AuthRequest extends express.Request {
  user?: any;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_please_change';

app.post('/api/setup', async (req, res) => {
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

app.post('/api/users', async (req: AuthRequest, res) => {
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

app.post('/api/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePhotoUrl: user.profilePhotoUrl } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const requireAuth = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  // Allow health check, setup, and login without auth
  if (req.path === '/api/health' || req.path === '/api/setup' || req.path === '/api/login') return next();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please check your login credentials.' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User removed.' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

app.use('/api', requireAuth as express.RequestHandler);

app.get('/api/me', async (req: AuthRequest, res) => {
  res.json(req.user);
});

app.put('/api/me', async (req: AuthRequest, res) => {
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

app.get('/api/audit', async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const createAuditLog = async (req: AuthRequest, action: string, details: string = '') => {
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

// Crafters API
app.get('/api/crafters', async (req, res) => {
  try {
    await connectDB();
    const crafters = await Crafter.find();
    res.json(crafters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crafters', validateBody(crafterSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const crafter = new Crafter(req.body);
    await crafter.save();
    await createAuditLog(req as AuthRequest, 'Created Crafter', `Added new crafter: ${crafter.name}`);
    res.json(crafter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/crafters/:id', validateBody(crafterSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const crafter = await Crafter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Crafter', `Updated details for crafter ID: ${req.params.id}`);
    res.json(crafter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/crafters/:id', async (req, res) => {
  try {
    await connectDB();
    await Crafter.findByIdAndDelete(req.params.id);
    await Order.deleteMany({ crafterId: req.params.id });
    await createAuditLog(req as AuthRequest, 'Deleted Crafter', `Removed crafter ID: ${req.params.id} and their orders.`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', validateBody(orderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = new Order(req.body);
    await order.save();
    await createAuditLog(req as AuthRequest, 'Created Crafter Order', `Added order for piece: ${order.piece}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', validateBody(orderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Crafter Order', `Updated order ID: ${req.params.id}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await connectDB();
    await Order.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Crafter Order', `Deleted order ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Orders API
app.get('/api/customer-orders', async (req, res) => {
  try {
    await connectDB();
    const orders = await CustomerOrder.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-orders', validateBody(customerOrderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = new CustomerOrder(req.body);
    await order.save();
    await createAuditLog(req as AuthRequest, 'Created Customer Order', `Added order for customer: ${order.customerName}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customer-orders/:id', validateBody(customerOrderSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const order = await CustomerOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Customer Order', `Updated order ID: ${req.params.id}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customer-orders/:id', async (req, res) => {
  try {
    await connectDB();
    await CustomerOrder.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Customer Order', `Deleted order ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Wallet Transactions API
app.get('/api/wallet/transactions', async (req, res) => {
  try {
    await connectDB();
    const transactions = await WalletTransaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wallet/transactions', validateBody(walletTxnSchemaZod), async (req, res) => {
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

app.delete('/api/wallet/transactions/:id', async (req, res) => {
  try {
    await connectDB();
    await WalletTransaction.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Wallet Transaction', `Deleted txn ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory API
app.get('/api/inventory', async (req, res) => {
  try {
    await connectDB();
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', validateBody(inventoryItemSchemaZod), async (req, res) => {
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

app.put('/api/inventory/:id', validateBody(inventoryItemSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Inventory Item', `Updated item ID: ${req.params.id}`);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await connectDB();
    await InventoryItem.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Inventory Item', `Removed item ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Expenses API
app.get('/api/expenses', async (req, res) => {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', validateBody(expenseSchemaZod), async (req, res) => {
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

app.put('/api/expenses/:id', validateBody(expenseSchemaZod), async (req, res) => {
  try {
    await connectDB();
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAuditLog(req as AuthRequest, 'Updated Expense', `Updated expense ID: ${req.params.id}`);
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await connectDB();
    await Expense.findByIdAndDelete(req.params.id);
    await createAuditLog(req as AuthRequest, 'Deleted Expense', `Removed expense ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  startServer();
}

export default app;
