import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, Store } from 'lucide-react';
import { CatalogueItem } from '../../types';

interface CatalogueTabProps {
  catalogueItems: CatalogueItem[];
  isCatalogueFormOpen: boolean;
  setIsCatalogueFormOpen: (v: boolean) => void;
  editCatalogueId: string | null;
  catName: string; setCatName: (v: string) => void;
  catDesc: string; setCatDesc: (v: string) => void;
  catImage: string; setCatImage: (v: string) => void;
  catSku: string; setCatSku: (v: string) => void;
  catRetailPrice: number | ''; setCatRetailPrice: (v: number | '') => void;
  catPriceMoq10: number | ''; setCatPriceMoq10: (v: number | '') => void;
  catPriceMoq20Plus: number | ''; setCatPriceMoq20Plus: (v: number | '') => void;
  catPriceMoq50Plus: number | ''; setCatPriceMoq50Plus: (v: number | '') => void;
  handleCatalogueSubmit: (e: React.FormEvent) => void;
  handleCatalogueEdit: (item: CatalogueItem) => void;
  handleCatalogueDelete: (id: string) => void;
  resetCatalogueForm: () => void;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
}

export const CatalogueTab: React.FC<CatalogueTabProps> = ({
  catalogueItems, isCatalogueFormOpen, setIsCatalogueFormOpen, editCatalogueId,
  catName, setCatName, catDesc, setCatDesc, catImage, setCatImage, catSku, setCatSku,
  catRetailPrice, setCatRetailPrice, catPriceMoq10, setCatPriceMoq10,
  catPriceMoq20Plus, setCatPriceMoq20Plus, catPriceMoq50Plus, setCatPriceMoq50Plus,
  handleCatalogueSubmit, handleCatalogueEdit, handleCatalogueDelete, resetCatalogueForm,
  globalSearch, setGlobalSearch
}) => {
  const filtered = catalogueItems.filter(c => 
    c.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    c.sku.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-sky-500" />
            Public Catalogue
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage products visible to public wholesale customers.</p>
        </div>
        <button
          onClick={() => { resetCatalogueForm(); setIsCatalogueFormOpen(true); }}
          className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by name or SKU..."
              value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
            />
          </div>
          <span className="text-sm font-semibold text-slate-500 px-4">{filtered.length} visible</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Product</th>
                <th className="p-4 font-bold border-b border-slate-100">SKU</th>
                <th className="p-4 font-bold border-b border-slate-100">Retail Price</th>
                <th className="p-4 font-bold border-b border-slate-100">MOQ 10+</th>
                <th className="p-4 font-bold border-b border-slate-100">MOQ 20+</th>
                <th className="p-4 font-bold border-b border-slate-100">MOQ 50+</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <AnimatePresence>
                {filtered.map(item => (
                  <motion.tr
                    key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-sky-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                           <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><ImageIcon className="w-5 h-5"/></div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 w-48">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-600">{item.sku}</td>
                    <td className="p-4"><span className="font-mono font-bold text-slate-700">₹{item.retailPrice.toFixed(2)}</span></td>
                    <td className="p-4"><span className="font-mono font-semibold text-sky-600">₹{item.priceMoq10.toFixed(2)}</span></td>
                    <td className="p-4"><span className="font-mono font-semibold text-emerald-600">₹{item.priceMoq20Plus.toFixed(2)}</span></td>
                    <td className="p-4"><span className="font-mono font-semibold text-violet-600">₹{item.priceMoq50Plus.toFixed(2)}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                        <button onClick={() => handleCatalogueEdit(item)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleCatalogueDelete(item.id!)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No catalogue products found. Add some or adjust your search!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isCatalogueFormOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCatalogueFormOpen(false)}></motion.div>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <Store className="w-5 h-5 text-sky-500" />
                  {editCatalogueId ? 'Edit Product' : 'New Product'}
                </h3>
                <button onClick={() => setIsCatalogueFormOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="catalogue-form" onSubmit={handleCatalogueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product Name</label>
                    <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-semibold" placeholder="e.g. Sunflower Stick" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                    <textarea rows={3} value={catDesc} onChange={e => setCatDesc(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm resize-none" placeholder="Product details..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKU</label>
                      <input type="text" required value={catSku} onChange={e => setCatSku(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono text-sm" placeholder="TB001" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Retail Price (₹)</label>
                      <input type="number" required min="0" value={catRetailPrice} onChange={e => setCatRetailPrice(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono font-bold text-slate-700" placeholder="0" />
                    </div>
                  </div>
                  
                  <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-4">
                    <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Wholesale Tiers (₹)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">MOQ 10+</label>
                        <input type="number" min="0" value={catPriceMoq10} onChange={e => setCatPriceMoq10(e.target.value ? Number(e.target.value) : '')} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono text-sm shadow-sm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">MOQ 20+</label>
                        <input type="number" min="0" value={catPriceMoq20Plus} onChange={e => setCatPriceMoq20Plus(e.target.value ? Number(e.target.value) : '')} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm shadow-sm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">MOQ 50+</label>
                        <input type="number" min="0" value={catPriceMoq50Plus} onChange={e => setCatPriceMoq50Plus(e.target.value ? Number(e.target.value) : '')} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono text-sm shadow-sm" placeholder="0" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Image URL</label>
                    <input type="url" value={catImage} onChange={e => setCatImage(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm" placeholder="https://i.postimg.cc/..." />
                  </div>
                </form>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button type="submit" form="catalogue-form" className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-500/20">
                  {editCatalogueId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

