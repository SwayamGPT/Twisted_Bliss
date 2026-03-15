import React, { Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, X, Edit2, Trash2
} from 'lucide-react';
import { Expense } from '../../types';

interface ExpensesTabProps {
  totalExpenses: number;
  expenses: Expense[];
  resetExpenseForm: () => void;
  isExpenseFormOpen: boolean;
  setIsExpenseFormOpen: Dispatch<SetStateAction<boolean>>;
  editExpenseId: string | null;
  handleExpenseSubmit: (e: React.FormEvent) => void;
  expDate: string;
  setExpDate: Dispatch<SetStateAction<string>>;
  expCategory: string;
  setExpCategory: Dispatch<SetStateAction<string>>;
  expAmount: string | number;
  setExpAmount: Dispatch<SetStateAction<number | "">>;
  expDesc: string;
  setExpDesc: Dispatch<SetStateAction<string>>;
  handleExpenseEdit: (expense: Expense) => void;
  handleExpenseDelete: (id: string) => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  totalExpenses, expenses, resetExpenseForm, isExpenseFormOpen, setIsExpenseFormOpen,
  editExpenseId, handleExpenseSubmit, expDate, setExpDate, expCategory, setExpCategory,
  expAmount, setExpAmount, expDesc, setExpDesc, handleExpenseEdit, handleExpenseDelete
}) => {
  return (
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
  );
};
