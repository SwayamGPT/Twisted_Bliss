import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, TrendingUp, IndianRupee, Package, 
  Save, X, UserPlus, ChevronDown, User, LayoutDashboard, Users,
  CheckCircle, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
type Crafter = { _id?: string; id?: string; name: string; hooks: number };
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

export default function App() {
  const [crafters, setCrafters] = useState<Crafter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'crafters'>('admin');
  const [currentCrafterId, setCurrentCrafterId] = useState<string>('');
  const [newCrafterName, setNewCrafterName] = useState('');
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
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

  const fetchData = async () => {
    try {
      const [craftersRes, ordersRes] = await Promise.all([
        fetch('/api/crafters'),
        fetch('/api/orders')
      ]);
      
      if (!craftersRes.ok) {
        const errorData = await craftersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch crafters. Please check your database connection.');
      }
      if (!ordersRes.ok) {
        const errorData = await ordersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders. Please check your database connection.');
      }

      const craftersData = await craftersRes.json();
      const ordersData = await ordersRes.json();
      
      setCrafters(craftersData);
      setOrders(ordersData);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCrafter = async () => {
    if (!newCrafterName.trim()) return;
    try {
      const res = await fetch('/api/crafters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCrafterName.trim(), hooks: 0 })
      });
      const newCrafter = await res.json();
      setCrafters([...crafters, newCrafter]);
      setNewCrafterName('');
      setCurrentCrafterId(newCrafter._id);
      setActiveTab('crafters');
    } catch (err) {
      console.error('Failed to add crafter', err);
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
      } catch (err) {
        console.error('Failed to delete crafter', err);
      }
    }
  };

  const currentCrafter = crafters.find(c => c._id === currentCrafterId);
  const ladyOrders = orders.filter(o => o.crafterId === currentCrafterId);
  const ladyTotalRev = ladyOrders.reduce((sum, o) => sum + o.revenue, 0);
  const ladyTotalProf = ladyOrders.reduce((sum, o) => sum + o.profit, 0);

  // Admin Stats
  const adminTotalRev = orders.reduce((sum, o) => sum + o.revenue, 0);
  const adminTotalProf = orders.reduce((sum, o) => sum + o.profit, 0);
  const adminTotalMatCost = orders.reduce((sum, o) => sum + o.materialCost, 0);
  const adminTotalLaborCost = orders.reduce((sum, o) => sum + o.totalLabor, 0);
  const adminTotalHooks = crafters.reduce((sum, c) => sum + (c.hooks || 0), 0);

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
      totalLabor, totalCost: totalCostToYou, revenue: totalRevenue, profit: netProfit
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

  const toggleOrderStatus = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, completed: !order.completed })
      });
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o._id === order._id ? updatedOrder : o));
    } catch (err) {
      console.error('Failed to toggle order status', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center text-sky-400 font-display text-3xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 font-sans pb-20">
      {error && (
        <div className="bg-red-900/50 border-b border-red-500 text-red-200 p-4 text-center">
          {error}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/20 p-2.5 rounded-xl border border-sky-500/30">
              <YarnBall className="w-6 h-6 text-sky-500" />
            </div>
            <h1 className="text-3xl font-display font-black text-sky-500 tracking-wide" style={{ textShadow: '0 2px 10px rgba(14, 165, 233, 0.2)' }}>
              Twisted Bliss
            </h1>
          </div>
          <div className="flex gap-2 bg-sky-50 p-1 rounded-xl border border-sky-200">
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Master Admin</span>
            </button>
            <button 
              onClick={() => setActiveTab('crafters')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'crafters' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio View</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">Master Admin Dashboard</h2>
              <p className="text-slate-600">Overview of all operations, revenue, and costs across all crafters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`₹${adminTotalRev.toFixed(2)}`} icon={IndianRupee} color="text-sky-600" bgColor="bg-sky-400/20" />
              <StatCard title="Total Profit" value={`₹${adminTotalProf.toFixed(2)}`} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-400/20" />
              <StatCard title="Total Material Cost" value={`₹${adminTotalMatCost.toFixed(2)}`} icon={Package} color="text-amber-600" bgColor="bg-amber-400/20" />
              <StatCard title="Total Labor Cost" value={`₹${adminTotalLaborCost.toFixed(2)}`} icon={Users} color="text-indigo-600" bgColor="bg-indigo-400/20" />
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
                  <p className="text-2xl font-bold text-pink-600">{orders.length}</p>
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
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 md:w-64">
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">New Lady</label>
                    <input 
                      type="text" 
                      placeholder="Name..." 
                      className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 transition-colors"
                      value={newCrafterName}
                      onChange={(e) => setNewCrafterName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCrafter()}
                    />
                  </div>
                  <button 
                    onClick={handleAddCrafter}
                    disabled={!newCrafterName.trim()}
                    className="mt-7 px-5 py-3 bg-white hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-lg font-semibold transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </section>

            {currentCrafter && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-sky-200 shadow-sm">
                  <h2 className="text-3xl font-display font-bold text-indigo-600 flex items-center gap-3">
                    <User className="w-8 h-8 text-indigo-500" /> {currentCrafter.name}'s Portfolio
                  </h2>
                  <button 
                    onClick={() => handleDeleteCrafter(currentCrafter._id!)}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Lady
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
                      <thead className="bg-sky-50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-4 py-4 whitespace-nowrap">Date</th>
                          <th className="px-4 py-4">Piece</th>
                          <th className="px-4 py-4 min-w-[200px]">Materials</th>
                          <th className="px-4 py-4 whitespace-nowrap">Qty (Rcvd/Ord)</th>
                          <th className="px-4 py-4 whitespace-nowrap">Time</th>
                          <th className="px-4 py-4 whitespace-nowrap text-right">Mat. Cost</th>
                          <th className="px-4 py-4 whitespace-nowrap text-right">Labor</th>
                          <th className="px-4 py-4 whitespace-nowrap text-right">Total Cost</th>
                          <th className="px-4 py-4 whitespace-nowrap text-right">Revenue</th>
                          <th className="px-4 py-4 whitespace-nowrap text-right">Profit</th>
                          <th className="px-4 py-4 text-center">Status</th>
                          <th className="px-4 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-100">
                        {ladyOrders.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                              No orders found for this crafter.
                            </td>
                          </tr>
                        ) : (
                          ladyOrders.map((order, index) => (
                            <tr key={order._id || index} className="hover:bg-sky-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">{order.orderDate || "N/A"}</td>
                              <td className="px-4 py-4 font-semibold text-slate-800">{order.piece}</td>
                              <td className="px-4 py-4 text-xs space-y-1">
                                {order.materialsObj?.yarns?.length > 0 && (
                                  <div><span className="font-semibold text-slate-500">Yarn:</span> {order.materialsObj.yarns.map(y => `${y.color} (${y.qty}g)`).join(', ')}</div>
                                )}
                                {order.materialsObj?.stuffing && <div><span className="font-semibold text-slate-500">Stuffing:</span> {order.materialsObj.stuffing}g</div>}
                                {order.materialsObj?.wire && <div><span className="font-semibold text-slate-500">Wire:</span> {order.materialsObj.wire}</div>}
                                {order.materialsObj?.eyes && <div><span className="font-semibold text-slate-500">Eyes:</span> {order.materialsObj.eyes}</div>}
                                {(!order.materialsObj || (!order.materialsObj.yarns.length && !order.materialsObj.stuffing && !order.materialsObj.wire && !order.materialsObj.eyes)) && <span className="text-slate-400 italic">None</span>}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${order.qtyReceived === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                                  {order.qtyReceived === 0 ? "Pending" : order.qtyReceived} / {order.qtyOrdered}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">{order.timeTaken}</td>
                              <td className="px-4 py-4 text-right">₹{order.materialCost.toFixed(2)}</td>
                              <td className="px-4 py-4 text-right">₹{order.totalLabor.toFixed(2)}</td>
                              <td className="px-4 py-4 text-right font-semibold">₹{order.totalCost.toFixed(2)}</td>
                              <td className="px-4 py-4 text-right font-semibold text-sky-600">₹{order.revenue.toFixed(2)}</td>
                              <td className={`px-4 py-4 text-right font-bold ${order.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ₹{order.profit.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button 
                                  onClick={() => toggleOrderStatus(order)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    order.completed 
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 shadow-sm' 
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 shadow-sm'
                                  }`}
                                >
                                  {order.completed ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                  {order.completed ? 'Done' : 'Active'}
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleEdit(order)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(order._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
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
      </main>
    </div>
  );
}
