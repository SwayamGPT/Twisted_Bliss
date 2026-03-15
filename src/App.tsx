
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, TrendingUp, IndianRupee, Package,
  Save, X, UserPlus, ChevronDown, User, LayoutDashboard, Users,
  CheckCircle, Circle, ShoppingBag, Wallet, Box, Receipt, BarChart3, PieChart,
  Truck, History, Factory, Zap, Target, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

import { toast, Toaster } from 'react-hot-toast';

const YarnBall = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20" />
    <path d="M2 12a14.5 14.5 0 0 0 20 0" />
    <path d="M6 6a14.5 14.5 0 0 0 12 12" />
    <path d="M6 18a14.5 14.5 0 0 0 12-12" />
  </svg>
);

// Types
type Yarn = { color: string; qty: string };
type Materials = { yarns: Yarn[]; stuffing: string; wire: string; eyes: string };
type Crafter = { _id?: string; id?: string; name: string; phone?: string; address?: string; hooks: number };
type Order = {
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

type Product = {
  name: string;
  price: number;
  qty: number;
};

type CustomerOrder = {
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

type WalletTransaction = {
  _id?: string;
  date: string;
  aggregator: string;
  type: 'add_funds' | 'deduct_shipping';
  amount: number;
  referenceId?: string;
};

type InventoryItem = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lowStockThreshold: number;
};

type Expense = {
  _id?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  role: string;
};

type AuditLog = {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
  <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

// Global Fetch Interceptor
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
  if (url.startsWith('/api') && url !== '/api/login') {
    const token = localStorage.getItem('tb_admin_token');
    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        'Authorization': `Bearer ${token}`
      }
    };
    const res = await originalFetch(input, newInit);
    if (res.status === 401 && token) {
      localStorage.removeItem('tb_admin_token');
      // No auto-refresh, just let the state handle it (App will re-render to login)
      window.location.href = '/';
    }
    return res;
  }
  return originalFetch(input, init);
};
const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    toast.error('No data to export!');
    return;
  }
  const headers = Object.keys(data[0]).filter(k => k !== '_id' && k !== '__v');
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val).replace(/"/g, '""');
      }
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success(`Exported ${filename}.csv`);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('tb_admin_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [crafters, setCrafters] = useState<Crafter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [walletTxns, setWalletTxns] = useState<WalletTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'crafters' | 'sales' | 'wallet' | 'inventory' | 'expenses' | 'audit'>('admin');

  // Profile Settings Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAddingUserModalOpen, setIsAddingUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhotoUrl, setNewUserPhotoUrl] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentCrafterId, setCurrentCrafterId] = useState<string>('');
  const [newCrafterName, setNewCrafterName] = useState('');
  const [newCrafterPhone, setNewCrafterPhone] = useState('');
  const [newCrafterAddress, setNewCrafterAddress] = useState('');
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crafterSearchToken, setCrafterSearchToken] = useState('');

  // Crafter Form State
  const [orderDate, setOrderDate] = useState('');
  const [piece, setPiece] = useState('');
  const [yarns, setYarns] = useState<Yarn[]>([{ color: '', qty: '' }]);
  const [stuffing, setStuffing] = useState('');
  const [wire, setWire] = useState('');
  const [eyes, setEyes] = useState('');
  const [materialCost, setMaterialCost] = useState<number | ''>('');
  const [qtyOrdered, setQtyOrdered] = useState<number | ''>('');
  const [qtyReceived, setQtyReceived] = useState<number | ''>('');
  const [timeTaken, setTimeTaken] = useState('');
  const [laborCost, setLaborCost] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');

  // Sales Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salesOrderDate, setSalesOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState<Product[]>([{ name: '', price: 0, qty: 1 }]);
  const [shippingCharge, setShippingCharge] = useState<number | ''>(0);
  const [salesStatus, setSalesStatus] = useState('Pending');
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);
  const [editSalesOrderId, setEditSalesOrderId] = useState<string | null>(null);
  // Wallet Form State
  const [walletDate, setWalletDate] = useState(new Date().toISOString().split('T')[0]);
  const [aggregator, setAggregator] = useState('Shiprocket');
  const [walletAmount, setWalletAmount] = useState<number | ''>('');
  const [referenceId, setReferenceId] = useState('');
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false);

  // Inventory Form State
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [editInventoryId, setEditInventoryId] = useState<string | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('Yarn');
  const [invQty, setInvQty] = useState<number | ''>('');
  const [invUnit, setInvUnit] = useState('skeins');
  const [invCost, setInvCost] = useState<number | ''>('');
  const [invThreshold, setInvThreshold] = useState<number | ''>(5);

  // Expenses Form State
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('Packaging');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDesc, setExpDesc] = useState('');

  // UX Filters State
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    try {
      const [craftersRes, ordersRes, customerOrdersRes, walletRes, invRes, expRes, meRes, auditRes] = await Promise.all([
        fetch('/api/crafters'),
        fetch('/api/orders'),
        fetch('/api/customer-orders'),
        fetch('/api/wallet/transactions'),
        fetch('/api/inventory'),
        fetch('/api/expenses'),
        fetch('/api/me'),
        fetch('/api/audit')
      ]);

      if (!craftersRes.ok) {
        const errorData = await craftersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch crafters. Please check your database connection.');
      }
      if (!ordersRes.ok) {
        const errorData = await ordersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders. Please check your database connection.');
      }
      if (!customerOrdersRes.ok) {
        const errorData = await customerOrdersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch customer orders.');
      }
      if (!walletRes.ok) {
        const errorData = await walletRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch wallet transactions.');
      }
      if (!invRes.ok) {
        const errorData = await invRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch inventory.');
      }
      if (!expRes.ok) {
        const errorData = await expRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch expenses.');
      }

      const craftersData = await craftersRes.json();
      const ordersData = await ordersRes.json();
      const customerOrdersData = await customerOrdersRes.json();
      const walletData = await walletRes.json();
      const invData = await invRes.json();
      const expData = await expRes.json();

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData);
        setProfileName(meData.name);
        setProfileEmail(meData.email);
        setProfilePhotoUrl(meData.profilePhotoUrl || '');
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
      }

      setCrafters(craftersData);
      setOrders(ordersData);
      setCustomerOrders(customerOrdersData);
      setWalletTxns(walletData);
      setInventory(invData);
      setExpenses(expData);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddCrafter = async () => {
    if (!newCrafterName.trim()) return;
    try {
      const res = await fetch('/api/crafters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCrafterName.trim(),
          phone: newCrafterPhone.trim(),
          address: newCrafterAddress.trim(),
          hooks: 0
        })
      });
      const newCrafter = await res.json();
      setCrafters([...crafters, newCrafter]);
      setNewCrafterName('');
      setNewCrafterPhone('');
      setNewCrafterAddress('');
      setCurrentCrafterId(newCrafter._id);
      setActiveTab('crafters');
      toast.success('Crafter added successfully!');
    } catch (err) {
      console.error('Failed to add crafter', err);
      toast.error('Failed to add crafter.');
    }
  };

  const handleDeleteCrafter = async (id: string) => {
    if (window.confirm('Are you SURE you want to delete this portfolio? This will permanently delete her and ALL of her order history!')) {
      try {
        await fetch(`/api/crafters/${id}`, { method: 'DELETE' });
        setCrafters(crafters.filter(c => c._id !== id));
        setOrders(orders.filter(o => o.crafterId !== id));
        if (currentCrafterId === id) {
          setCurrentCrafterId('');
          setActiveTab('admin');
        }
        toast.success('Crafter deleted permanently.');
      } catch (err) {
        console.error('Failed to delete crafter', err);
        toast.error('Failed to delete crafter portfolio.');
      }
    }
  };

  const currentCrafter = crafters.find(c => c._id === currentCrafterId);
  const ladyOrders = orders.filter(o => o.crafterId === currentCrafterId);
  const ladyTotalRev = ladyOrders.reduce((sum, o) => sum + o.revenue, 0);
  const ladyTotalProf = ladyOrders.reduce((sum, o) => sum + o.profit, 0);

  // Admin / Dashboard Stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.completed ? order.sellingPrice : 0), 0) +
    customerOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0); // Sales Tab revenue

  const totalLaborCost = orders.reduce((sum, order) => sum + (order.totalLabor || 0), 0);
  const totalMaterialCost = orders.reduce((sum, order) => sum + (order.materialCost || 0), 0);

  // Expenses sum
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  // Wallet Shipping Deductions
  const totalShippingDeductions = walletTxns.filter(t => t.type === 'deduct_shipping').reduce((sum, t) => sum + t.amount, 0);
  const walletTotalAdded = walletTxns.filter(t => t.type === 'add_funds').reduce((sum, t) => sum + t.amount, 0);
  const walletTotalDeducted = totalShippingDeductions;
  const walletBalance = walletTotalAdded - walletTotalDeducted;
  const inventoryTotalCost = inventory.reduce((sum, inv) => sum + (inv.quantity * inv.costPerUnit), 0);

  // --- Advanced Business Analytics (KPIs) ---
  const completedOrders = orders.filter(o => o.completed).length + customerOrders.filter(o => o.status === 'Completed').length;
  const totalProfit = totalRevenue - totalLaborCost - totalMaterialCost - totalExpenses - totalShippingDeductions;
  const totalCosts = totalLaborCost + totalMaterialCost + totalExpenses + totalShippingDeductions;
  
  // 1. Return on Investment (ROI): (Net Profit / Total Costs) * 100
  const trueROI = totalCosts > 0 ? ((totalProfit / totalCosts) * 100).toFixed(1) : '0.0';
  
  // 2. Average Order Value (AOV): Total Sales Revenue / Completed Orders
  const avgOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(0) : '0';

  // 3. Profit Margin: (Net Profit / Total Revenue) * 100
  const netMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // 4. Inventory Health: Percentage of items above threshold
  const lowStockCount = inventory.filter(i => i.quantity <= (i.lowStockThreshold || 5)).length;
  const inventoryHealth = inventory.length > 0 ? (((inventory.length - lowStockCount) / inventory.length) * 100).toFixed(0) : '100';

  const pendingOrders = orders.filter(o => !o.completed).length + customerOrders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = completedOrders;

  const adminTotalHooks = crafters.reduce((sum, c) => sum + (c.hooks || 0), 0);

  // --- Advanced Analytics Calculations ---
  // 1. Best Sellers (From Sales Orders)
  const productSalesMap = new Map<string, number>();
  customerOrders.forEach(order => {
    if (order.status !== 'Cancelled') {
      order.products.forEach(p => {
        const currentQty = productSalesMap.get(p.name) || 0;
        productSalesMap.set(p.name, currentQty + p.qty);
      });
    }
  });
  const bestSellersData = Array.from(productSalesMap.entries())
    .map(([name, qty]) => ({ name, value: qty }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5
  const COLORS = ['#8b5cf6', '#ec4899', '#0ea5e9', '#f59e0b', '#10b981'];

  // 2. Monthly Revenue Trend (Last 6 Months)
  // Group by "YYYY-MM"
  const revenueByMonth = new Map<string, number>();
  const addRevenue = (dateStr: string, amount: number) => {
    if (!dateStr) return;
    const monthKey = dateStr.substring(0, 7); // e.g., "2023-10"
    revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + amount);
  };

  orders.filter(o => o.completed).forEach(o => addRevenue(o.orderDate, o.revenue));
  customerOrders.filter(o => o.status === 'Completed').forEach(o => addRevenue(o.orderDate, o.totalAmount));

  const monthlyTrendData = Array.from(revenueByMonth.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  // 3. Crafter Efficiency (Items completed per crafter)
  const crafterEfficiencyMap = new Map<string, number>();
  orders.filter(o => o.completed).forEach(o => {
    const cName = crafters.find(c => c._id === o.crafterId)?.name || 'Unknown';
    crafterEfficiencyMap.set(cName, (crafterEfficiencyMap.get(cName) || 0) + o.qtyReceived);
  });
  const efficiencyData = Array.from(crafterEfficiencyMap.entries())
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => b.items - a.items);

  // 4. Customer Lifetime Value (CLV) Leaderboard
  const clvMap = new Map<string, number>();
  customerOrders.filter(o => o.status === 'Completed').forEach(o => {
    const key = `${o.customerName}${o.customerPhone ? ' (' + o.customerPhone + ')' : ''}`;
    clvMap.set(key, (clvMap.get(key) || 0) + o.totalAmount);
  });
  const clvData = Array.from(clvMap.entries())
    .map(([name, totalSpent]) => ({ name, totalSpent }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5); // Top 5 VIPs

  // 5. Average Order Fulfillment Time (Days)
  let totalFulfillmentDays = 0;
  let fulfilledOrdersCount = 0;
  customerOrders.filter(o => o.status === 'Completed' && o.completedDate).forEach(o => {
    const start = new Date(o.orderDate).getTime();
    const end = new Date(o.completedDate!).getTime();
    const days = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    totalFulfillmentDays += days;
    fulfilledOrdersCount++;
  });
  const avgFulfillmentTime = fulfilledOrdersCount > 0 ? (totalFulfillmentDays / fulfilledOrdersCount).toFixed(1) : '-';

  // 6. Predictive Inventory (Pending Yarn Demand)
  const pendingYarnDemand = new Map<string, number>();
  let totalPendingStuffing = 0;
  orders.filter(o => !o.completed).forEach(o => {
    o.materialsObj?.yarns?.forEach(y => {
      if (y.color && y.qty) {
        const colorKey = y.color.toLowerCase();
        pendingYarnDemand.set(colorKey, (pendingYarnDemand.get(colorKey) || 0) + Number(y.qty));
      }
    });
    if (o.materialsObj?.stuffing) {
      totalPendingStuffing += Number(o.materialsObj.stuffing);
    }
  });

  // Check inventory for warnings
  const inventoryWarnings: string[] = [];
  inventory.forEach(inv => {
    if (inv.category.toLowerCase().includes('yarn')) {
      const demand = pendingYarnDemand.get(inv.name.toLowerCase()) || 0;
      if (inv.quantity < demand) {
        inventoryWarnings.push(`Shortage: Need ${demand}${inv.unit} of ${inv.name} for pending orders, but only ${inv.quantity}${inv.unit} in stock!`);
      }
    } else if (inv.category.toLowerCase().includes('stuff')) {
      if (inv.quantity < totalPendingStuffing) {
        inventoryWarnings.push(`Shortage: Need ${totalPendingStuffing}${inv.unit} of Stuffing, but only ${inv.quantity}${inv.unit} in stock!`);
      }
    }
  });


  const handleHooksChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    if (!currentCrafterId) return;

    // Optimistic update
    setCrafters(crafters.map(c => c._id === currentCrafterId ? { ...c, hooks: val } : c));

    try {
      await fetch(`/api/crafters/${currentCrafterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hooks: val })
      });
    } catch (err) {
      console.error('Failed to update hooks', err);
      fetchData(); // Revert on failure
    }
  };

  const addYarn = () => setYarns([...yarns, { color: '', qty: '' }]);
  const removeYarn = (index: number) => setYarns(yarns.filter((_, i) => i !== index));
  const updateYarn = (index: number, field: keyof Yarn, value: string) => {
    const newYarns = [...yarns];
    newYarns[index][field] = value;
    setYarns(newYarns);
  };

  const resetForm = () => {
    setOrderDate(''); setPiece(''); setYarns([{ color: '', qty: '' }]);
    setStuffing(''); setWire(''); setEyes(''); setMaterialCost('');
    setQtyOrdered(''); setQtyReceived(''); setTimeTaken('');
    setLaborCost(''); setSellingPrice(''); setEditOrderId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mCost = Number(materialCost) || 0;
    const qOrdered = Number(qtyOrdered) || 0;
    const qReceived = Number(qtyReceived) || 0;
    const lCost = Number(laborCost) || 0;
    const sPrice = Number(sellingPrice) || 0;

    const totalLabor = lCost * qReceived;
    const totalCostToYou = mCost + totalLabor;
    const totalRevenue = sPrice * qReceived;
    const netProfit = totalRevenue - totalCostToYou;

    const orderData = {
      crafterId: currentCrafterId, orderDate, piece,
      materialsObj: { yarns: yarns.filter(y => y.color.trim() || y.qty.trim()), stuffing, wire, eyes },
      qtyOrdered: qOrdered, qtyReceived: qReceived, timeTaken: timeTaken || 'Pending',
      materialCost: mCost, laborCost: lCost, sellingPrice: sPrice,
      totalLabor, totalCost: totalCostToYou, revenue: totalRevenue, profit: netProfit,
      completed: qReceived >= qOrdered && qOrdered > 0
    };

    try {
      if (editOrderId) {
        const res = await fetch(`/api/orders/${editOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o._id === editOrderId ? updatedOrder : o));
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const newOrder = await res.json();
        setOrders([...orders, newOrder]);
      }
      resetForm(); setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  const handleEdit = (order: Order) => {
    setOrderDate(order.orderDate); setPiece(order.piece);
    setYarns(order.materialsObj?.yarns?.length > 0 ? order.materialsObj.yarns : [{ color: '', qty: '' }]);
    setStuffing(order.materialsObj?.stuffing || ''); setWire(order.materialsObj?.wire || '');
    setEyes(order.materialsObj?.eyes || ''); setMaterialCost(order.materialCost || '');
    setQtyOrdered(order.qtyOrdered || ''); setQtyReceived(order.qtyReceived || '');
    setTimeTaken(order.timeTaken === 'Pending' ? '' : order.timeTaken);
    setLaborCost(order.laborCost || ''); setSellingPrice(order.sellingPrice || '');
    setEditOrderId(order._id || null); setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        setOrders(orders.filter(o => o._id !== id));
      } catch (err) {
        console.error('Failed to delete order', err);
      }
    }
  };

  const toggleOrderStatus = async (orderId: string, currentStatus: boolean, order: Order) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));

      // Automated Inventory Deduction Logic
      if (!currentStatus) { // transitioning to Completed
        if (window.confirm(`Order completed! Deduct ${order.materialsObj?.yarns?.length || 0} yarns and stuffing from Inventory?`)) {
          // Attempt to find matching yarns in inventory and deduct them
          order.materialsObj?.yarns?.forEach(async (y) => {
            if (!y.color || !y.qty) return;
            const deductionAmount = Number(y.qty);
            const matchedItem = inventory.find(i => i.name.toLowerCase().includes(y.color.toLowerCase()) || y.color.toLowerCase().includes(i.name.toLowerCase()));

            if (matchedItem && matchedItem._id) {
              const newQty = Math.max(0, matchedItem.quantity - deductionAmount);
              try {
                const invRes = await fetch(`/api/inventory/${matchedItem._id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...matchedItem, quantity: newQty })
                });
                const updatedInv = await invRes.json();
                setInventory(prev => prev.map(inv => inv._id === updatedInv._id ? updatedInv : inv));
              } catch (e) {
                console.error(`Failed to deduct ${y.color} from inventory`, e);
              }
            }
          });

          // Also attempt to deduct stuffing if defined
          if (order.materialsObj?.stuffing) {
            const stuffingAmount = Number(order.materialsObj.stuffing) || 0;
            const stuffingItem = inventory.find(i => i.category === 'Stuffing' || i.name.toLowerCase().includes('stuffing'));
            if (stuffingItem && stuffingItem._id && stuffingAmount > 0) {
              const newQty = Math.max(0, stuffingItem.quantity - stuffingAmount);
              try {
                const invRes = await fetch(`/api/inventory/${stuffingItem._id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...stuffingItem, quantity: newQty })
                });
                const updatedInv = await invRes.json();
                setInventory(prev => prev.map(inv => inv._id === updatedInv._id ? updatedInv : inv));
              } catch (e) {
                console.error(`Failed to deduct stuffing from inventory`, e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  // Sales Functions
  const addSaleProduct = () => setProducts([...products, { name: '', price: 0, qty: 1 }]);
  const removeSaleProduct = (index: number) => setProducts(products.filter((_, i) => i !== index));
  const updateSaleProduct = (index: number, field: keyof Product, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const resetSalesForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCustomerAddress('');
    setSalesOrderDate(new Date().toISOString().split('T')[0]);
    setProducts([{ name: '', price: 0, qty: 1 }]);
    setShippingCharge(0);
    setSalesStatus('Pending');
    setEditSalesOrderId(null);
    setIsSalesFormOpen(false);
  };

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || products.length === 0) return;

    const validProducts = products.filter(p => p.name.trim() !== '');
    if (validProducts.length === 0) return;

    const sCharge = Number(shippingCharge) || 0;
    const totalAmount = validProducts.reduce((sum, p) => sum + (p.price * p.qty), 0) + sCharge;

    const orderData = {
      customerName,
      customerPhone,
      customerAddress,
      orderDate: salesOrderDate,
      products: validProducts,
      shippingCharge: sCharge,
      totalAmount,
      status: salesStatus
    };

    try {
      if (editSalesOrderId) {
        const res = await fetch(`/api/customer-orders/${editSalesOrderId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData)
        });
        const updated = await res.json();
        setCustomerOrders(customerOrders.map(o => o._id === editSalesOrderId ? updated : o));
      } else {
        const res = await fetch('/api/customer-orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData)
        });
        const saved = await res.json();
        setCustomerOrders([saved, ...customerOrders]);
      }
      resetSalesForm();
    } catch (err) {
      console.error('Failed to save sales order', err);
    }
  };

  const handleSalesEdit = (order: CustomerOrder) => {
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone || '');
    setCustomerAddress(order.customerAddress || '');
    setSalesOrderDate(order.orderDate);
    setProducts([...order.products]);
    setShippingCharge(order.shippingCharge);
    setSalesStatus(order.status);
    setEditSalesOrderId(order._id!);
    setIsSalesFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalesDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer order?')) {
      try {
        await fetch(`/api/customer-orders/${id}`, { method: 'DELETE' });
        setCustomerOrders(customerOrders.filter(o => o._id !== id));
      } catch (err) {
        console.error('Failed to delete customer order', err);
      }
    }
  };

  const toggleSalesOrderStatus = async (order: CustomerOrder) => {
    const newStatus = order.status === 'Completed' ? 'Pending' : (order.status === 'Pending' ? 'Completed' : 'Pending');
    const updatePayload = {
      ...order,
      status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    };
    try {
      const res = await fetch(`/api/customer-orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const updatedOrder = await res.json();
      setCustomerOrders(customerOrders.map(o => o._id === order._id ? updatedOrder : o));
    } catch (err) {
      console.error('Failed to update sales order status', err);
    }
  };

  const salesTotalRev = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const salesTotalOrders = customerOrders.length;

  // Wallet Functions & Stats

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAmount || walletAmount <= 0) return;

    const txnData = {
      date: walletDate, aggregator,
      type: 'add_funds', amount: Number(walletAmount), referenceId
    };

    try {
      const res = await fetch('/api/wallet/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnData)
      });
      const newTxn = await res.json();
      setWalletTxns([newTxn, ...walletTxns]);
      setWalletAmount(''); setReferenceId(''); setIsWalletFormOpen(false);
    } catch (err) {
      console.error('Failed to save wallet transaction', err);
    }
  };

  const handleWalletDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await fetch(`/api/wallet/transactions/${id}`, { method: 'DELETE' });
        setWalletTxns(walletTxns.filter(t => t._id !== id));
      } catch (err) {
        console.error('Failed to delete wallet transaction', err);
      }
    }
  };

  const deductShippingFromWallet = async (order: CustomerOrder) => {
    if (!order.shippingCharge || order.shippingCharge <= 0) {
      alert("This order has no shipping charge to deduct.");
      return;
    }
    if (window.confirm(`Deduct ₹${order.shippingCharge} from the Shipping Wallet for ${order.customerName}'s order?`)) {
      const txnData = {
        date: new Date().toISOString().split('T')[0],
        aggregator: 'Shiprocket', // Default fallback
        type: 'deduct_shipping',
        amount: order.shippingCharge,
        referenceId: `Order: ${order.customerName}`
      };

      try {
        const res = await fetch('/api/wallet/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txnData)
        });
        const newTxn = await res.json();
        setWalletTxns([newTxn, ...walletTxns]);
      } catch (err) {
        console.error('Failed to log deduction', err);
      }
    }
  };

  // Inventory Functions
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || invQty === '' || invCost === '') return;

    const invData = {
      name: invName, category: invCategory, quantity: Number(invQty),
      unit: invUnit, costPerUnit: Number(invCost), lowStockThreshold: Number(invThreshold)
    };

    try {
      if (editInventoryId) {
        const res = await fetch(`/api/inventory/${editInventoryId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invData)
        });
        const updated = await res.json();
        setInventory(inventory.map(i => i._id === editInventoryId ? updated : i));
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invData)
        });
        const saved = await res.json();
        setInventory([...inventory, saved].sort((a, b) => a.category.localeCompare(b.category)));
      }
      resetInventoryForm();
    } catch (err) { console.error('Failed to save inventory', err); }
  };

  const handleInventoryEdit = (item: InventoryItem) => {
    setInvName(item.name); setInvCategory(item.category); setInvQty(item.quantity);
    setInvUnit(item.unit); setInvCost(item.costPerUnit); setInvThreshold(item.lowStockThreshold);
    setEditInventoryId(item._id!); setIsInventoryFormOpen(true);
  };

  const handleInventoryDelete = async (id: string) => {
    if (window.confirm('Delete this inventory item?')) {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      setInventory(inventory.filter(i => i._id !== id));
    }
  };

  const resetInventoryForm = () => {
    setInvName(''); setInvCategory('Yarn'); setInvQty(''); setInvUnit('skeins');
    setInvCost(''); setInvThreshold(5); setEditInventoryId(null); setIsInventoryFormOpen(false);
  };

  // Expenses Functions
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDate || expAmount === '' || !expDesc) return;

    const expData = {
      date: expDate, category: expCategory, amount: Number(expAmount), description: expDesc
    };

    try {
      if (editExpenseId) {
        const res = await fetch(`/api/expenses/${editExpenseId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expData)
        });
        const updated = await res.json();
        setExpenses(expenses.map(exp => exp._id === editExpenseId ? updated : exp));
      } else {
        const res = await fetch('/api/expenses', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expData)
        });
        const saved = await res.json();
        setExpenses([saved, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      resetExpenseForm();
    } catch (err) { console.error('Failed to save expense', err); }
  };

  const handleExpenseEdit = (exp: Expense) => {
    setExpDate(exp.date); setExpCategory(exp.category); setExpAmount(exp.amount);
    setExpDesc(exp.description); setEditExpenseId(exp._id!); setIsExpenseFormOpen(true);
  };

  const handleExpenseDelete = async (id: string) => {
    if (window.confirm('Delete this expense record?')) {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e._id !== id));
    }
  };

  const resetExpenseForm = () => {
    setExpDate(new Date().toISOString().split('T')[0]); setExpCategory('Packaging');
    setExpAmount(''); setExpDesc(''); setEditExpenseId(null); setIsExpenseFormOpen(false);
  };

  // Helper: Copy Shipping Label
  const handleCopyLabel = (order: CustomerOrder) => {
    const labelText = `To:\n${order.customerName}\n${order.customerAddress || ''}\nPhone: ${order.customerPhone || ''}\n\n[Twisted Bliss]`;
    navigator.clipboard.writeText(labelText);
    toast.success('Shipping Label copied to clipboard!');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.toLowerCase(), password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tb_admin_token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setIsProfileDropdownOpen(false);
        setIsProfileModalOpen(false);
        toast.success(`Welcome back, ${data.user.name}!`);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Invalid credentials.');
      }
    } catch (err) {
      toast.error('Failed to connect to server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tb_admin_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(false);
    toast.success('Logged out successfully.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNewUser: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to 1MB to avoid DB bloat)
    if (file.size > 1024 * 1024) {
      toast.error('Image must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isNewUser) {
        setNewUserPhotoUrl(base64String);
      } else {
        setProfilePhotoUrl(base64String);
      }
      toast.success('Photo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const payload: any = { name: profileName, email: profileEmail.toLowerCase(), profilePhotoUrl };
      if (profilePassword) payload.password = profilePassword;

      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setIsProfileModalOpen(false);
        setProfilePassword('');
        toast.success('Profile updated successfully!');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile Update Error:', err);
      toast.error('Connection error.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail.toLowerCase(),
          password: newUserPassword,
          profilePhotoUrl: newUserPhotoUrl
        })
      });

      if (res.ok) {
        toast.success(`User ${newUserName} created!`);
        setIsAddingUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserPhotoUrl('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create user.');
      }
    } catch (err) {
      console.error('User Creation Error:', err);
      toast.error('Connection error.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-sky-100"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-sky-500/20 p-4 rounded-2xl">
              <YarnBall className="w-10 h-10 text-sky-500" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-black text-center text-sky-500 mb-2">Twisted Bliss</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">Access the secure admin gateway</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Admin Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Unlock Gateway'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center text-sky-400 font-display text-3xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 font-sans pb-20">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '1rem', background: '#fff', color: '#334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }} />
      {error && (
        <div className="bg-red-900/50 border-b border-red-500 text-red-200 p-4 text-center">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-sky-500/20 p-2.5 rounded-xl border border-sky-500/30">
              <YarnBall className="w-6 h-6 text-sky-500" />
            </div>
            <h1 className="text-3xl font-display font-black text-sky-500 tracking-wide" style={{ textShadow: '0 2px 10px rgba(14, 165, 233, 0.2)' }}>
              Twisted Bliss
            </h1>
          </motion.div>

          <div className="flex gap-2 bg-sky-50 p-1 rounded-xl border border-sky-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('crafters')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'crafters' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <Factory className="w-4 h-4" />
              <span className="hidden sm:inline">Production</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'sales' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Order Desk</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Shipping</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-4 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-10 h-10 rounded-full border-2 border-sky-200 overflow-hidden hover:border-sky-500 transition-all shadow-sm flex items-center justify-center bg-white"
            >
              {currentUser?.profilePhotoUrl ? (
                <img src={currentUser.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold uppercase">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
            </motion.button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-48 bg-white rounded-2xl shadow-xl border border-sky-100 py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-sky-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{currentUser?.name}</p>
                    </div>
                    <button
                      onClick={() => { setIsProfileModalOpen(true); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Account Settings
                    </button>
                    <button
                      onClick={() => { setIsAddingUserModalOpen(true); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Add Admin User
                    </button>
                    <div className="border-t border-sky-50 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Command Center Insights</h2>              <p className="text-slate-600">Overview of all operations, revenue, and costs across all crafters.</p>
            </div>

            {/* Command Center KPI Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500 rounded-full blur-[120px] opacity-20 -ml-20 -mb-20"></div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                <div className="border-b md:border-b-0 md:border-r border-slate-700/50 pb-6 md:pb-0 px-4">
                  <p className="text-slate-400 font-semibold mb-3 uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2">
                    <Target className="w-3 h-3 text-emerald-400" /> Net Margin
                  </p>
                  <p className="text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-2">
                    {netMargin}%
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Yield</span>
                  </p>
                </div>

                <div className="border-b md:border-b-0 md:border-r border-slate-700/50 pb-6 md:pb-0 px-4">
                  <p className="text-slate-400 font-semibold mb-3 uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2">
                    <ShoppingBag className="w-3 h-3 text-sky-400" /> Avg Order Value
                  </p>
                  <p className="text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-2">
                    ₹{avgOrderValue}
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">Ticket</span>
                  </p>
                </div>

                <div className="border-b md:border-b-0 md:border-r border-slate-700/50 pb-6 md:pb-0 px-4">
                  <p className="text-slate-400 font-semibold mb-3 uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2">
                    <ArrowUpRight className="w-3 h-3 text-indigo-400" /> True ROI
                  </p>
                  <p className="text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-2">
                    {trueROI}%
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">Growth</span>
                  </p>
                </div>

                <div className="pb-6 md:pb-0 px-4">
                  <p className="text-slate-400 font-semibold mb-3 uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2">
                    <Box className="w-3 h-3 text-amber-400" /> Stock Health
                  </p>
                  <p className="text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-2">
                    {inventoryHealth}%
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Supply</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={IndianRupee} color="text-sky-600" bgColor="bg-sky-400/20" />
              <StatCard title="Operating Expenses" value={`₹${(totalExpenses + totalShippingDeductions).toFixed(2)}`} icon={Receipt} color="text-rose-600" bgColor="bg-rose-400/20" />
              <StatCard title="Total Material Cost" value={`₹${totalMaterialCost.toFixed(2)}`} icon={Package} color="text-amber-600" bgColor="bg-amber-400/20" />
              <StatCard title="Total Labor Cost" value={`₹${totalLaborCost.toFixed(2)}`} icon={Users} color="text-indigo-600" bgColor="bg-indigo-400/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Hooks Out</p>
                  <p className="text-2xl font-bold text-purple-600">{adminTotalHooks}</p>
                </div>
              </div>
              <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-pink-500/20">
                  <YarnBall className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-bold text-pink-600">{orders.length + customerOrders.length}</p>
                </div>
              </div>
              <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Crafters</p>
                  <p className="text-2xl font-bold text-blue-600">{crafters.length}</p>
                </div>
              </div>
            </div>

            {/* --- Advanced Analytics Visual Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              {/* Best Sellers Pie Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-fuchsia-100 rounded-xl text-fuchsia-600"><PieChart size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-800">Top Selling Products</h3>
                </div>
                <div className="h-72">
                  {bestSellersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={bestSellersData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {bestSellersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, 'Sold']} />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">Not enough sales data yet.</div>
                  )}
                </div>
              </div>

              {/* Monthly Revenue Bar Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sky-100 rounded-xl text-sky-600"><BarChart3 size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-800">Monthly Revenue Trend</h3>
                </div>
                <div className="h-72">
                  {monthlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">No revenue data for the last 6 months.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Customer Lifetime Value (CLV) VIP Leaderboard */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><Users size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-800">VIP Customers (CLV)</h3>
                </div>
                <div className="space-y-4">
                  {clvData.length > 0 ? clvData.map((cust, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm">
                          #{idx + 1}
                        </div>
                        <span className="font-semibold text-slate-700">{cust.name}</span>
                      </div>
                      <span className="font-bold text-emerald-600">₹{cust.totalSpent.toFixed(2)}</span>
                    </div>
                  )) : <div className="text-center text-slate-400 py-4">No completed orders yet.</div>}
                </div>
              </div>

              {/* Order Fulfillment Metrics */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-200 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-200">
                  <Package className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Avg. Fulfillment Time</h3>
                <p className="text-slate-500 mb-6 max-w-xs">The average number of days it takes from receiving an order to marking it completed.</p>
                <div className="text-6xl font-black text-indigo-600 font-display">
                  {avgFulfillmentTime} <span className="text-2xl font-bold text-indigo-400">Days</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-sky-200 bg-sky-50">
                <h3 className="text-lg font-semibold text-slate-800">Crafter Performance Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-sky-100/50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Crafter Name</th>
                      <th className="px-6 py-4 text-center">Orders</th>
                      <th className="px-6 py-4 text-center">Hooks</th>
                      <th className="px-6 py-4 text-right">Revenue</th>
                      <th className="px-6 py-4 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {crafters.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No crafters added yet.</td>
                      </tr>
                    ) : (
                      crafters.map((c, index) => {
                        const cOrders = orders.filter(o => o.crafterId === c._id);
                        const cRev = cOrders.reduce((sum, o) => sum + o.revenue, 0);
                        const cProf = cOrders.reduce((sum, o) => sum + o.profit, 0);
                        return (
                          <tr key={c._id || index} className="hover:bg-sky-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-sky-600">{c.name}</td>
                            <td className="px-6 py-4 text-center">{cOrders.length}</td>
                            <td className="px-6 py-4 text-center">{c.hooks || 0}</td>
                            <td className="px-6 py-4 text-right">₹{cRev.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-right font-bold ${cProf >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ₹{cProf.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Crafters Tab */}
        {activeTab === 'crafters' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Production Hub</h2>
                <p className="text-slate-600">Manage production orders and material costs.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-2xl border border-sky-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Hooks</p>
                  <p className="text-xl font-black text-sky-600">{adminTotalHooks}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-sky-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Tasks</p>
                  <p className="text-xl font-black text-indigo-600">{orders.filter(o => !o.completed).length}</p>
                </div>
              </div>
            </div>

            {/* UX Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search crafters or pieces..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 max-w-sm w-full"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Removed the grid wrapper that squeezed this row into 1/4th width */}
            <section className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Select Portfolio</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none text-slate-800 font-medium transition-colors"
                      value={currentCrafterId}
                      onChange={(e) => setCurrentCrafterId(e.target.value)}
                    >
                      <option value="">-- Choose a Lady --</option>
                      {crafters.map((c, index) => (
                        <option key={c._id || index} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-3 w-full md:w-auto">
                  <div className="flex-1 md:w-48">
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">New Lady</label>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                      value={newCrafterName}
                      onChange={(e) => setNewCrafterName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 md:w-40">
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      placeholder="Phone..."
                      className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                      value={newCrafterPhone}
                      onChange={(e) => setNewCrafterPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 md:w-64">
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Address</label>
                    <input
                      type="text"
                      placeholder="Address..."
                      className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                      value={newCrafterAddress}
                      onChange={(e) => setNewCrafterAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCrafter()}
                    />
                  </div>
                  <button
                    onClick={handleAddCrafter}
                    disabled={!newCrafterName.trim()}
                    className="px-5 py-3 bg-white hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200 h-[50px]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>              </div>
            </section>

            {currentCrafter && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-sky-200 shadow-sm">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold text-indigo-600 flex items-center gap-3">
                      <User className="w-8 h-8 text-indigo-500" /> {currentCrafter.name}'s Portfolio
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium ml-11">
                      {currentCrafter.phone && <span className="flex items-center gap-1">📞 {currentCrafter.phone}</span>}
                      {currentCrafter.address && <span className="flex items-center gap-1">📍 {currentCrafter.address}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCrafter(currentCrafter._id!)}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 uppercase tracking-wider"
                  >                    <Trash2 className="w-4 h-4" /> Delete Lady
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard title="Overall Revenue" value={`₹${ladyTotalRev.toFixed(2)}`} icon={IndianRupee} color="text-sky-600" bgColor="bg-sky-400/20" />
                  <StatCard title="Overall Profit" value={`₹${ladyTotalProf.toFixed(2)}`} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-400/20" />
                  <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/20">
                      <Package className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Hooks Given</p>
                      <input
                        type="number"
                        value={currentCrafter.hooks || 0}
                        onChange={handleHooksChange}
                        className="mt-1 w-24 px-2 py-1 text-2xl font-bold text-sky-600 border-b-2 border-sky-300 focus:border-sky-500 focus:outline-none bg-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-display font-bold text-sky-600">Order History</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => exportToCSV(orders.filter(o => o.crafterId === currentCrafter._id), `${currentCrafter.name}_Orders`)}
                      className="px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-sky-200"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        if (isFormOpen && editOrderId) resetForm();
                        setIsFormOpen(!isFormOpen);
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200"
                    >
                      {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isFormOpen ? 'Close Form' : 'Add Order'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isFormOpen && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-200 mb-8">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          {editOrderId ? <Edit2 className="w-5 h-5 text-sky-500" /> : <Plus className="w-5 h-5 text-sky-500" />}
                          {editOrderId ? 'Edit Order' : `Add Order for ${currentCrafter.name}`}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Order Date *</label>
                              <input type="date" required value={orderDate} onChange={e => setOrderDate(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Crochet Piece *</label>
                              <input type="text" required placeholder="e.g. Amigurumi Bear" value={piece} onChange={e => setPiece(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                          </div>

                          <div className="bg-sky-50 p-6 rounded-2xl border border-sky-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Materials Provided</h4>

                            <div className="space-y-3 mb-5">
                              {yarns.map((yarn, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                  <input type="text" placeholder="Yarn Color" value={yarn.color} onChange={e => updateYarn(idx, 'color', e.target.value)} className="flex-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full text-slate-800" />
                                  <input type="number" placeholder="Qty (g)" value={yarn.qty} onChange={e => updateYarn(idx, 'qty', e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full text-slate-800" />
                                  <button type="button" onClick={() => removeYarn(idx)} className="p-2.5 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" disabled={yarns.length === 1}>
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button type="button" onClick={addYarn} className="text-sm text-slate-600 hover:text-sky-600 font-semibold flex items-center gap-1 mt-2 transition-colors bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-sm">
                                <Plus className="w-4 h-4" /> Add Yarn Color
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Stuffing (gm)</label>
                                <input type="number" placeholder="e.g. 150" value={stuffing} onChange={e => setStuffing(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Wire (details)</label>
                                <input type="text" placeholder="e.g. 2m thick" value={wire} onChange={e => setWire(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Safety Eyes</label>
                                <input type="text" placeholder="e.g. 2 pairs, 10mm" value={eyes} onChange={e => setEyes(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Total Material Cost (₹) *</label>
                              <input type="number" required min="0" step="0.01" value={materialCost} onChange={e => setMaterialCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Qty Ordered *</label>
                              <input type="number" required min="1" value={qtyOrdered} onChange={e => setQtyOrdered(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Qty Received</label>
                              <input type="number" min="0" placeholder="Leave blank if pending" value={qtyReceived} onChange={e => setQtyReceived(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Time Taken (Days)</label>
                              <input type="text" placeholder="Leave blank if pending" value={timeTaken} onChange={e => setTimeTaken(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Labor Cost / Item (₹)</label>
                              <input type="number" min="0" step="0.01" placeholder="Leave blank if pending" value={laborCost} onChange={e => setLaborCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-600 mb-2">Selling Price / Item (₹)</label>
                              <input type="number" min="0" step="0.01" placeholder="Leave blank if pending" value={sellingPrice} onChange={e => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                            </div>
                          </div>

                          <div className="pt-6 flex justify-end gap-4">
                            <button type="button" onClick={() => { resetForm(); setIsFormOpen(false); }} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors uppercase tracking-wider text-sm">
                              Cancel
                            </button>
                            <button type="submit" className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200">
                              <Save className="w-4 h-4" />
                              {editOrderId ? 'Update Order' : 'Save Order'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-4 py-3">Order Date</th>
                          <th className="px-4 py-3">Piece (Qty)</th>
                          <th className="px-4 py-3 text-center">Received</th>
                          <th className="px-4 py-3">Materials</th>
                          <th className="px-4 py-3 text-center">Time</th>
                          <th className="px-4 py-3 text-right">Labor Cost</th>
                          <th className="px-4 py-3 text-right">Profit</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ladyOrders
                          .filter(o => o.crafterId === currentCrafterId)
                          .filter(o => {
                            if (statusFilter === 'All') return true;
                            if (statusFilter === 'Completed' && o.completed) return true;
                            if (statusFilter === 'Active' && !o.completed) return true;
                            return false;
                          })
                          .filter(o => {
                            if (!globalSearch) return true;
                            return o.piece.toLowerCase().includes(globalSearch.toLowerCase());
                          })
                          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                          .map((order, index) => (
                            <tr key={order._id || index} className="hover:bg-sky-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">{order.orderDate}</td>
                              <td className="px-4 py-4 font-semibold text-slate-800">{order.piece} ({order.qtyOrdered})</td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${order.qtyReceived === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                                  {order.qtyReceived === 0 ? "Pending" : order.qtyReceived}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-xs space-y-1">
                                {order.materialsObj?.yarns?.length > 0 && (
                                  <div><span className="font-semibold text-slate-500">Yarn:</span> {order.materialsObj.yarns.map(y => `${y.color} (${y.qty}g)`).join(', ')}</div>
                                )}
                                {order.materialsObj?.stuffing && <div><span className="font-semibold text-slate-500">Stuffing:</span> {order.materialsObj.stuffing}g</div>}
                                {order.materialsObj?.wire && <div><span className="font-semibold text-slate-500">Wire:</span> {order.materialsObj.wire}</div>}
                                {order.materialsObj?.eyes && <div><span className="font-semibold text-slate-500">Eyes:</span> {order.materialsObj.eyes}</div>}
                                {(!order.materialsObj || (!order.materialsObj.yarns.length && !order.materialsObj.stuffing && !order.materialsObj.wire && !order.materialsObj.eyes)) && <span className="text-slate-400 italic">None</span>}
                              </td>
                              <td className="px-4 py-4 text-center">{order.timeTaken || '-'}</td>
                              <td className="px-4 py-4 text-right">₹{order.totalLabor.toFixed(2)}</td>
                              <td className={`px-4 py-4 text-right font-bold ${order.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ₹{order.profit.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button onClick={() => toggleOrderStatus(order._id!, order.completed, order)} className={`p-2 rounded-lg transition-colors ${order.completed ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`} title="Mark as Completed">
                                  {order.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(order)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(order._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {!currentCrafter && crafters.length > 0 && (
              <div className="text-center py-16">
                <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-200 shadow-lg">
                  <User className="w-10 h-10 text-sky-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-sky-600">Select a Portfolio</h3>
                <p className="text-slate-600 mt-2">Choose a lady from the dropdown above to view her dashboard and orders.</p>
              </div>
            )}

            {!currentCrafter && crafters.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-200 shadow-lg">
                  <UserPlus className="w-10 h-10 text-sky-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-sky-600">Add your first lady</h3>
                <p className="text-slate-600 mt-2">Use the input above to add a new lady to your team.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Sales Dashboard Tab */}
        {activeTab === 'sales' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Order Desk</h2>
                <p className="text-slate-600">Manage incoming customer orders, track payments, and extra shipping costs.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Revenue</p>
                  <p className="text-xl font-black text-amber-600">
                    ₹{customerOrders.filter(o => o.status === 'Pending').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-amber-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unfulfilled</p>
                  <p className="text-xl font-black text-amber-700">{customerOrders.filter(o => o.status === 'Pending').length}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => exportToCSV(customerOrders, 'Sales_Orders_Export')}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => { resetSalesForm(); setIsSalesFormOpen(!isSalesFormOpen); }}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  {isSalesFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isSalesFormOpen ? 'Cancel' : 'New  Customer Order'}
                </button>
              </div>
            </div>

            {/* UX Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search customers or products..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 max-w-sm w-full"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <AnimatePresence>
              {isSalesFormOpen && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-200 mb-8">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                      {editSalesOrderId ? <Edit2 className="w-5 h-5 text-sky-500" /> : <Plus className="w-5 h-5 text-sky-500" />}
                      {editSalesOrderId ? 'Edit Customer Order' : 'New Customer Order'}
                    </h3>
                    <form onSubmit={handleSalesSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Customer Name *</label>
                          <input type="text" required placeholder="e.g. John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Order Date *</label>
                          <input type="date" required value={salesOrderDate} onChange={e => setSalesOrderDate(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Phone No. (Optional)</label>
                          <input type="tel" placeholder="e.g. +91 9876543210" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Delivery Address (Optional)</label>
                          <textarea placeholder="e.g. 123 Main St..." value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" rows={1}></textarea>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Products Ordered</h4>
                        <div className="space-y-3 mb-5">
                          {products.map((p, idx) => (
                            <div key={idx} className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
                              <div className="flex-1 min-w-[200px] relative">
                                <input 
                                  type="text" 
                                  list="inventory-finished-goods"
                                  required 
                                  placeholder="Product Name (e.g. Toy, Flower)" 
                                  value={p.name} 
                                  onChange={e => updateSaleProduct(idx, 'name', e.target.value)} 
                                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800" 
                                />
                                <datalist id="inventory-finished-goods">
                                  {inventory
                                    .filter(item => item.category === 'Finished Goods')
                                    .map((item, i) => (
                                      <option key={i} value={item.name}>{item.quantity} in stock - ₹{item.costPerUnit}</option>
                                    ))
                                  }
                                </datalist>
                                {p.name && !inventory.some(inv => inv.name.toLowerCase() === p.name.toLowerCase()) && (
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setInvName(p.name);
                                      setInvCategory('Finished Goods');
                                      setActiveTab('inventory');
                                      setIsInventoryFormOpen(true);
                                      toast.success(`Redirecting to Inventory to add "${p.name}"`);
                                    }}
                                    className="absolute -top-2 -right-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm hover:bg-amber-600"
                                  >
                                    + Stock
                                  </button>
                                )}
                              </div>                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="font-semibold text-slate-500">₹</span>
                                <input type="number" required min="0" step="0.01" placeholder="Price" value={p.price || ''} onChange={e => updateSaleProduct(idx, 'price', Number(e.target.value))} className="w-full sm:w-28 px-4 py-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800" />
                              </div>
                              <input type="number" required min="1" placeholder="Qty" value={p.qty || ''} onChange={e => updateSaleProduct(idx, 'qty', Number(e.target.value))} className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800" />
                              <button type="button" onClick={() => removeSaleProduct(idx)} className="p-2.5 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" disabled={products.length === 1}>
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={addSaleProduct} className="text-sm text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 mt-2 transition-colors bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                            <Plus className="w-4 h-4" /> Add Another Product
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Shipping Charge (₹)</label>
                          <input type="number" min="0" step="0.01" value={shippingCharge} onChange={e => setShippingCharge(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
                          <select value={salesStatus} onChange={e => setSalesStatus(e.target.value)} className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800">
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => { resetSalesForm(); setIsSalesFormOpen(false); }} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors uppercase tracking-wider text-sm">
                          Cancel
                        </button>
                        <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-md border border-amber-600">
                          <Save className="w-4 h-4" />
                          {editSalesOrderId ? 'Update Order' : 'Save Order'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 min-w-[200px]">Products (Qty x Price)</th>
                      <th className="px-6 py-4 text-right">Shipping</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                          No customer orders yet. Create one to track your sales!
                        </td>
                      </tr>
                    ) : (
                      customerOrders
                        .filter(o => {
                          if (statusFilter === 'All') return true;
                          return o.status === statusFilter;
                        })
                        .filter(o => {
                          if (!globalSearch) return true;
                          const s = globalSearch.toLowerCase();
                          return o.customerName.toLowerCase().includes(s) ||
                            (o.customerPhone && o.customerPhone.includes(s)) ||
                            o.products.some(p => p.name.toLowerCase().includes(s));
                        })
                        .map((order, index) => (
                          <tr key={order._id || index} className="hover:bg-amber-50 transition-colors group">
                            <td className="px-6 py-5 whitespace-nowrap text-slate-500 font-medium">
                              {order.orderDate}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-800">{order.customerName}</div>
                              {(order.customerPhone || order.customerAddress) && (
                                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                  {order.customerPhone && <div>📞 {order.customerPhone}</div>}
                                  {order.customerAddress && <div>📍 {order.customerAddress}</div>}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-xs space-y-1">
                              {order.products.map((p, i) => (
                                <div key={i}><span className="font-semibold text-slate-600">{p.name}</span> <span className="text-slate-500">({p.qty} x ₹{p.price})</span></div>
                              ))}
                            </td>
                            <td className="px-6 py-5 text-right text-slate-500">₹{order.shippingCharge?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-5 text-right font-bold text-amber-600 text-base">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={() => toggleSalesOrderStatus(order)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${order.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                                  : order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200'
                                    : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                                  }`}
                              >
                                {order.status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                {order.status}
                              </button>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleSalesEdit(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleSalesDelete(order._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete Order">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleCopyLabel(order)}
                                className="mt-2 w-full px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded text-xs font-semibold transition-colors text-center"
                                title="Copy details formatted for Shipping Addrress"
                              >
                                Copy Label
                              </button>
                              {order.shippingCharge > 0 && (
                                <button
                                  onClick={() => deductShippingFromWallet(order)}
                                  className="mt-2 w-full px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                  title="Deduct this shipping cost from the Wallet"
                                >
                                  <Wallet className="w-3 h-3" /> Deduct ₹{order.shippingCharge}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping Wallet Tab */}
        {activeTab === 'wallet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Shipping Logistics</h2>
              <p className="text-slate-600">Track funds added to services like Shiprocket or Shipmozo, and monitor deductions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Added (Investment)" value={`₹${walletTotalAdded.toFixed(2)}`} icon={TrendingUp} color="text-indigo-600" bgColor="bg-indigo-400/20" />
              <StatCard title="Total Shipping Cost" value={`₹${walletTotalDeducted.toFixed(2)}`} icon={Package} color="text-rose-600" bgColor="bg-rose-400/20" />
              <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${walletBalance < 1000 ? 'bg-amber-400/20' : 'bg-emerald-400/20'}`}>
                  <Wallet className={`w-6 h-6 ${walletBalance < 1000 ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Current Balance</p>
                  <p className={`text-2xl font-bold ${walletBalance < 1000 ? 'text-amber-600' : 'text-emerald-600'}`}>₹{walletBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <h3 className="text-2xl font-display font-bold text-sky-600">Wallet Transactions</h3>
              <button
                onClick={() => setIsWalletFormOpen(!isWalletFormOpen)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm"
              >
                {isWalletFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isWalletFormOpen ? 'Close' : 'Add Funds'}
              </button>
            </div>

            <AnimatePresence>
              {isWalletFormOpen && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-200 mb-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-indigo-500" />
                      Add Money to Wallet
                    </h3>
                    <form onSubmit={handleWalletSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                          <input type="date" required value={walletDate} onChange={e => setWalletDate(e.target.value)} className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Service Provider</label>
                          <select value={aggregator} onChange={e => setAggregator(e.target.value)} className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800">
                            <option value="Shiprocket">Shiprocket</option>
                            <option value="Shipmozo">Shipmozo</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) *</label>
                          <input type="number" required min="1" step="0.01" placeholder="e.g. 5000" value={walletAmount} onChange={e => setWalletAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Ref/Tracking ID</label>
                          <input type="text" placeholder="Optional" value={referenceId} onChange={e => setReferenceId(e.target.value)} className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all text-sm shadow-md">
                          Save Deposit
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-4 whitespace-nowrap">Date</th>
                      <th className="px-4 py-4">Account/Service</th>
                      <th className="px-4 py-4">Type</th>
                      <th className="px-4 py-4">Ref/Order ID</th>
                      <th className="px-4 py-4 text-right">Amount</th>
                      <th className="px-4 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {walletTxns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      walletTxns.map((txn, index) => (
                        <tr key={txn._id || index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">{txn.date}</td>
                          <td className="px-4 py-4 font-semibold text-slate-800">{txn.aggregator}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${txn.type === 'add_funds' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                              {txn.type === 'add_funds' ? 'Deposit' : 'Shipping Deduction'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-500">{txn.referenceId || '-'}</td>
                          <td className={`px-4 py-4 text-right font-bold ${txn.type === 'add_funds' ? 'text-indigo-600' : 'text-amber-600'}`}>
                            {txn.type === 'add_funds' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button onClick={() => handleWalletDelete(txn._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Inventory Lab</h2>
                <p className="text-slate-600">Track yarns, materials, and packaging stock automatically.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Value</p>
                  <p className="text-xl font-black text-indigo-600">₹{inventoryTotalCost.toFixed(0)}</p>
                </div>
                <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical Stock</p>
                  <p className="text-xl font-black text-rose-600">{lowStockCount}</p>
                </div>
              </div>
              <button
                onClick={() => { resetInventoryForm(); setIsInventoryFormOpen(!isInventoryFormOpen); }}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm"
              >
                {isInventoryFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isInventoryFormOpen ? 'Close' : 'Add Item'}
              </button>
            </div>

            {/* Predictive Inventory Warnings */}
            {inventoryWarnings.length > 0 && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg"><TrendingUp className="w-5 h-5 text-rose-600" /></div>
                  <h3 className="text-lg font-bold text-rose-800">Action Required: Supply Shortage for Pending Orders</h3>
                </div>
                <ul className="space-y-2 ml-12">
                  {inventoryWarnings.map((warn, i) => (
                    <li key={i} className="text-rose-700 font-medium text-sm list-disc">{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            <AnimatePresence>
              {isInventoryFormOpen && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <Box className="w-6 h-6 text-indigo-500" />
                      {editInventoryId ? 'Edit Material' : 'Add Material Stock'}
                    </h3>
                    <form onSubmit={handleInventorySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Item Name *</label>
                          <input type="text" required placeholder="e.g. Red Acrylic Yarn" value={invName} onChange={e => setInvName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Category *</label>
                          <select required value={invCategory} onChange={e => setInvCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800">
                            <option value="Yarn">Yarn</option>
                            <option value="Stuffing">Stuffing</option>
                            <option value="Packaging">Packaging</option>
                            <option value="Accessory">Accessory (Eyes, Wires)</option>
                            <option value="Finished Goods">Finished Goods (Sellable)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Quantity *</label>
                            <input type="number" required min="0" step="0.01" value={invQty} onChange={e => setInvQty(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Unit *</label>
                            <input type="text" required placeholder="e.g. skeins, kg" value={invUnit} onChange={e => setInvUnit(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Cost Per Unit (₹) *</label>
                          <input type="number" required min="0" step="0.01" value={invCost} onChange={e => setInvCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Low Stock Alert at</label>
                          <input type="number" required min="0" value={invThreshold} onChange={e => setInvThreshold(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md text-sm">
                          {editInventoryId ? 'Update Stock' : 'Save Material'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-5 whitespace-nowrap">Material Name</th>
                      <th className="px-6 py-5">Category</th>
                      <th className="px-6 py-5">In Stock</th>
                      <th className="px-6 py-5">Cost/Unit</th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                          Inventory is empty. Add materials to start tracking stock.
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item, index) => {
                        const isLow = item.quantity <= item.lowStockThreshold;
                        return (
                          <tr key={item._id || index} className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-rose-50/50' : ''}`}>
                            <td className="px-6 py-5 font-bold text-slate-800">{item.name}</td>
                            <td className="px-6 py-5">
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-lg font-bold">
                              {item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                            </td>
                            <td className="px-6 py-5 font-medium text-slate-600">₹{item.costPerUnit.toFixed(2)}</td>
                            <td className="px-6 py-5 text-center">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-md animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> LOW STOCK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                                  <CheckCircle className="w-3 h-3" /> OPTIMAL
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex justify-end items-center gap-2">
                                <button onClick={() => handleInventoryEdit(item)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" title="Edit Stock">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleInventoryDelete(item._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expenses Ledger Tab */}
        {activeTab === 'expenses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Expense Vault</h2>
                <p className="text-slate-600">Track structural and miscellaneous costs (web hosting, packaging, ads, etc).</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Burn</p>
                  <p className="text-xl font-black text-rose-600">₹{totalExpenses.toFixed(0)}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
                  <p className="text-xl font-black text-slate-700">{new Set(expenses.map(e => e.category)).size}</p>
                </div>
              </div>
              <button
                onClick={() => { resetExpenseForm(); setIsExpenseFormOpen(!isExpenseFormOpen); }}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm"
              >
                {isExpenseFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isExpenseFormOpen ? 'Close' : 'Log Expense'}
              </button>
            </div>

            <AnimatePresence>
              {isExpenseFormOpen && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-rose-200 mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <Receipt className="w-6 h-6 text-rose-500" />
                      {editExpenseId ? 'Edit Ledger Entry' : 'Log New Expense'}
                    </h3>
                    <form onSubmit={handleExpenseSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Date *</label>
                          <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Category *</label>
                          <select required value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800">
                            <option value="Packaging">Packaging</option>
                            <option value="Marketing/Ads">Marketing & Ads</option>
                            <option value="Web Hosting">Web Hosting & Tools</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Amount (₹) *</label>
                          <input type="number" required min="1" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">Description *</label>
                          <input type="text" required placeholder="e.g. Meta Ads, Tape & Boxes" value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md text-sm">
                          {editExpenseId ? 'Update Entry' : 'Add to Ledger'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-xl border border-rose-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-rose-50 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Date</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 w-1/2">Description</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/50">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          Great job! No structural expenses tracked yet.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((expense, index) => (
                        <tr key={expense._id || index} className="hover:bg-rose-50/30 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap text-slate-600 font-medium">{expense.date}</td>
                          <td className="px-6 py-5 font-bold text-slate-800">{expense.category}</td>
                          <td className="px-6 py-5 text-slate-600">{expense.description}</td>
                          <td className="px-6 py-5 text-right font-bold text-rose-600 text-base">₹{expense.amount.toFixed(2)}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleExpenseEdit(expense)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleExpenseDelete(expense._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="mb-10">
              <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">System Audit Logs</h2>              <p className="text-slate-600">Review all administrative actions performed across the system.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          No activity logs found yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log, index) => (
                        <tr key={log._id || index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap text-slate-500 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-800">{log.userName}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-600 italic">
                            {log.details || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
            >
              <div className="bg-sky-500 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6" /> Profile Settings
                </h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-sky-100 overflow-hidden shadow-inner">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-sky-50 flex items-center justify-center text-sky-300 font-bold text-3xl">
                          {profileName?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Profile Photo</label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfilePhotoUrl('')}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">New Password (optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={profilePassword}
                      onChange={e => setProfilePassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Admin User Modal */}
        {isAddingUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
            >
              <div className="bg-sky-500 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="w-6 h-6" /> Add New Admin
                </h3>
                <button onClick={() => setIsAddingUserModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                  <input
                    type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                  <input
                    type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Initial Password</label>
                  <input
                    type="password" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Profile Photo (Optional)</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border border-sky-200">
                      {newUserPhotoUrl ? (
                        <img src={newUserPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-2 text-sky-300" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button" onClick={() => setIsAddingUserModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isCreatingUser}
                    className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isCreatingUser ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
