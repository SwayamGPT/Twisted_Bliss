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
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                          <button onClick={() => handleGenerateInvoice(order)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Invoice">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCopyShippingLabel(order)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Shipping Label">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSalesEdit(order)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSalesDelete(order._id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
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
  );
};
