import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICrafter extends Document {
  name: string;
  phone: string;
  address: string;
  hooks: number;
}

const crafterSchema = new Schema<ICrafter>({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  hooks: { type: Number, default: 0 },
});

export interface IOrder extends Document {
  crafterId: mongoose.Types.ObjectId;
  orderDate: string;
  piece: string;
  materialsObj: {
    yarns: { color: string; qty: string }[];
    stuffing: string;
    wire: string;
    eyes: string;
  };
  qtyOrdered: number;
  qtyReceived: number;
  timeTaken: string;
  materialCost: number;
  laborCost: number;
  sellingPrice: number;
  totalLabor: number;
  totalCost: number;
  revenue: number;
  profit: number;
  completed: boolean;
}

const orderSchema = new Schema<IOrder>({
  crafterId: { type: Schema.Types.ObjectId, ref: 'Crafter', required: true },
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

export interface ICustomerOrder extends Document {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  orderDate: string;
  completedDate: string | null;
  products: {
    name: string;
    price: number;
    qty: number;
  }[];
  shippingCharge: number;
  actualShippingCost: number;
  totalAmount: number;
  status: string;
}

const customerOrderSchema = new Schema<ICustomerOrder>({
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
  actualShippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
});

export interface IWalletTransaction extends Document {
  date: string;
  aggregator: string;
  type: 'add_funds' | 'deduct_shipping';
  amount: number;
  referenceId?: string;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  date: { type: String, required: true },
  aggregator: { type: String, required: true },
  type: { type: String, enum: ['add_funds', 'deduct_shipping'], required: true },
  amount: { type: Number, required: true, min: 0 },
  referenceId: { type: String },
});

export interface IInventoryItem extends Document {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lowStockThreshold: number;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  costPerUnit: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 0 }
});

export interface IExpense extends Document {
  date: string;
  category: string;
  amount: number;
  description: string;
}

const expenseSchema = new Schema<IExpense>({
  date: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true }
});

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profilePhotoUrl: string;
  role: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profilePhotoUrl: { type: String, default: '' },
  role: { type: String, default: 'Admin' }
});

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  details?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const Crafter: Model<ICrafter> = mongoose.models.Crafter || mongoose.model<ICrafter>('Crafter', crafterSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export const CustomerOrder: Model<ICustomerOrder> = mongoose.models.CustomerOrder || mongoose.model<ICustomerOrder>('CustomerOrder', customerOrderSchema);
export const WalletTransaction: Model<IWalletTransaction> = mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);
export const InventoryItem: Model<IInventoryItem> = mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
export const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export interface ICatalogueItem extends Document {
  name: string;
  description: string;
  image: string;
  sku: string;
  retailPrice: number;
  priceMoq10: number;
  priceMoq20Plus: number;
  priceMoq50Plus: number;
}

const catalogueItemSchema = new Schema<ICatalogueItem>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  sku: { type: String, required: true },
  retailPrice: { type: Number, required: true, min: 0 },
  priceMoq10: { type: Number, required: true, min: 0 },
  priceMoq20Plus: { type: Number, required: true, min: 0 },
  priceMoq50Plus: { type: Number, required: true, min: 0 },
});

// Passed 'catalogue' as the third argument to force mongoose to use that exact collection name
export const Catalogue: Model<ICatalogueItem> = mongoose.models.Catalogue || mongoose.model<ICatalogueItem>('Catalogue', catalogueItemSchema, 'catalogue');
