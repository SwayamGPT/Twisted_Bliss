import React, { Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronDown, UserPlus, Trash2, Package, TrendingUp, IndianRupee, Plus, X, Edit2, Save, CheckCircle, Circle
} from 'lucide-react';
import { StatCard } from '../Common';
import { Crafter, Order, Yarn } from '../../types';

interface ProductionTabProps {
  adminTotalHooks: number;
  orders: Order[];
  globalSearch: string;
  setGlobalSearch: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  currentCrafterId: string;
  setCurrentCrafterId: Dispatch<SetStateAction<string>>;
  crafters: Crafter[];
  newCrafterName: string;
  setNewCrafterName: Dispatch<SetStateAction<string>>;
  newCrafterPhone: string;
  setNewCrafterPhone: Dispatch<SetStateAction<string>>;
  newCrafterAddress: string;
  setNewCrafterAddress: Dispatch<SetStateAction<string>>;
  handleAddCrafter: () => void;
  currentCrafter: Crafter | undefined;
  handleDeleteCrafter: (id: string) => void;
  ladyTotalRev: number;
  ladyTotalProf: number;
  handleHooksChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  exportToCSV: (data: any[], filename: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  editOrderId: string | null;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  orderDate: string;
  setOrderDate: Dispatch<SetStateAction<string>>;
  piece: string;
  setPiece: Dispatch<SetStateAction<string>>;
  yarns: Yarn[];
  addYarn: () => void;
  removeYarn: (idx: number) => void;
  updateYarn: (idx: number, field: keyof Yarn, value: string) => void;
  stuffing: string;
  setStuffing: Dispatch<SetStateAction<string>>;
  wire: string;
  setWire: Dispatch<SetStateAction<string>>;
  eyes: string;
  setEyes: Dispatch<SetStateAction<string>>;
  materialCost: string | number;
  setMaterialCost: Dispatch<SetStateAction<number | "">>;
  qtyOrdered: string | number;
  setQtyOrdered: Dispatch<SetStateAction<number | "">>;
  qtyReceived: string | number;
  setQtyReceived: Dispatch<SetStateAction<number | "">>;
  timeTaken: string;
  setTimeTaken: Dispatch<SetStateAction<string>>;
  laborCost: string | number;
  setLaborCost: Dispatch<SetStateAction<number | "">>;
  sellingPrice: string | number;
  setSellingPrice: Dispatch<SetStateAction<number | "">>;
  ladyOrders: Order[];
  toggleOrderStatus: (id: string, status: boolean, order: Order) => void;
  handleEdit: (order: Order) => void;
  handleDelete: (id: string) => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({
  adminTotalHooks, orders, globalSearch, setGlobalSearch, statusFilter, setStatusFilter,
  currentCrafterId, setCurrentCrafterId, crafters, newCrafterName, setNewCrafterName,
  newCrafterPhone, setNewCrafterPhone, newCrafterAddress, setNewCrafterAddress, handleAddCrafter,
  currentCrafter, handleDeleteCrafter, ladyTotalRev, ladyTotalProf, handleHooksChange,
  exportToCSV, isFormOpen, setIsFormOpen, editOrderId, resetForm, handleSubmit,
  orderDate, setOrderDate, piece, setPiece, yarns, addYarn, removeYarn, updateYarn,
  stuffing, setStuffing, wire, setWire, eyes, setEyes, materialCost, setMaterialCost,
  qtyOrdered, setQtyOrdered, qtyReceived, setQtyReceived, timeTaken, setTimeTaken,
  laborCost, setLaborCost, sellingPrice, setSellingPrice, ladyOrders, toggleOrderStatus,
  handleEdit, handleDelete
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-800 mb-2">Production Hub</h2>
          <p className="text-sm sm:text-base text-slate-600">Manage production orders and material costs.</p>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-sky-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Hooks</p>
            <p className="text-lg sm:text-xl font-black text-sky-600">{adminTotalHooks}</p>
          </div>
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-sky-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Tasks</p>
            <p className="text-lg sm:text-xl font-black text-indigo-600">{orders.filter(o => !o.completed).length}</p>
          </div>
        </div>
      </div>

      {/* UX Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search crafters or pieces..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 w-full sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 w-full sm:w-auto"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <section className="bg-sky-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-200">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2 uppercase tracking-wider">Select Portfolio</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              <select
                className="w-full pl-9 pr-4 py-2 sm:py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 appearance-none text-slate-800 font-medium text-sm transition-colors"
                value={currentCrafterId}
                onChange={(e) => setCurrentCrafterId(e.target.value)}
              >
                <option value="">-- Choose a Lady --</option>
                {crafters.map((c, index) => (
                  <option key={c._id || index} value={c._id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
            <div className="flex-1 w-full sm:w-40 lg:w-48">
              <label className="block text-[10px] sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2 uppercase tracking-wider">New Lady</label>
              <input
                type="text"
                placeholder="Name..."
                className="w-full px-4 py-2 sm:py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                value={newCrafterName}
                onChange={(e) => setNewCrafterName(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full sm:w-32 lg:w-40 hidden sm:block">
              <label className="block text-[10px] sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2 uppercase tracking-wider">Phone</label>
              <input
                type="text"
                placeholder="Phone..."
                className="w-full px-4 py-2 sm:py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                value={newCrafterPhone}
                onChange={(e) => setNewCrafterPhone(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddCrafter}
              disabled={!newCrafterName.trim()}
              className="w-full sm:w-auto px-5 py-2 sm:py-3 bg-white hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm shadow-sm border border-slate-200 sm:h-[46px] lg:h-[50px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </section>

      {currentCrafter && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-sky-200 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-indigo-600 flex items-center gap-2 sm:gap-3">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" /> {currentCrafter.name}
              </h2>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-sm text-slate-500 font-medium ml-8 sm:ml-11">
                {currentCrafter.phone && <span className="flex items-center gap-1 truncate max-w-[150px]">📞 {currentCrafter.phone}</span>}
                {currentCrafter.address && <span className="flex items-center gap-1 truncate max-w-[200px]">📍 {currentCrafter.address}</span>}
              </div>
            </div>
            <button
              onClick={() => handleDeleteCrafter(currentCrafter._id!)}
              className="w-full sm:w-auto px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard title="Revenue" value={`₹${ladyTotalRev.toFixed(0)}`} icon={IndianRupee} color="text-sky-600" bgColor="bg-sky-400/20" />
            <StatCard title="Profit" value={`₹${ladyTotalProf.toFixed(0)}`} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-400/20" />
            <div className="bg-sky-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-indigo-500/20">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Hooks</p>
                <input
                  type="number"
                  value={currentCrafter.hooks || 0}
                  onChange={handleHooksChange}
                  className="mt-1 w-full px-1 py-0.5 text-xl sm:text-2xl font-bold text-sky-600 border-b-2 border-sky-300 focus:border-sky-500 focus:outline-none bg-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-sky-600">Order History</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => exportToCSV(orders.filter(o => o.crafterId === currentCrafter._id), `${currentCrafter.name}_Orders`)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-[10px] sm:text-sm shadow-sm border border-sky-200"
              >
                Export
              </button>
              <button
                onClick={() => {
                  if (isFormOpen && editOrderId) resetForm();
                  setIsFormOpen(!isFormOpen);
                }}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-[10px] sm:text-sm shadow-sm border border-slate-200"
              >
                {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isFormOpen ? 'Close' : 'Add Order'}
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
                <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-sky-200 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                    {editOrderId ? <Edit2 className="w-5 h-5 text-sky-500" /> : <Plus className="w-5 h-5 text-sky-500" />}
                    {editOrderId ? 'Edit Order' : 'New Order'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Order Date *</label>
                        <input type="date" required value={orderDate} onChange={e => setOrderDate(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Piece Name *</label>
                        <input type="text" required placeholder="e.g. Amigurumi Bear" value={piece} onChange={e => setPiece(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                      </div>
                    </div>

                    <div className="bg-sky-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-sky-200">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 sm:mb-4 uppercase tracking-wider">Materials</h4>

                      <div className="space-y-3 mb-4 sm:mb-5">
                        {yarns.map((yarn, idx) => (
                          <div key={idx} className="flex gap-2 sm:gap-3 items-center">
                            <input type="text" placeholder="Yarn Color" value={yarn.color} onChange={e => updateYarn(idx, 'color', e.target.value)} className="flex-[2] px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-sky-200 rounded-lg text-sm" />
                            <input type="number" placeholder="Qty (g)" value={yarn.qty} onChange={e => updateYarn(idx, 'qty', e.target.value)} className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-sky-200 rounded-lg text-sm w-20" />
                            <button type="button" onClick={() => removeYarn(idx)} className="p-2 sm:p-2.5 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" disabled={yarns.length === 1}>
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addYarn} className="text-[10px] sm:text-sm text-slate-600 hover:text-sky-600 font-semibold flex items-center gap-1 mt-1 transition-colors bg-white px-2 py-1 rounded-lg border border-sky-200 shadow-sm">
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Color
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                        <div>
                          <label className="block text-[8px] sm:text-[10px] font-semibold text-slate-500 mb-1 uppercase">Stuffing(g)</label>
                          <input type="number" placeholder="e.g. 150" value={stuffing} onChange={e => setStuffing(e.target.value)} className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-[8px] sm:text-[10px] font-semibold text-slate-500 mb-1 uppercase">Wire</label>
                          <input type="text" placeholder="e.g. 2m" value={wire} onChange={e => setWire(e.target.value)} className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-sm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[8px] sm:text-[10px] font-semibold text-slate-500 mb-1 uppercase">Eyes</label>
                          <input type="text" placeholder="e.g. 2 pairs" value={eyes} onChange={e => setEyes(e.target.value)} className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Mat. Cost *</label>
                        <input type="number" required min="0" step="0.01" value={materialCost} onChange={e => setMaterialCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Qty Ord *</label>
                        <input type="number" required min="1" value={qtyOrdered} onChange={e => setQtyOrdered(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Qty Recv</label>
                        <input type="number" min="0" placeholder="0" value={qtyReceived} onChange={e => setQtyReceived(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Days</label>
                        <input type="text" placeholder="0" value={timeTaken} onChange={e => setTimeTaken(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Labor/Item</label>
                        <input type="number" min="0" step="0.01" placeholder="0" value={laborCost} onChange={e => setLaborCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Price/Item</label>
                        <input type="number" min="0" step="0.01" placeholder="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg text-sm" />
                      </div>
                    </div>

                    <div className="pt-4 sm:pt-6 flex justify-end gap-3 sm:gap-4">
                      <button type="button" onClick={() => { resetForm(); setIsFormOpen(false); }} className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors uppercase tracking-wider text-xs sm:text-sm">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold transition-all flex items-center gap-2 uppercase tracking-wider text-xs sm:text-sm shadow-md">
                        <Save className="w-4 h-4" />
                        {editOrderId ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                  <tr>
                    <th className="px-3 sm:px-4 py-3">Date</th>
                    <th className="px-3 sm:px-4 py-3">Piece</th>
                    <th className="px-3 sm:px-4 py-3 text-center">Recv</th>
                    <th className="px-3 sm:px-4 py-3 hidden sm:table-cell">Materials</th>
                    <th className="px-3 sm:px-4 py-3 text-center">Time</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Labor</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Profit</th>
                    <th className="px-3 sm:px-4 py-3 text-center">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ladyOrders
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
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-slate-600 font-medium text-[10px] sm:text-xs">{order.orderDate}</td>
                        <td className="px-3 sm:px-4 py-4 font-semibold text-slate-800 truncate max-w-[80px] sm:max-w-none">{order.piece} ({order.qtyOrdered})</td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${order.qtyReceived === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                            {order.qtyReceived || "0"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-[10px] space-y-1 hidden sm:table-cell">
                          {order.materialsObj?.yarns?.length > 0 && (
                            <div className="truncate max-w-[150px]"><span className="font-semibold text-slate-500">Yarn:</span> {order.materialsObj.yarns.map(y => `${y.color}`).join(', ')}</div>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center text-[10px] sm:text-xs">{order.timeTaken || '-'}</td>
                        <td className="px-3 sm:px-4 py-4 text-right text-[10px] sm:text-xs">₹{order.totalLabor.toFixed(0)}</td>
                        <td className={`px-3 sm:px-4 py-4 text-right font-bold text-[10px] sm:text-xs ${order.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ₹{order.profit.toFixed(0)}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <button onClick={() => toggleOrderStatus(order._id!, !!order.completed, order)} className={`p-1.5 rounded-lg transition-colors ${order.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {order.completed ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button onClick={() => handleEdit(order)} className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg">
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button onClick={() => handleDelete(order._id!)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
    </motion.div>
  );
};
