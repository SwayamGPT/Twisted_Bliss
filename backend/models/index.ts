import mongoose from 'mongoose';

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
  completedDate: { type: String, default: null }, 
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
  aggregator: { type: String, required: true }, 
  type: { type: String, enum: ['add_funds', 'deduct_shipping'], required: true },
  amount: { type: Number, required: true, min: 0 },
  referenceId: { type: String }, 
});

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, 
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true }, 
  costPerUnit: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 0 }
});

const expenseSchema = new mongoose.Schema({
  date: { type: String, required: true },
  category: { type: String, required: true }, 
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

export const Crafter = mongoose.models.Crafter || mongoose.model('Crafter', crafterSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const CustomerOrder = mongoose.models.CustomerOrder || mongoose.model('CustomerOrder', customerOrderSchema);
export const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
