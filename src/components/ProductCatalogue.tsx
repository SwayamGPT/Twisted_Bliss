import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Phone, Mail, Package, Tag, Layers } from 'lucide-react';

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

// --- Mock Data ---
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Sunflower Stick',
        description: 'Beautiful crochet sunflower stick with vibrant yellow petals. Ships in 5-7 business days.',
        image: 'https://i.postimg.cc/59mBgC3c/Gemini-Generated-Image-3lfycw3lfycw3lfy.png',
        sku: 'TB001',
        retailPrice: 219,
        priceMoq10: 185,
        priceMoq20Plus: 165,
        priceMoq50Plus: 145
    },
    {
        id: '2',
        name: 'Rose Stick',
        description: 'Elegant crochet rose stick available in classic red. Ships in 5-7 business days.',
        image: 'https://i.postimg.cc/KvJ2rJwc/Gemini-Generated-Image-aec491aec491aec4.png',
        sku: 'TB002',
        retailPrice: 199,
        priceMoq10: 170,
        priceMoq20Plus: 150,
        priceMoq50Plus: 130
    },
    {
        id: '3',
        name: 'Tulip Stick',
        description: 'High-quality crochet tulip stick with a real-touch feel. Ships in 7-10 business days.',
        image: 'https://i.postimg.cc/nzzVBNVq/Gemini-Generated-Image-pf52ytpf52ytpf52.png',
        sku: 'TB003',
        retailPrice: 130,
        priceMoq10: 110,
        priceMoq20Plus: 100,
        priceMoq50Plus: 90
    },
    {
        id: '4',
        name: 'Realistic Sunflower Stick',
        description: 'Premium realistic sunflower stick with detailed center and textured leaves. Ships in 7-10 business days.',
        image: 'https://i.postimg.cc/5yrmfcjd/Gemini-Generated-Image-7oozv97oozv97ooz.png',
        sku: 'TB004',
        retailPrice: 549,
        priceMoq10: 480,
        priceMoq20Plus: 430,
        priceMoq50Plus: 380
    },
    {
        id: '5',
        name: 'Petal Rose Stick',
        description: 'Detailed petal rose stick with gradient coloring for a natural look. Ships in 7-10 business days.',
        image: 'https://i.postimg.cc/bvdkNVcd/Gemini-Generated-Image-24s7qc24s7qc24s7.png',
        sku: 'TB005',
        retailPrice: 279,
        priceMoq10: 250,
        priceMoq20Plus: 230,
        priceMoq50Plus: 210.00
    },
    {
        id: '6',
        name: 'Sunflower Pot',
        description: 'A cheerful desk buddy to brighten the room. Ships in 10-14 business days.',
        image: 'https://i.postimg.cc/28CcGmRg/Gemini-Generated-Image-m0fgp4m0fgp4m0fg.png',
        sku: 'TB006',
        retailPrice: 350,
        priceMoq10: 300,
        priceMoq20Plus: 260,
        priceMoq50Plus: 230
    }
];

// --- Components ---

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="aspect-square overflow-hidden bg-stone-100 relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
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
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-black/5">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-stone-400" />
                            <span className="text-xs font-medium text-stone-600">MOQ 10+</span>
                        </div>
                        <span className="font-mono font-semibold text-stone-900">
                            ₹{product.priceMoq10.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700">MOQ 20+</span>
                        </div>
                        <span className="font-mono font-semibold text-emerald-700">
                            ₹{product.priceMoq20Plus.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-100">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-violet-500" />
                            <span className="text-xs font-medium text-violet-700">MOQ 50+</span>
                        </div>
                        <span className="font-mono font-semibold text-violet-700">
                            ₹{product.priceMoq50Plus.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch dynamic products added through the inventory (Finished Goods)
        fetch('/api/public/catalogue')
            .then(res => res.json())
            .then(data => {
                const mappedProducts: Product[] = data.map((item: any) => ({
                    id: item._id,
                    name: item.name,
                    description: `Category: ${item.category} | Stock: ${item.quantity} ${item.unit}`,
                    // Provide a charming subtle generic image for newly added un-imaged inventory items
                    image: 'https://i.postimg.cc/85zKbs3F/Gemini-Generated-Image-4b0p9x4b0p9x4b0p.png',
                    sku: `DYN-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                    retailPrice: item.costPerUnit || 0,
                    priceMoq10: Math.round((item.costPerUnit || 0) * 0.9),
                    priceMoq20Plus: Math.round((item.costPerUnit || 0) * 0.85),
                    priceMoq50Plus: Math.round((item.costPerUnit || 0) * 0.8)
                }));
                setDynamicProducts(mappedProducts);
            })
            .catch(err => console.error("Failed to load dynamic catalogue", err));
    }, []);

    const ALL_PRODUCTS = [...MOCK_PRODUCTS, ...dynamicProducts];

    const filteredProducts = ALL_PRODUCTS.filter(product => {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            {/* Header */}
            <header className="bg-white border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Wholesale Catalogue</h1>
                                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Twisted Bliss</p>
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
                        <ProductCard key={product.id} product={product} />
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
        </div>
    );
}