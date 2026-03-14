import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

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

const Crafter = mongoose.models.Crafter || mongoose.model('Crafter', crafterSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const CustomerOrder = mongoose.models.CustomerOrder || mongoose.model('CustomerOrder', customerOrderSchema);
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

app.post('/api/crafters', async (req, res) => {
  try {
    await connectDB();
    const crafter = new Crafter(req.body);
    await crafter.save();
    res.json(crafter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/crafters/:id', async (req, res) => {
  try {
    await connectDB();
    const crafter = await Crafter.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

app.post('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await connectDB();
    await Order.findByIdAndDelete(req.params.id);
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

app.post('/api/customer-orders', async (req, res) => {
  try {
    await connectDB();
    const order = new CustomerOrder(req.body);
    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customer-orders/:id', async (req, res) => {
  try {
    await connectDB();
    const order = await CustomerOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customer-orders/:id', async (req, res) => {
  try {
    await connectDB();
    await CustomerOrder.findByIdAndDelete(req.params.id);
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

app.post('/api/wallet/transactions', async (req, res) => {
  try {
    await connectDB();
    const transaction = new WalletTransaction(req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wallet/transactions/:id', async (req, res) => {
  try {
    await connectDB();
    await WalletTransaction.findByIdAndDelete(req.params.id);
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

app.post('/api/inventory', async (req, res) => {
  try {
    await connectDB();
    const item = new InventoryItem(req.body);
    await item.save();
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    await connectDB();
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await connectDB();
    await InventoryItem.findByIdAndDelete(req.params.id);
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

app.post('/api/expenses', async (req, res) => {
  try {
    await connectDB();
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    await connectDB();
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await connectDB();
    await Expense.findByIdAndDelete(req.params.id);
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
