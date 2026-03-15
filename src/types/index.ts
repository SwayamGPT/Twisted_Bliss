export type Yarn = { color: string; qty: string };
export type Materials = { yarns: Yarn[]; stuffing: string; wire: string; eyes: string };
export type Crafter = { _id?: string; id?: string; name: string; phone?: string; address?: string; hooks: number };
export type Order = {
  _id?: string;
  id?: string;
  crafterId: string;
  orderDate: string;
  piece: string;
  materialsObj: Materials;
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
  completed?: boolean;
};

export type Product = {
  name: string;
  price: number;
  qty: number;
};

export type CustomerOrder = {
  _id?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  orderDate: string;
  completedDate?: string;
  products: Product[];
  shippingCharge: number;
  totalAmount: number;
  status: string;
};

export type WalletTransaction = {
  _id?: string;
  date: string;
  aggregator: string;
  type: 'add_funds' | 'deduct_shipping';
  amount: number;
  referenceId?: string;
};

export type InventoryItem = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lowStockThreshold: number;
};

export type Expense = {
  _id?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  role: string;
};

export type AuditLog = {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
};
