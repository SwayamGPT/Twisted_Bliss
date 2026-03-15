import React from 'react';
import { motion } from 'framer-motion';
import {
  Target, ShoppingBag, ArrowUpRight, Box, IndianRupee, Receipt, Package, Users, PieChart, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { StatCard, YarnBall } from '../Common';
import { Crafter, Order, CustomerOrder } from '../../types';

interface InsightsTabProps {
  netMargin: string;
  avgOrderValue: string;
  trueROI: string;
  inventoryHealth: string;
  totalRevenue: number;
  totalExpenses: number;
  totalShippingDeductions: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  adminTotalHooks: number;
  orders: Order[];
  customerOrders: CustomerOrder[];
  crafters: Crafter[];
  bestSellersData: any[];
  COLORS: string[];
  monthlyTrendData: any[];
  clvData: any[];
  avgFulfillmentTime: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  netMargin, avgOrderValue, trueROI, inventoryHealth,
  totalRevenue, totalExpenses, totalShippingDeductions,
  totalMaterialCost, totalLaborCost, adminTotalHooks,
  orders, customerOrders, crafters,
  bestSellersData, COLORS, monthlyTrendData, clvData, avgFulfillmentTime
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-800 mb-2">Command Center Insights</h2>
        <p className="text-sm sm:text-base text-slate-600 px-4">Overview of all operations, revenue, and costs across all crafters.</p>
      </div>

      {/* Command Center KPI Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500 rounded-full blur-[120px] opacity-20 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center md:text-left">
          <div className="border-b sm:border-b-0 md:border-r border-slate-700/50 pb-4 sm:pb-0 px-2 sm:px-4">
            <p className="text-slate-400 font-semibold mb-2 sm:mb-3 uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center md:justify-start gap-2">
              <Target className="w-3 h-3 text-emerald-400" /> Net Margin
            </p>
            <p className="text-2xl sm:text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-1 sm:gap-2">
              {netMargin}%
              <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">Yield</span>
            </p>
          </div>

          <div className="border-b sm:border-b-0 md:border-r border-slate-700/50 pb-4 sm:pb-0 px-2 sm:px-4">
            <p className="text-slate-400 font-semibold mb-2 sm:mb-3 uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center md:justify-start gap-2">
              <ShoppingBag className="w-3 h-3 text-sky-400" /> Avg Order
            </p>
            <p className="text-2xl sm:text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-1 sm:gap-2">
              ₹{avgOrderValue}
              <span className="text-[8px] sm:text-[10px] font-bold text-sky-400 bg-sky-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">Ticket</span>
            </p>
          </div>

          <div className="sm:border-r border-slate-700/50 pt-4 sm:pt-0 px-2 sm:px-4">
            <p className="text-slate-400 font-semibold mb-2 sm:mb-3 uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center md:justify-start gap-2">
              <ArrowUpRight className="w-3 h-3 text-indigo-400" /> True ROI
            </p>
            <p className="text-2xl sm:text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-1 sm:gap-2">
              {trueROI}%
              <span className="text-[8px] sm:text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">Growth</span>
            </p>
          </div>

          <div className="pt-4 sm:pt-0 px-2 sm:px-4">
            <p className="text-slate-400 font-semibold mb-2 sm:mb-3 uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center md:justify-start gap-2">
              <Box className="w-3 h-3 text-amber-400" /> Stock
            </p>
            <p className="text-2xl sm:text-4xl font-display font-black text-white flex items-baseline justify-center md:justify-start gap-1 sm:gap-2">
              {inventoryHealth}%
              <span className="text-[8px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">Supply</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={IndianRupee} color="text-sky-600" bgColor="bg-sky-400/20" />
        <StatCard title="Expenses" value={`₹${(totalExpenses + totalShippingDeductions).toFixed(0)}`} icon={Receipt} color="text-rose-600" bgColor="bg-rose-400/20" />
        <StatCard title="Material Cost" value={`₹${totalMaterialCost.toFixed(0)}`} icon={Package} color="text-amber-600" bgColor="bg-amber-400/20" />
        <StatCard title="Labor Cost" value={`₹${totalLaborCost.toFixed(0)}`} icon={Users} color="text-indigo-600" bgColor="bg-indigo-400/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-sky-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Hooks Out</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{adminTotalHooks}</p>
          </div>
        </div>
        <div className="bg-sky-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-pink-500/20">
            <YarnBall className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Orders</p>
            <p className="text-xl sm:text-2xl font-bold text-pink-600">{orders.length + customerOrders.length}</p>
          </div>
        </div>
        <div className="bg-sky-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-blue-500/20">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Crafters</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{crafters.length}</p>
          </div>
        </div>
      </div>

      {/* --- Advanced Analytics Visual Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-12">
        {/* Best Sellers Pie Chart */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-fuchsia-100 rounded-xl text-fuchsia-600"><PieChart size={20} /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Top Selling Products</h3>
          </div>
          <div className="h-60 sm:h-72">
            {bestSellersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={bestSellersData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bestSellersData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Sold']} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Not enough sales data yet.</div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-sky-100 rounded-xl text-sky-600"><BarChart3 size={20} /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Monthly Revenue</h3>
          </div>
          <div className="h-60 sm:h-72">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No revenue data.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
        {/* Customer Lifetime Value (CLV) VIP Leaderboard */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-xl text-amber-600"><Users size={20} /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">VIP Customers (CLV)</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {clvData.length > 0 ? clvData.map((cust, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs sm:text-sm">
                    #{idx + 1}
                  </div>
                  <span className="font-semibold text-slate-700 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{cust.name}</span>
                </div>
                <span className="font-bold text-emerald-600 text-sm sm:text-base">₹{cust.totalSpent.toFixed(0)}</span>
              </div>
            )) : <div className="text-center text-slate-400 py-4 text-sm">No completed orders yet.</div>}
          </div>
        </div>

        {/* Order Fulfillment Metrics */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-indigo-200 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-indigo-200">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">Avg. Fulfillment</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 max-w-xs">Average days from order to completion.</p>
          <div className="text-4xl sm:text-6xl font-black text-indigo-600 font-display">
            {avgFulfillmentTime} <span className="text-xl sm:text-2xl font-bold text-indigo-400">Days</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-sky-200 overflow-hidden mt-6 sm:mt-8">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-sky-200 bg-sky-50">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">Crafter Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-sky-100/50 text-slate-600 font-semibold border-b border-sky-200 uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Name</th>
                <th className="px-3 py-3 sm:py-4 text-center">Orders</th>
                <th className="px-3 py-3 sm:py-4 text-center">Hooks</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Revenue</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Profit</th>
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sky-600 truncate max-w-[100px] sm:max-w-none">{c.name}</td>
                      <td className="px-3 py-3 sm:py-4 text-center">{cOrders.length}</td>
                      <td className="px-3 py-3 sm:py-4 text-center">{c.hooks || 0}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">₹{cRev.toFixed(0)}</td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 text-right font-bold ${cProf >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₹{cProf.toFixed(0)}
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
