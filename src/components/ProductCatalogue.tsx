import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CatalogueItem = {
  _id: string;
  name: string;
  quantity: number;
  costPerUnit: number;
};

export default function ProductCatalogue() {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalogue')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load catalogue', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 font-sans p-4 sm:p-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-pink-100 min-h-[80vh]"
      >
        <div className="text-center mb-8 sm:mb-12">
          <img
            src="/Twisted_Bliss_Logo.jpg"
            alt="Twisted Bliss"
            className="mx-auto h-24 sm:h-32 mb-6 rounded-2xl shadow-md border border-sky-100"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-500 mb-4 tracking-tight">Twisted Bliss Catalogue</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to our public collection of handcrafted wonders! Explore our beautiful yarn creations and finished goods.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-16 h-16 rounded-full bg-pink-300/40 animate-pulse border-4 border-white/50"></div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 font-semibold text-lg">
                  No products currently available in the catalogue. Please check back later!
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={item._id}
                    className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="bg-sky-50 h-48 sm:h-56 rounded-xl mb-6 flex flex-col items-center justify-center text-sky-600 font-bold overflow-hidden border border-sky-100/50 relative">
                       {/* Placeholder for actual product images if they get added later */}
                       <div className="text-6xl mb-2">🧶</div>
                       <span className="text-sky-400 text-sm font-medium tracking-wide uppercase mt-2">Handcrafted</span>
                       
                       {item.quantity <= 0 && (
                         <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
                           Out of Stock
                         </div>
                       )}
                    </div>
                    
                    <h3 className="font-extrabold text-slate-800 text-xl md:text-2xl mb-2 leading-tight">{item.name}</h3>
                    <div className="flex-grow"></div>
                    <div className="flex items-end justify-between mt-4 pb-2 border-b border-slate-50 mb-4">
                      <p className="text-pink-500 font-black text-2xl">₹{item.costPerUnit || 0}</p>
                      <p className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {item.quantity > 0 ? `${item.quantity} Available` : 'Waitlist'}
                      </p>
                    </div>
                    
                    <button 
                      disabled={item.quantity <= 0}
                      className={`w-full py-3 sm:py-3.5 rounded-xl font-bold tracking-wide transition-all ${
                        item.quantity > 0 
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg shadow-sky-500/30' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}