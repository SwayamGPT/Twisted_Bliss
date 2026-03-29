import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Phone, Mail, Package, Tag, Layers, ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';

// --- Types ---
export interface CartItem {
    product: Product;
    quantity: number;
}

// --- Types ---
export interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    sku: string;
    retailPrice: number;
    priceMoq10: number;
    priceMoq20Plus: number;
    priceMoq50Plus: number;
}

// Mock data removed; completely integrated into MongoDB `catalogue` collection.

// --- Components ---

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const [imgLoaded, setImgLoaded] = useState(false);

    let currentPrice = product.retailPrice;
    if (qty >= 50 && product.priceMoq50Plus) currentPrice = product.priceMoq50Plus;
    else if (qty >= 20 && product.priceMoq20Plus) currentPrice = product.priceMoq20Plus;
    else if (qty >= 10 && product.priceMoq10) currentPrice = product.priceMoq10;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/5 flex flex-col shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="aspect-square overflow-hidden bg-stone-100 relative group">
                {!imgLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10">
                        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-emerald-400 animate-spin mb-3"></div>
                        <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase animate-pulse">Loading Image</span>
                    </div>
                )}
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-105'}`}
                    referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 z-20">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-mono font-medium tracking-wider uppercase text-stone-500 border border-black/5">
                        {product.sku}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="mb-4">
                    <h3 className="font-sans font-semibold text-stone-900 text-lg leading-tight mb-1">
                        {product.name}
                    </h3>
                    <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-3">
                        {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Retail</span>
                        <span className="text-sm font-mono text-stone-500 line-through decoration-stone-300">
                            ₹{product.retailPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    {product.priceMoq10 > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-black/5">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-stone-400" />
                            <span className="text-xs font-medium text-stone-600">MOQ 10+</span>
                        </div>
                        <span className="font-mono font-semibold text-stone-900">
                            ₹{product.priceMoq10.toFixed(2)}
                        </span>
                    </div>
                )}

                    {product.priceMoq20Plus > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700">MOQ 20+</span>
                        </div>
                        <span className="font-mono font-semibold text-emerald-700">
                            ₹{product.priceMoq20Plus.toFixed(2)}
                        </span>
                    </div>
                )}

                    {product.priceMoq50Plus > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-100">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-violet-500" />
                            <span className="text-xs font-medium text-violet-700">MOQ 50+</span>
                        </div>
                        <span className="font-mono font-semibold text-violet-700">
                            ₹{product.priceMoq50Plus.toFixed(2)}
                        </span>
                    </div>
                )}
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-stone-600">Quantity</span>
                        <div className="flex items-center gap-3 bg-stone-100 rounded-lg p-1">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 rounded-md hover:bg-white hover:shadow-sm text-stone-600 transition-all"><Minus className="w-4 h-4" /></button>
                            <span className="font-mono font-bold w-10 text-center text-sm">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="p-1 rounded-md hover:bg-white hover:shadow-sm text-stone-600 transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-stone-600">Unit Price</span>
                        <span className="font-mono font-bold text-lg text-emerald-600">₹{currentPrice.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => { onAddToCart(product, qty); setQty(1); }}
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-auto"
                    >
                        <ShoppingCart className="w-4 h-4" /> Add Cart - ₹{(currentPrice * qty).toFixed(2)}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        // Fetch products straight from the Catalogue API
        fetch('/api/public/catalogue')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error("Received data is not an array");
                }
                const mappedProducts: Product[] = data.map((item: any) => ({
                    ...item,
                    id: item._id, // Map MongoDB _id onto id
                }));
                setProducts(mappedProducts);
            })
            .catch(err => {
                console.error("Failed to load catalogue from DB:", err);
                // Optionally set an error state here to show to the user
            });
    }, []);

    const filteredProducts = products.filter(product => {
                const hasMoq = (product.priceMoq10 && product.priceMoq10 > 0) || 
                       (product.priceMoq20Plus && product.priceMoq20Plus > 0) || 
                       (product.priceMoq50Plus && product.priceMoq50Plus > 0);
        if (!hasMoq) return false;
        return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleAddToCart = (product: Product, quantity: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { product, quantity }];
        });
    };

    const updateCartQty = (id: string, newQty: number) => {
        if (newQty < 1) {
            setCart(prev => prev.filter(item => item.product.id !== id));
            return;
        }
        setCart(prev => prev.map(item => item.product.id === id ? { ...item, quantity: newQty } : item));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            let price = item.product.retailPrice;
            if (item.quantity >= 50 && item.product.priceMoq50Plus) price = item.product.priceMoq50Plus;
            else if (item.quantity >= 20 && item.product.priceMoq20Plus) price = item.product.priceMoq20Plus;
            else if (item.quantity >= 10 && item.product.priceMoq10) price = item.product.priceMoq10;
            return total + (price * item.quantity);
        }, 0);
    };

    const handleWhatsAppCheckout = () => {
        if (cart.length === 0) return;
        let message = "Hi Twisted Bliss,\nbelow are my requirements:-\n\n";
        cart.forEach(item => {
            let price = item.product.retailPrice;
            if (item.quantity >= 50 && item.product.priceMoq50Plus) price = item.product.priceMoq50Plus;
            else if (item.quantity >= 20 && item.product.priceMoq20Plus) price = item.product.priceMoq20Plus;
            else if (item.quantity >= 10 && item.product.priceMoq10) price = item.product.priceMoq10;

            const itemTotal = price * item.quantity;
            message += `- ${item.product.name} (SKU: ${item.product.sku}) x ${item.quantity} = ₹${itemTotal.toFixed(2)}\n`;
        });
        message += `\n*Total Order Value: ₹${getCartTotal().toFixed(2)}*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/918812881912?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            {/* Header */}
            <header className="bg-white border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/Twisted_Bliss_Logo.jpg" alt="Twisted Bliss Logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-sm object-cover border border-black/5" />
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Wholesale Catalogue</h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-stone-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>+91-8812881912 , +91-6002484122</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>support@twistedbliss.in</span>
                            </div>
                            <button onClick={() => setIsCartOpen(true)} className="ml-2 sm:ml-4 relative p-2 sm:p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors active:scale-95 shadow-sm">
                                <ShoppingCart className="w-5 h-5 text-stone-800" />
                                <AnimatePresence>
                                    {cart.length > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm"
                                        >
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by product or SKU..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-stone-400 font-medium">No products found matching your criteria.</p>
                    </div>
                )}

                {/* Wholesale Info Footer */}
                <footer className="mt-24 pt-12 border-t border-black/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-widest text-xs text-stone-400">Ordering Terms</h4>
                            <ul className="space-y-2 text-stone-600 leading-relaxed">
                                <li>• Minimum Order Quantity (MOQ) as listed per item.</li>
                                <li>• Lead time: 1-3 weeks from order confirmation.</li>
                                <li>• Shipping calculated at checkout.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-widest text-xs text-stone-400">Payment Methods</h4>
                            <p className="text-stone-600 leading-relaxed">
                                A 50% advance payment is required for order confirmation.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-widest text-xs text-stone-400">Customization</h4>
                            <p className="text-stone-600 leading-relaxed">
                                Any color can be customized as per demand, but please note that custom orders may require additional production time.
                            </p>
                        </div>
                    </div>
                    <div className="mt-12 text-center text-stone-400 text-xs pb-8">
                        © 2024 Twisted Bliss. All rights reserved. Wholesale Confidential.
                    </div>
                </footer>
            </main>

            {/* Cart Sidebar Modal */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                        >
                            <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between bg-stone-50">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-stone-900"><ShoppingCart className="w-5 h-5" /> Your Cart</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><X className="w-5 h-5 text-stone-500" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-6">
                                {cart.length === 0 ? (
                                    <div className="text-center text-stone-400 mt-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingBag className="w-8 h-8 opacity-40" />
                                        </div>
                                        <p className="font-medium text-lg text-stone-500">Your cart is empty.</p>
                                        <p className="text-sm mt-2">Add items to proceed with the order.</p>
                                    </div>
                                ) : (
                                    cart.map(item => {
                                        let unitPrice = item.product.retailPrice;
                                        if (item.quantity >= 50 && item.product.priceMoq50Plus) unitPrice = item.product.priceMoq50Plus;
                                        else if (item.quantity >= 20 && item.product.priceMoq20Plus) unitPrice = item.product.priceMoq20Plus;
                                        else if (item.quantity >= 10 && item.product.priceMoq10) unitPrice = item.product.priceMoq10;

                                        return (
                                            <motion.div layout key={item.product.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
                                                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover border border-black/5" />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm leading-tight text-stone-800 line-clamp-1">{item.product.name}</h4>
                                                    <div className="text-xs font-semibold text-stone-400 mb-2 font-mono">₹{unitPrice.toFixed(2)}/unit</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center bg-stone-50 border border-black/10 rounded-lg p-0.5">
                                                            <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-white rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
                                                            <span className="text-xs font-mono font-bold w-6 text-center text-stone-700">{item.quantity}</span>
                                                            <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-white rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                        <span className="font-mono font-black text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">₹{(unitPrice * item.quantity).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => updateCartQty(item.product.id, 0)} className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </motion.div>
                                        )
                                    })
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-5 sm:p-6 bg-white border-t border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                                    <div className="flex justify-between items-end mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-stone-500 font-medium text-sm">Total Estimate</span>
                                            <span className="text-[10px] text-stone-400">Excludes shipping & taxes</span>
                                        </div>
                                        <span className="text-3xl font-black text-stone-900 font-mono tracking-tight">₹{getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleWhatsAppCheckout} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 transition-all text-lg tracking-wide">
                                        <Phone className="w-5 h-5 fill-current" /> Order via WhatsApp
                                    </button>
                                    <p className="text-center text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-4 leading-relaxed">
                                        Generates a WhatsApp message<br />to complete your order seamlessly.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

