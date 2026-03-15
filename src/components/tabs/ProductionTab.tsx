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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-sans font-extrabold text-slate-800 mb-2">Production Hub</h2>
          <p className="text-slate-600">Manage production orders and material costs.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white px-4 py-2 rounded-2xl border border-sky-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Hooks</p>
            <p className="text-xl font-black text-sky-600">{adminTotalHooks}</p>
          </div>
          <div className="flex-1 md:flex-none bg-white px-4 py-2 rounded-2xl border border-sky-100 shadow-sm text-center">
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
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 w-full md:max-w-sm"
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

      <section className="bg-sky-100 p-4 md:p-6 rounded-3xl shadow-lg border border-sky-200">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
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

          <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
            <div className="flex-1 w-full sm:w-48">
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">New Lady</label>
              <input
                type="text"
                placeholder="Name..."
                className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                value={newCrafterName}
                onChange={(e) => setNewCrafterName(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full sm:w-40">
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Phone</label>
              <input
                type="text"
                placeholder="Phone..."
                className="w-full px-4 py-3 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                value={newCrafterPhone}
                onChange={(e) => setNewCrafterPhone(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full sm:w-64">
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
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200 h-[50px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </section>

      {currentCrafter && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-3xl border border-sky-200 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-indigo-600 flex items-center gap-3">
                <User className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" /> {currentCrafter.name}'s Portfolio
              </h2>
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-slate-500 font-medium ml-9 md:ml-11">
                {currentCrafter.phone && <span className="flex items-center gap-1">📞 {currentCrafter.phone}</span>}
                {currentCrafter.address && <span className="flex items-center gap-1">📍 {currentCrafter.address}</span>}
              </div>
            </div>
            <button
              onClick={() => handleDeleteCrafter(currentCrafter._id!)}
              className="w-full sm:w-auto px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
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
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Hooks Given</p>
                <input
                  type="number"
                  value={currentCrafter.hooks || 0}
                  onChange={handleHooksChange}
                  className="mt-1 w-full px-2 py-1 text-2xl font-bold text-sky-600 border-b-2 border-sky-300 focus:border-sky-500 focus:outline-none bg-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-2xl font-display font-bold text-sky-600">Order History</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => exportToCSV(orders.filter(o => o.crafterId === currentCrafter._id), `${currentCrafter.name}_Orders`)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-sky-200"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  if (isFormOpen && editOrderId) resetForm();
                  setIsFormOpen(!isFormOpen);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-sm border border-slate-200"
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
                          <button onClick={() => toggleOrderStatus(order._id!, !!order.completed, order)} className={`p-2 rounded-lg transition-colors ${order.completed ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`} title="Mark as Completed">
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
    </motion.div>
  );
};
