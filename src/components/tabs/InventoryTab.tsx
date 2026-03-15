import React, { Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Plus, X, TrendingUp, AlertTriangle, CheckCircle, Edit2, Trash2
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryTabProps {
  inventoryTotalCost: number;
  lowStockCount: number;
  resetInventoryForm: () => void;
  isInventoryFormOpen: boolean;
  setIsInventoryFormOpen: Dispatch<SetStateAction<boolean>>;
  inventoryWarnings: string[];
  editInventoryId: string | null;
  handleInventorySubmit: (e: React.FormEvent) => void;
  invName: string;
  setInvName: Dispatch<SetStateAction<string>>;
  invCategory: string;
  setInvCategory: Dispatch<SetStateAction<string>>;
  invQty: string | number;
  setInvQty: Dispatch<SetStateAction<number | "">>;
  invUnit: string;
  setInvUnit: Dispatch<SetStateAction<string>>;
  invCost: string | number;
  setInvCost: Dispatch<SetStateAction<number | "">>;
  invThreshold: string | number;
  setInvThreshold: Dispatch<SetStateAction<number | "">>;
  inventory: InventoryItem[];
  handleInventoryEdit: (item: InventoryItem) => void;
  handleInventoryDelete: (id: string) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventoryTotalCost, lowStockCount, resetInventoryForm, isInventoryFormOpen, setIsInventoryFormOpen,
  inventoryWarnings, editInventoryId, handleInventorySubmit, invName, setInvName,
  invCategory, setInvCategory, invQty, setInvQty, invUnit, setInvUnit,
  invCost, setInvCost, invThreshold, setInvThreshold, inventory,
  handleInventoryEdit, handleInventoryDelete
}) => {
  return (
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
  );
};
