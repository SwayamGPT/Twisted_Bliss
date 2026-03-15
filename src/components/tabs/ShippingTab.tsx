import React, { Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Package, Wallet, Plus, X, Trash2
} from 'lucide-react';
import { StatCard } from '../Common';
import { WalletTransaction } from '../../types';

interface ShippingTabProps {
  walletTotalAdded: number;
  walletTotalDeducted: number;
  walletBalance: number;
  isWalletFormOpen: boolean;
  setIsWalletFormOpen: Dispatch<SetStateAction<boolean>>;
  handleWalletSubmit: (e: React.FormEvent) => void;
  walletDate: string;
  setWalletDate: Dispatch<SetStateAction<string>>;
  aggregator: string;
  setAggregator: Dispatch<SetStateAction<string>>;
  walletAmount: string | number;
  setWalletAmount: Dispatch<SetStateAction<number | "">>;
  referenceId: string;
  setReferenceId: Dispatch<SetStateAction<string>>;
  walletTxns: WalletTransaction[];
  handleWalletDelete: (id: string) => void;
}

export const ShippingTab: React.FC<ShippingTabProps> = ({
  walletTotalAdded, walletTotalDeducted, walletBalance,
  isWalletFormOpen, setIsWalletFormOpen, handleWalletSubmit,
  walletDate, setWalletDate, aggregator, setAggregator,
  walletAmount, setWalletAmount, referenceId, setReferenceId,
  walletTxns, handleWalletDelete
}) => {
  return (
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

      <div className="bg-white rounded-3xl shadow-xl border border-indigo-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">Date</th>
                <th className="px-4 py-4">Service</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Reference</th>
                <th className="px-4 py-4 text-right">Amount</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {walletTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                    No wallet activity yet. Add funds to start tracking shipping costs.
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
  );
};
