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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-800 mb-2">Expense Vault</h2>
          <p className="text-sm sm:text-base text-slate-600">Track structural and miscellaneous costs.</p>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-rose-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Burn</p>
            <p className="text-lg sm:text-xl font-black text-rose-600">₹{totalExpenses.toFixed(0)}</p>
          </div>
          <div className="flex-1 sm:flex-none bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-rose-100 shadow-sm text-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cats</p>
            <p className="text-lg sm:text-xl font-black text-slate-700">{new Set(expenses.map(e => e.category)).size}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => { resetExpenseForm(); setIsExpenseFormOpen(!isExpenseFormOpen); }}
        className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
      >
        {isExpenseFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {isExpenseFormOpen ? 'Close' : 'Log Expense'}
      </button>

      <AnimatePresence>
        {isExpenseFormOpen && (
          <motion.section
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-rose-200 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-3">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                {editExpenseId ? 'Edit Ledger' : 'Log New Expense'}
              </h3>
              <form onSubmit={handleExpenseSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Date *</label>
                    <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Category *</label>
                    <select required value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm">
                      <option value="Packaging">Packaging</option>
                      <option value="Marketing/Ads">Marketing & Ads</option>
                      <option value="Web Hosting">Web Hosting & Tools</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Amount (₹) *</label>
                    <input type="number" required min="1" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2 sm:py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Description *</label>
                    <input type="text" required placeholder="Meta Ads, Boxes..." value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full px-4 py-2 sm:py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="flex justify-end pt-2 sm:pt-4 border-t border-slate-100">
                  <button type="submit" className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg sm:rounded-xl font-bold transition-all text-xs sm:text-sm">
                    {editExpenseId ? 'Update Entry' : 'Add to Ledger'}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-rose-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-rose-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Category</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 w-1/2">Desc</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Amount</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => (
                  <tr key={expense._id || index} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-slate-600 font-medium text-[10px] sm:text-xs">{expense.date}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">{expense.category}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-slate-600 truncate max-w-[120px] sm:max-w-none">{expense.description}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-bold text-rose-600 text-xs sm:text-base">₹{expense.amount.toFixed(0)}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => handleExpenseEdit(expense)} className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => handleExpenseDelete(expense._id!)} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 rounded-lg">
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
