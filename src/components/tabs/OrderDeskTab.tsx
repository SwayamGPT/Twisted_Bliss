import React, { Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Edit2, Save, Trash2, CheckCircle, Circle, FileText, Copy, ShoppingBag
} from 'lucide-react';
import { CustomerOrder, InventoryItem, Product } from '../../types';
import { toast } from 'react-hot-toast';

interface OrderDeskTabProps {
  customerOrders: CustomerOrder[];
  exportToCSV: (data: any[], filename: string) => void;
  resetSalesForm: () => void;
  isSalesFormOpen: boolean;
  setIsSalesFormOpen: Dispatch<SetStateAction<boolean>>;
  globalSearch: string;
  setGlobalSearch: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  editSalesOrderId: string | null;
  handleSalesSubmit: (e: React.FormEvent) => void;
  customerName: string;
  setCustomerName: Dispatch<SetStateAction<string>>;
  salesOrderDate: string;
  setSalesOrderDate: Dispatch<SetStateAction<string>>;
  customerPhone: string;
  setCustomerPhone: Dispatch<SetStateAction<string>>;
  customerAddress: string;
  setCustomerAddress: Dispatch<SetStateAction<string>>;
  products: Product[];
  updateSaleProduct: (idx: number, field: keyof Product, value: any) => void;
  addSaleProduct: () => void;
  removeSaleProduct: (idx: number) => void;
  inventory: InventoryItem[];
  setInvName: Dispatch<SetStateAction<string>>;
  setInvCategory: Dispatch<SetStateAction<string>>;
  setActiveTab: Dispatch<SetStateAction<"admin" | "crafters" | "sales" | "wallet" | "inventory" | "expenses" | "audit">>;
  setIsInventoryFormOpen: Dispatch<SetStateAction<boolean>>;
  shippingCharge: string | number;
  setShippingCharge: Dispatch<SetStateAction<number | "">>;
  salesStatus: string;
  setSalesStatus: Dispatch<SetStateAction<string>>;
  toggleSalesOrderStatus: (order: CustomerOrder) => void;
  handleSalesEdit: (order: CustomerOrder) => void;
  handleSalesDelete: (id: string) => void;
  handleGenerateInvoice: (order: CustomerOrder) => void;
  handleCopyShippingLabel: (order: CustomerOrder) => void;
}

export const OrderDeskTab: React.FC<OrderDeskTabProps> = ({
  customerOrders, exportToCSV, resetSalesForm, isSalesFormOpen, setIsSalesFormOpen,
  globalSearch, setGlobalSearch, statusFilter, setStatusFilter, editSalesOrderId,
  handleSalesSubmit, customerName, setCustomerName, salesOrderDate, setSalesOrderDate,
  customerPhone, setCustomerPhone, customerAddress, setCustomerAddress,
  products, updateSaleProduct, addSaleProduct, removeSaleProduct,
  inventory, setInvName, setInvCategory, setActiveTab, setIsInventoryFormOpen,
  shippingCharge, setShippingCharge, salesStatus, setSalesStatus,
  toggleSalesOrderStatus, handleSalesEdit, handleSalesDelete,
  handleGenerateInvoice, handleCopyShippingLabel
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4">
        <div className="flex-1">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-800 mb-2">Order Desk</h2>
          <p className="text-sm sm:text-base text-slate-600">Manage customer orders, track payments, and shipping costs.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-amber-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Rev</p>
            <p className="text-lg sm:text-xl font-black text-amber-600">
              ₹{customerOrders.filter(o => o.status === 'Pending').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
            </p>
          </div>
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-amber-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unfulfilled</p>
            <p className="text-lg sm:text-xl font-black text-amber-700">{customerOrders.filter(o => o.status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => exportToCSV(customerOrders, 'Sales_Orders_Export')}
          className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
        >
          Export CSV
        </button>
        <button
          onClick={() => { resetSalesForm(); setIsSalesFormOpen(!isSalesFormOpen); }}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
        >
          {isSalesFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isSalesFormOpen ? 'Cancel' : 'New Order'}
        </button>
      </div>

      {/* UX Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        <input
          type="text"
          placeholder="Search customers or products..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 w-full sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 w-full sm:w-auto"
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
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-sky-200 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                {editSalesOrderId ? <Edit2 className="w-5 h-5 text-sky-500" /> : <Plus className="w-5 h-5 text-sky-500" />}
                {editSalesOrderId ? 'Edit Order' : 'New Customer Order'}
              </h3>
              <form onSubmit={handleSalesSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Customer Name *</label>
                    <input type="text" required placeholder="e.g. John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Order Date *</label>
                    <input type="date" required value={salesOrderDate} onChange={e => setSalesOrderDate(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Phone No.</label>
                    <input type="tel" placeholder="e.g. +91 9876543210" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Address</label>
                    <textarea placeholder="e.g. 123 Main St..." value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" rows={1}></textarea>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-amber-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 sm:mb-4 uppercase tracking-wider">Products Ordered</h4>
                  <div className="space-y-3 mb-4 sm:mb-5">
                    {products.map((p, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center bg-white/50 p-3 rounded-lg sm:p-0 sm:bg-transparent">
                        <div className="w-full sm:flex-1 relative">
                          <input 
                            type="text" 
                            list="inventory-finished-goods"
                            required 
                            placeholder="Product Name" 
                            value={p.name} 
                            onChange={e => updateSaleProduct(idx, 'name', e.target.value)} 
                            className="w-full px-4 py-2 sm:py-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" 
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
                              className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm hover:bg-amber-600"
                            >
                              + Stock
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1 flex-1 sm:flex-none">
                            <span className="text-slate-500 text-xs sm:text-sm">₹</span>
                            <input type="number" required min="0" step="0.01" placeholder="Price" value={p.price || ''} onChange={e => updateSaleProduct(idx, 'price', Number(e.target.value))} className="w-full sm:w-24 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm" />
                          </div>
                          <input type="number" required min="1" placeholder="Qty" value={p.qty || ''} onChange={e => updateSaleProduct(idx, 'qty', Number(e.target.value))} className="w-16 sm:w-20 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm" />
                          <button type="button" onClick={() => removeSaleProduct(idx)} className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors sm:hidden" disabled={products.length === 1}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeSaleProduct(idx)} className="hidden sm:block p-2.5 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" disabled={products.length === 1}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addSaleProduct} className="text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 mt-2 transition-colors bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Shipping Charge (₹)</label>
                    <input type="number" min="0" step="0.01" value={shippingCharge} onChange={e => setShippingCharge(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Status</label>
                    <select value={salesStatus} onChange={e => setSalesStatus(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-sky-50 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm">
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 flex justify-end gap-3 sm:gap-4">
                  <button type="button" onClick={() => { resetSalesForm(); setIsSalesFormOpen(false); }} className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors uppercase tracking-wider text-xs sm:text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-all flex items-center gap-2 uppercase tracking-wider text-xs sm:text-sm shadow-md border border-amber-600">
                    <Save className="w-4 h-4" />
                    {editSalesOrderId ? 'Update' : 'Save Order'}
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
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Customer</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 min-w-[150px] sm:min-w-[200px]">Products</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Ship</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Total</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                    No orders yet.
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
                    <tr key={order._id || index} className="hover:bg-amber-50/50 transition-colors group">
                      <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-slate-500 font-medium text-[10px] sm:text-xs">
                        {order.orderDate}
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">{order.customerName}</div>
                        {(order.customerPhone || order.customerAddress) && (
                          <div className="text-[10px] text-slate-500 mt-1 space-y-0.5 hidden sm:block">
                            {order.customerPhone && <div>📞 {order.customerPhone}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-[10px] sm:text-xs space-y-0.5">
                        {order.products.map((p, i) => (
                          <div key={i} className="truncate max-w-[120px] sm:max-w-none"><span className="font-semibold text-slate-600">{p.name}</span> <span className="text-slate-500">({p.qty})</span></div>
                        ))}
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-right text-slate-500">₹{order.shippingCharge?.toFixed(0) || '0'}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-bold text-amber-600 text-sm sm:text-base">₹{order.totalAmount.toFixed(0)}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                        <button
                          onClick={() => toggleSalesOrderStatus(order)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-xs font-bold transition-all ${order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {order.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          <span className="hidden sm:inline">{order.status}</span>
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button onClick={() => handleSalesEdit(order)} className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => handleSalesDelete(order._id!)} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
  );
};
