import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, ArrowRight, ShoppingCart, X, Plus, Minus, ChevronDown, Search, User, Home, LayoutGrid } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const API_BASE_URL = '';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500&family=Great+Vibes&display=swap');

:root {
  --font-serif: "Cormorant Garamond", serif;
  --font-sans: "Montserrat", sans-serif;
  --font-calligraphy: "Great Vibes", cursive;
  --color-floral-bg: #fdf2f8;
  --color-floral-dark: #1e3a8a;
  --color-floral-accent: #60a5fa;
}

html {
  scroll-behavior: smooth;
  font-family: var(--font-sans);
}

.font-serif {
  font-family: var(--font-serif);
}

.font-sans {
  font-family: var(--font-sans);
}

.font-calligraphy {
  font-family: var(--font-calligraphy);
}

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
`;

type ProductItem = {
    name: string;
    singlePrice: number;
    bouquetPrice: number;
    note?: string;
    description?: string;
    image?: string;
};

type Collection = {
    id: string;
    title: string;
    description: string;
    image: string;
    items: ProductItem[];
};

type CartItem = {
    id: string;
    name: string;
    singlePrice: number;
    bouquetPrice: number;
    quantity: number;
    collectionTitle: string;
};

type ProductWithMeta = ProductItem & {
    image: string;
    collectionId: string;
    collectionTitle: string;
};

type AdminOrderItem = {
    id: string;
    name: string;
    singlePrice: string;
    bouquetPrice: string;
    quantity: string;
    collectionTitle: string;
};

type ProductCardProps = {
    product: ProductWithMeta & { sale?: string };
    addToCart: (item: ProductWithMeta, collectionTitle: string) => void;
    categoryName: string;
    id: string;
};

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const normalizeImageUrl = (image: string | undefined, fallbackImage?: string) => {
    if (!image || image.trim() === '') {
        return fallbackImage ?? '';
    }

    const trimmedImage = image.trim();

    if (/^https?:\/\//i.test(trimmedImage)) {
        return trimmedImage;
    }

    if (trimmedImage.startsWith('//')) {
        return `https:${trimmedImage}`;
    }

    if (trimmedImage.startsWith('/')) {
        return `${API_BASE_URL}${trimmedImage}`;
    }

    return fallbackImage ?? '';
};

const sanitizeCollections = (input: unknown): Collection[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map<Collection | null>((rawCollection) => {
            if (!rawCollection || typeof rawCollection !== 'object') {
                return null;
            }

            const collection = rawCollection as Partial<Collection>;
            const fallbackImage = isNonEmptyString(collection.id)
                ? fallbackImageByCollectionId.get(collection.id)
                : undefined;

            const items = Array.isArray(collection.items)
                ? collection.items
                    .map<ProductItem | null>((rawItem) => {
                        if (!rawItem || typeof rawItem !== 'object') {
                            return null;
                        }

                        const item = rawItem as Partial<ProductItem>;
                        const singlePrice = Number(item.singlePrice);
                        const bouquetPrice = Number(item.bouquetPrice);

                        if (!isNonEmptyString(item.name)) {
                            return null;
                        }

                        if (!Number.isFinite(singlePrice) || singlePrice <= 0) {
                            return null;
                        }

                        if (!Number.isFinite(bouquetPrice) || bouquetPrice <= 0) {
                            return null;
                        }

                        return {
                            name: item.name.trim(),
                            singlePrice,
                            bouquetPrice,
                            note: isNonEmptyString(item.note) ? item.note.trim() : undefined,
                            description: isNonEmptyString(item.description) ? item.description.trim() : undefined,
                            image: isNonEmptyString(item.image) ? item.image.trim() : undefined,
                        };
                    })
                    .filter((item): item is ProductItem => item !== null)
                : [];

            if (!isNonEmptyString(collection.id) || !isNonEmptyString(collection.title) || items.length === 0) {
                return null;
            }

            const image = normalizeImageUrl(collection.image, fallbackImage);
            if (!isNonEmptyString(image)) {
                return null;
            }

            return {
                id: collection.id.trim(),
                title: collection.title.trim(),
                description: isNonEmptyString(collection.description) ? collection.description.trim() : '',
                image,
                items,
            };
        })
        .filter((collection): collection is Collection => collection !== null);
};

const fallbackCollections: Collection[] = [];

const getProductId = (name: string) => `product-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const fallbackImageByCollectionId = new Map<string, string>();

const createEmptyAdminItem = (index: number): AdminOrderItem => ({
    id: `admin-item-${Date.now()}-${index}`,
    name: "",
    singlePrice: "",
    bouquetPrice: "",
    quantity: "1",
    collectionTitle: "",
});

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    addToCart,
    categoryName,
    id,
}) => {
    const fallbackImage = fallbackImageByCollectionId.get(product.collectionId);
    const [imageSrc, setImageSrc] = useState(normalizeImageUrl(product.image, fallbackImage));

    useEffect(() => {
        setImageSrc(normalizeImageUrl(product.image, fallbackImage));
    }, [fallbackImage, product.image]);

    return (
        <div className="flex flex-col group scroll-mt-32" id={id}>
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border border-black/5">
                {product.sale && (
                    <div className="absolute top-0 left-0 z-10 bg-[#FF4D4D] text-white text-[11px] font-bold px-3 py-1.5">
                        Sale {product.sale}
                    </div>
                )}
                <button className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--color-floral-dark)] shadow-md hover:text-red-500 transition-colors">
                    <Heart size={20} />
                </button>
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                        if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                            setImageSrc(fallbackImage);
                        }
                    }}
                />
            </div>

            {/* Add to Cart Button - Always Visible below image */}
            <button
                onClick={() => addToCart(product, categoryName)}
                className="w-full bg-white text-black font-bold py-4 text-sm uppercase tracking-[0.1em] border border-black mt-[-1px] hover:bg-black hover:text-white transition-all duration-300"
            >
                ADD TO CART
            </button>

            <div className="text-center pt-5">
                <h3 className="text-base font-normal mb-1 text-[var(--color-floral-dark)] tracking-tight">{product.name}</h3>
                {product.description && (
                    <p className="text-[10px] text-gray-500 mb-2 px-2 line-clamp-2 leading-tight">{product.description}</p>
                )}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-4">
                          <span className="text-sm font-bold text-[var(--color-floral-dark)]">Rs. {product.singlePrice}.00</span>
                      </div>
                    {product.note && (
                        <p className="text-[10px] italic opacity-60 mt-1">{product.note}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [collections, setCollections] = useState<Collection[]>(fallbackCollections);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [authName, setAuthName] = useState('');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authUser, setAuthUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [adminCustomerEmail, setAdminCustomerEmail] = useState("");
    const [adminOrderItems, setAdminOrderItems] = useState<AdminOrderItem[]>([
        createEmptyAdminItem(0),
    ]);
    const [isSubmittingAdminOrder, setIsSubmittingAdminOrder] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('twisted_bliss_token');
        const name = localStorage.getItem('twisted_bliss_name');
        const email = localStorage.getItem('twisted_bliss_email');
        const role = localStorage.getItem('twisted_bliss_role');
        if (token && name && email && role) {
            setAuthUser({ name, email, role });
        }
    }, []);

    useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/catalogue`);
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          const items: ProductItem[] = data.map((item: any) => ({
            name: item.name,
            singlePrice: item.retailPrice,
            bouquetPrice: item.retailPrice,
            description: item.description,
            image: item.image,
          }));

          const flowers = items.filter(i => !i.name.toLowerCase().includes("keychain"));
          const keychains = items.filter(i => i.name.toLowerCase().includes("keychain"));

          const newCollections: Collection[] = [];
          if (flowers.length > 0) {
            newCollections.push({
              id: "forever-flowers",
              title: "Forever Flowers",
              description: "Beautiful handcrafted crochet flowers.",
              image: flowers[0].image || "",
              items: flowers
            });
          }
          if (keychains.length > 0) {
            newCollections.push({
              id: "keychains",
              title: "Keychains",
              description: "Charming crochet keychains.",
              image: keychains[0].image || "",
              items: keychains
            });
          }
          setCollections(newCollections);
        }
      } catch (error) {
        console.error("Failed to load catalogue:", error);
      }
    };
    fetchCatalogue();
    }, []);

    const allProducts: ProductWithMeta[] = collections.flatMap((c) =>
        c.items.map((i) => ({ ...i, collectionId: c.id, collectionTitle: c.title, image: normalizeImageUrl(i.image || c.image, fallbackImageByCollectionId.get(c.id)) }))
    );
    const searchResults = searchQuery.trim() === '' ? [] : allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const addToCart = (item: ProductWithMeta, collectionTitle: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, id: getProductId(item.name), quantity: 1, collectionTitle }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (name: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.name === name) {
                return { ...i, quantity: Math.max(0, i.quantity + delta) };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const cartTotal = cart.reduce((sum, item) => {
        const price = item.quantity > 1 ? item.bouquetPrice : item.singlePrice;
        return sum + (price * item.quantity);
    }, 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const adminOrderTotal = adminOrderItems.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const singlePrice = Number(item.singlePrice);
        const bouquetPrice = Number(item.bouquetPrice);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            return sum;
        }
        const price = quantity > 1 ? bouquetPrice : singlePrice;
        if (!Number.isFinite(price) || price <= 0) {
            return sum;
        }
        return sum + price * quantity;
    }, 0);

    const handleAuthSubmit = async () => {
        try {
            setIsSubmittingAuth(true);
            const endpoint = isLoginMode ? '/api/buyer/auth/login' : '/api/buyer/auth/register';
            const payload = isLoginMode
                ? { email: authEmail, password: authPassword }
                : { name: authName, email: authEmail, password: authPassword };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.detail || 'Authentication failed');
            }

            localStorage.setItem('twisted_bliss_token', data.access_token);
            localStorage.setItem('twisted_bliss_name', data.name);
            localStorage.setItem('twisted_bliss_email', data.email);
            localStorage.setItem('twisted_bliss_role', data.role);
            setAuthUser({ name: data.name, email: data.email, role: data.role });
            setIsAccountOpen(false);
            if (data.role === "admin") {
                setIsAdminPanelOpen(true);
            }
            setAuthName('');
            setAuthEmail('');
            setAuthPassword('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Authentication failed';
            toast.error(message);
        } finally {
            setIsSubmittingAuth(false);
        }
    };

    const handleCheckout = async () => {
        try {
            if (cart.length === 0) {
                toast.error('Your cart is empty.');
                return;
            }

            setIsPaying(true);
            const response = await fetch(`${API_BASE_URL}/api/buyer/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: cartTotal,
                    customerEmail: authUser?.email ?? null,
                }),
            });
            const orderData = await response.json();
            if (!response.ok) {
                throw new Error(orderData.error || orderData.detail || 'Failed to create payment order');
            }

            const paymentOptions = {
                key: orderData.razorpay_key_id,
                amount: orderData.amount,
                currency: 'INR',
                name: 'Twisted Bliss',
                description: `Order ${orderData.order_id}`,
                order_id: orderData.razorpay_order_id,
                handler: async (paymentResponse: any) => {
                    try {
                        const verifyResponse = await fetch(`${API_BASE_URL}/api/buyer/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: orderData.order_id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }),
                        });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.error || verifyData.detail || 'Payment verification failed');
                        }
                        toast.success(`Payment successful. Order ID: ${orderData.order_id}`);
                        setCart([]);
                        setIsCartOpen(false);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'Verification failed';
                        toast.error(message);
                    }
                },
            };

            if (!(window as any).Razorpay) {
                throw new Error('Razorpay SDK not loaded. Add checkout.js script to index.html');
            }
            const razorpayInstance = new (window as any).Razorpay(paymentOptions);
            razorpayInstance.open();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment failed';
            toast.error(message);
        } finally {
            setIsPaying(false);
        }
    };

    const updateAdminItem = (index: number, field: keyof AdminOrderItem, value: string) => {
        setAdminOrderItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    const addAdminItem = () => {
        setAdminOrderItems((prev) => [...prev, createEmptyAdminItem(prev.length)]);
    };

    const removeAdminItem = (index: number) => {
        setAdminOrderItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAdminCreateOrder = async () => {
        if (!authUser || authUser.role !== "admin") {
            toast.error("Admin access required.");
            return;
        }

        const token = localStorage.getItem("twisted_bliss_token");
        if (!token) {
            toast.error("Please sign in again.");
            return;
        }

        const sanitizedItems = adminOrderItems
            .map((item) => {
                const name = item.name.trim();
                const collectionTitle = item.collectionTitle.trim();
                const quantity = Number(item.quantity);
                const singlePrice = Number(item.singlePrice);
                const bouquetPrice = Number(item.bouquetPrice);

                if (!name || !collectionTitle) {
                    return null;
                }
                if (!Number.isFinite(quantity) || quantity <= 0) {
                    return null;
                }
                if (!Number.isFinite(singlePrice) || singlePrice <= 0) {
                    return null;
                }
                if (!Number.isFinite(bouquetPrice) || bouquetPrice <= 0) {
                    return null;
                }

                return {
                    id: item.id,
                    name,
                    singlePrice,
                    bouquetPrice,
                    quantity,
                    collectionTitle,
                };
            })
            .filter((item): item is CartItem => item !== null);

        if (sanitizedItems.length === 0) {
            toast.error("Please add at least one valid item.");
            return;
        }

        if (adminOrderTotal <= 0) {
            toast.error("Total amount must be greater than zero.");
            return;
        }

        try {
            setIsSubmittingAdminOrder(true);
            const response = await fetch(`${API_BASE_URL}/api/buyer/admin/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: sanitizedItems,
                    totalAmount: adminOrderTotal,
                    customerEmail: adminCustomerEmail.trim() || null,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to create order");
            }

            toast.success(`Order created successfully. Order ID: ${data.order_id}`);
            setAdminCustomerEmail("");
            setAdminOrderItems([createEmptyAdminItem(0)]);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create order";
            toast.error(message);
        } finally {
            setIsSubmittingAdminOrder(false);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            <div className="min-h-screen bg-[var(--color-floral-bg)] text-[var(--color-floral-dark)] font-sans selection:bg-[var(--color-floral-accent)] selection:text-white">
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

                {/* Navigation */}
                <nav className="fixed w-full z-50 bg-[var(--color-floral-bg)]/90 backdrop-blur-md border-b border-[var(--color-floral-dark)]/5">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex-1 hidden md:flex gap-6 relative group">
                            <button className="text-xs tracking-[0.2em] uppercase hover:text-[var(--color-floral-accent)] transition-colors font-medium flex items-center gap-1 cursor-pointer">
                                Categories <ChevronDown size={14} />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-[var(--color-floral-dark)]/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden">
                                <a href="#collections" className="px-5 py-4 text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-floral-accent)]/10 hover:text-[var(--color-floral-accent)] transition-colors font-medium border-b border-[var(--color-floral-dark)]/5">Forever Flowers</a>
                                <a href="#keychains" className="px-5 py-4 text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-floral-accent)]/10 hover:text-[var(--color-floral-accent)] transition-colors font-medium">Keychains</a>
                            </div>
                        </div>
                        <div className="flex-1 text-left md:text-center">
                            <a href="#" className="font-calligraphy text-4xl md:text-5xl font-bold tracking-wide">Twisted Bliss</a>
                        </div>
                        <div className="flex-1 flex justify-end items-center gap-6">
                            <a
                                href="https://www.instagram.com/_twisted__blissss__/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase hover:text-[var(--color-floral-accent)] transition-colors font-medium"
                            >
                                <Instagram size={16} />
                                <span className="hidden sm:inline">Instagram</span>
                            </a>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex items-center gap-2 text-xs tracking-[0.2em] uppercase hover:text-[var(--color-floral-accent)] transition-colors font-medium cursor-pointer"
                            >
                                <ShoppingCart size={16} />
                                <span className="hidden sm:inline">Cart</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[var(--color-floral-accent)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://i.postimg.cc/6qmPTm6C/The-prettiest-order-by-mousumi-s-crochet-smallbusiness-crochetclawclip-crochethai-heic.jpg"
                            alt="Beautiful floral arrangement"
                            className="w-full h-full object-cover opacity-90"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-blue-300/30 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative z-10 text-center px-6 mt-20 w-full max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="bg-white/10 backdrop-blur-md p-10 md:p-16 rounded-3xl border border-white/20 shadow-2xl"
                        >
                            <p className="text-white/90 text-sm md:text-base tracking-[0.3em] uppercase font-medium mb-6 drop-shadow-md">
                                Get your Perfect Twist, from twisted bliss
                            </p>
                            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 drop-shadow-lg leading-tight">
                                Everlasting <br /><span className="italic text-[var(--color-floral-accent)]">Elegance</span>
                            </h1>
                            <a
                                href="#collections"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--color-floral-dark)] rounded-full hover:bg-[var(--color-floral-accent)] hover:text-white transition-all duration-300 uppercase tracking-widest text-xs font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Shop Collection <ArrowRight size={16} />
                            </a>
                        </motion.div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section id="collections" className="pt-12 pb-20 px-6 max-w-7xl mx-auto bg-white/50 rounded-t-[3rem] border-t border-[var(--color-floral-dark)]/5">
                    {/* Introductory Text */}
                    <div className="max-w-5xl mx-auto text-center mb-24 px-6 pt-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="font-serif text-4xl md:text-6xl text-[#2D3E6E] mb-8 leading-tight">
                                Welcome to Twisted Bliss, <br />
                                <span className="italic text-[var(--color-floral-accent)]">where every stitch tells a story.</span>
                            </h2>
                            <div className="w-16 h-[2px] bg-[var(--color-floral-accent)] mx-auto mb-12"></div>
                            <p className="text-[#2D3E6E]/80 text-xl md:text-3xl font-medium leading-relaxed max-w-4xl mx-auto">
                                We specialize in handcrafted crochet floral arrangements that bring joy and beauty to any occasion. Explore our categories below to find the perfect expression of your feelings.
                            </p>
                        </motion.div>
                    </div>

                    {/* Category Dropdown */}
                    <div className="max-w-xs mx-auto mb-16 relative z-[60]">
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-white border border-[var(--color-floral-dark)]/10 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                        >
                            <span className="font-serif text-lg text-[var(--color-floral-dark)]">Select Category</span>
                            <ChevronDown className={`transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        <AnimatePresence>
                            {isCategoryDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-[var(--color-floral-dark)]/5 overflow-hidden py-2"
                                >
                                    {collections.map((collection) => (
                                        <button
                                            key={collection.id}
                                            onClick={() => {
                                                scrollToSection(collection.id);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-6 py-3 hover:bg-[var(--color-floral-accent)]/10 hover:text-[var(--color-floral-accent)] transition-colors font-medium text-[var(--color-floral-dark)]"
                                        >
                                            {collection.title}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Forever Flowers Section */}
                    <motion.div
                        id="forever-flowers"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="text-center mb-16 pt-10"
                    >
                        <h2 className="font-serif text-4xl md:text-5xl mb-6">Forever Flowers</h2>
                        <div className="w-12 h-[2px] bg-[var(--color-floral-accent)] mx-auto"></div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                        {collections.filter(c => !c.id.includes('keychain')).map((collection) => (
                            <React.Fragment key={collection.id}>
                                {collection.items.map((item, i) => (
                                    <ProductCard
                                        key={`${collection.id}-${i}`}
                                        id={i === 0 ? collection.id : getProductId(item.name)}
                                        product={{ ...item, image: item.image || collection.image, collectionId: collection.id, collectionTitle: collection.title }}
                                        addToCart={addToCart}
                                        categoryName={collection.title}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                {/* Keychains Grid */}
                <section id="keychains" className="pt-12 pb-20 px-6 max-w-7xl mx-auto bg-white/50 border-t border-[var(--color-floral-dark)]/5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="text-center mb-16 pt-10"
                    >
                        <h2 className="font-serif text-4xl md:text-5xl mb-6">Keychains</h2>
                        <div className="w-12 h-[2px] bg-[var(--color-floral-accent)] mx-auto"></div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                        {collections.filter(c => c.id.includes('keychain')).map((collection) => (
                            <React.Fragment key={collection.id}>
                                {collection.items.map((item, i) => (
                                    <ProductCard
                                        key={`${collection.id}-${i}`}
                                        id={i === 0 ? collection.id : getProductId(item.name)}
                                        product={{ ...item, image: item.image || collection.image, collectionId: collection.id, collectionTitle: collection.title }}
                                        addToCart={addToCart}
                                        categoryName={collection.title}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                {/* Important Notes */}
                <section className="py-24 bg-[var(--color-floral-accent)]/20 text-[var(--color-floral-dark)]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="max-w-5xl mx-auto px-6"
                    >
                        <div className="text-center mb-16">
                            <Heart className="mx-auto mb-6 text-[var(--color-floral-accent)]" size={32} strokeWidth={1.5} />
                            <h2 className="font-serif text-4xl mb-6">Important Notes</h2>
                            <div className="w-12 h-[2px] bg-[var(--color-floral-accent)] mx-auto"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white/40 p-10 rounded-3xl border border-[var(--color-floral-dark)]/5 hover:bg-white/60 transition-colors duration-300">
                                <h3 className="font-serif text-2xl mb-4 text-[var(--color-floral-dark)]">Bouquet Pricing</h3>
                                <p className="font-medium leading-relaxed opacity-90 text-sm md:text-base">
                                    For all custom bouquets (except Forget-Me-Nots), the "Bouquet" price listed is the discounted rate per flower when you order multiple flowers bundled together.
                                </p>
                            </div>

                            <div className="bg-white/40 p-10 rounded-3xl border border-[var(--color-floral-dark)]/5 hover:bg-white/60 transition-colors duration-300">
                                <h3 className="font-serif text-2xl mb-4 text-[var(--color-floral-dark)]">Customization</h3>
                                <p className="font-medium leading-relaxed opacity-90 text-sm md:text-base">
                                    Want a mix of different flowers? We'd love to create a custom arrangement just for you! DM us on Instagram with your ideas and we'll bring them to life.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="py-16 px-6 bg-[var(--color-floral-bg)] text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <h2 className="font-serif text-4xl mb-8">Twisted Bliss</h2>
                        <div className="flex justify-center gap-6 mb-10">
                            <a
                                href="https://www.instagram.com/_twisted__blissss__/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 rounded-full border border-[var(--color-floral-dark)]/20 flex items-center justify-center hover:bg-[var(--color-floral-dark)] hover:text-[var(--color-floral-bg)] transition-all duration-300 hover:scale-110"
                            >
                                <Instagram size={24} strokeWidth={1.5} />
                            </a>
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] opacity-40 font-medium">
                            &copy; {new Date().getFullYear()} Twisted Bliss. All rights reserved.
                        </p>
                    </motion.div>
                </footer>

                {/* Cart Sidebar */}
                <AnimatePresence>
                    {isCartOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                                onClick={() => setIsCartOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-floral-bg)] shadow-2xl z-[70] flex flex-col border-l border-[var(--color-floral-dark)]/10"
                            >
                                <div className="p-6 border-b border-[var(--color-floral-dark)]/10 flex justify-between items-center bg-white/50">
                                    <h2 className="font-serif text-2xl">Your Cart</h2>
                                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {cart.length === 0 ? (
                                        <div className="text-center opacity-50 font-light mt-10 flex flex-col items-center">
                                            <ShoppingCart size={48} className="mb-4 opacity-50" />
                                            <p>Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        cart.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[var(--color-floral-dark)]/5">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs opacity-60">
                                                        ₹{item.quantity > 1 ? item.bouquetPrice : item.singlePrice} {item.quantity > 1 ? '(Bouquet Price)' : '(Single Price)'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 bg-[var(--color-floral-bg)] rounded-full px-2 py-1 border border-[var(--color-floral-dark)]/10">
                                                    <button onClick={() => updateQuantity(item.name, -1)} className="p-1 hover:text-[var(--color-floral-accent)] cursor-pointer"><Minus size={14} /></button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.name, 1)} className="p-1 hover:text-[var(--color-floral-accent)] cursor-pointer"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {cart.length > 0 && (
                                    <div className="p-6 bg-white border-t border-[var(--color-floral-dark)]/10">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="font-serif text-xl">Total</span>
                                            <span className="font-serif text-2xl text-[var(--color-floral-accent)]">₹{cartTotal}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={isPaying}
                                            className="w-full py-4 bg-[var(--color-floral-dark)] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[var(--color-floral-accent)] transition-colors uppercase tracking-widest text-xs font-bold shadow-lg disabled:opacity-60"
                                        >
                                            {isPaying ? 'Processing...' : 'Pay with Razorpay'} <ArrowRight size={16} />
                                        </button>
                                        <p className="text-[10px] text-center mt-3 opacity-50 uppercase tracking-widest">
                                            Secure checkout enabled for your cart.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="max-w-7xl mx-auto flex justify-around items-center h-20 px-4">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex flex-col items-center gap-1.5 text-[#2D3E6E] hover:scale-110 transition-transform cursor-pointer"
                        >
                            <Home size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-wider">Home</span>
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex flex-col items-center gap-1.5 text-[#8E97B0] hover:text-[#2D3E6E] hover:scale-110 transition-transform cursor-pointer"
                        >
                            <Search size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-wider">Search</span>
                        </button>
                        <button
                            onClick={() => scrollToSection('collections')}
                            className="flex flex-col items-center gap-1.5 text-[#8E97B0] hover:text-[#2D3E6E] hover:scale-110 transition-transform cursor-pointer"
                        >
                            <LayoutGrid size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-wider">Categories</span>
                        </button>
                        <button
                            onClick={() => setIsAccountOpen(true)}
                            className="flex flex-col items-center gap-1.5 text-[#8E97B0] hover:text-[#2D3E6E] hover:scale-110 transition-transform cursor-pointer"
                        >
                            <User size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-wider">Account</span>
                        </button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="flex flex-col items-center gap-1.5 text-[#8E97B0] hover:text-[#2D3E6E] hover:scale-110 transition-transform cursor-pointer relative"
                        >
                            <ShoppingCart size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-wider">Cart</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#2D3E6E] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Modal */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[80]"
                                onClick={() => setIsSearchOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '-100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-100%' }}
                                className="fixed top-0 left-0 w-full bg-white z-[90] p-8 shadow-2xl"
                            >
                                <div className="max-w-3xl mx-auto flex items-center gap-4">
                                    <Search className="text-gray-400" size={24} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search for flowers, keychains..."
                                        className="flex-1 text-xl outline-none font-serif"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={24} />
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="max-w-3xl mx-auto mt-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Search Results ({searchResults.length})</p>
                                        <div className="grid gap-2">
                                            {searchResults.map((product, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        scrollToSection(getProductId(product.name));
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-2xl text-left group"
                                                >
                                                    <div className="w-20 h-20 overflow-hidden rounded-xl bg-gray-100">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(event) => {
                                                                const fallbackImage = fallbackImageByCollectionId.get(product.collectionId);
                                                                if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                                                                    event.currentTarget.src = fallbackImage;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-serif text-lg text-gray-900">{product.name}</h4>
                                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{product.collectionTitle}</p>
                                                        <p className="text-[var(--color-floral-accent)] font-bold mt-1">₹{product.singlePrice}</p>
                                                    </div>
                                                    <ArrowRight size={20} className="text-gray-300 group-hover:text-[var(--color-floral-accent)] transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchQuery.trim() !== '' && searchResults.length === 0 && (
                                    <div className="max-w-3xl mx-auto mt-20 text-center py-12">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="font-serif text-2xl mb-2">No results found</h3>
                                        <p className="text-gray-500">We couldn't find anything matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Account Modal */}
                <AnimatePresence>
                    {isAccountOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[80]"
                                onClick={() => setIsAccountOpen(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[90] p-10 rounded-[2rem] shadow-2xl"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#2D3E6E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <User size={40} className="text-[#2D3E6E]" />
                                    </div>
                                    <h2 className="font-serif text-3xl mb-4">{authUser ? `Hi, ${authUser.name}` : isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
                                    {authUser ? (
                                        <div className="space-y-4">
                                            <p className="text-gray-500">{authUser.email} ({authUser.role})</p>
                                            {authUser.role === "admin" && (
                                                <button
                                                    onClick={() => {
                                                        setIsAccountOpen(false);
                                                        setIsAdminPanelOpen(true);
                                                    }}
                                                    className="w-full py-4 bg-white text-[#2D3E6E] rounded-xl font-bold uppercase tracking-widest border border-[#2D3E6E]/20 hover:bg-[#2D3E6E]/10 transition-all shadow-sm"
                                                >
                                                    Open Admin Panel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('twisted_bliss_token');
                                                    localStorage.removeItem('twisted_bliss_name');
                                                    localStorage.removeItem('twisted_bliss_email');
                                                    localStorage.removeItem('twisted_bliss_role');
                                                    setAuthUser(null);
                                                    setIsAdminPanelOpen(false);
                                                    setIsAccountOpen(false);
                                                }}
                                                className="w-full py-4 bg-[#2D3E6E] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#1A264D] transition-all shadow-lg"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-500 mb-8">{isLoginMode ? 'Sign in to track your orders and manage your account.' : 'Register to save your profile and checkout faster.'}</p>
                                            <div className="space-y-4">
                                                {!isLoginMode && (
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={authName}
                                                        onChange={(e) => setAuthName(e.target.value)}
                                                        className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#2D3E6E] transition-all"
                                                    />
                                                )}
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={authEmail}
                                                    onChange={(e) => setAuthEmail(e.target.value)}
                                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#2D3E6E] transition-all"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={authPassword}
                                                    onChange={(e) => setAuthPassword(e.target.value)}
                                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#2D3E6E] transition-all"
                                                />
                                                <button
                                                    onClick={handleAuthSubmit}
                                                    disabled={isSubmittingAuth}
                                                    className="w-full py-4 bg-[#2D3E6E] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#1A264D] transition-all shadow-lg disabled:opacity-60"
                                                >
                                                    {isSubmittingAuth ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Register'}
                                                </button>
                                                <button
                                                    onClick={() => setIsLoginMode(!isLoginMode)}
                                                    className="w-full text-sm text-[#2D3E6E] hover:underline"
                                                >
                                                    {isLoginMode ? 'New user? Create account' : 'Already have an account? Sign in'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    <button onClick={() => setIsAccountOpen(false)} className="mt-6 text-sm text-gray-400 hover:text-gray-600">Close</button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Admin Panel */}
                <AnimatePresence>
                    {isAdminPanelOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-md z-[90]"
                                onClick={() => setIsAdminPanelOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="fixed inset-0 bg-white z-[100] overflow-y-auto"
                            >
                                <div className="max-w-4xl mx-auto px-6 py-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="font-serif text-3xl text-[#2D3E6E]">Admin Order Upload</h2>
                                            <p className="text-sm text-gray-500 mt-1">Create a new order manually.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsAdminPanelOpen(false)}
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="bg-[#F9FAFB] rounded-3xl p-8 shadow-sm border border-[#E5E7EB]">
                                        <div className="mb-6">
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Customer Email (Optional)</label>
                                            <input
                                                type="email"
                                                value={adminCustomerEmail}
                                                onChange={(e) => setAdminCustomerEmail(e.target.value)}
                                                placeholder="customer@example.com"
                                                className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[#2D3E6E] transition-all"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            {adminOrderItems.map((item, index) => (
                                                <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-sm font-semibold text-[#2D3E6E] uppercase tracking-widest">Item {index + 1}</h3>
                                                        {adminOrderItems.length > 1 && (
                                                            <button
                                                                onClick={() => removeAdminItem(index)}
                                                                className="text-xs text-red-500 uppercase tracking-widest hover:opacity-80"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateAdminItem(index, "name", e.target.value)}
                                                            placeholder="Product name"
                                                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-[#2D3E6E] outline-none transition-all"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.collectionTitle}
                                                            onChange={(e) => updateAdminItem(index, "collectionTitle", e.target.value)}
                                                            placeholder="Collection title"
                                                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-[#2D3E6E] outline-none transition-all"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateAdminItem(index, "quantity", e.target.value)}
                                                            placeholder="Quantity"
                                                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-[#2D3E6E] outline-none transition-all"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.singlePrice}
                                                            onChange={(e) => updateAdminItem(index, "singlePrice", e.target.value)}
                                                            placeholder="Single price"
                                                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-[#2D3E6E] outline-none transition-all"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.bouquetPrice}
                                                            onChange={(e) => updateAdminItem(index, "bouquetPrice", e.target.value)}
                                                            placeholder="Bouquet price"
                                                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-[#2D3E6E] outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <button
                                                onClick={addAdminItem}
                                                className="px-6 py-3 rounded-full border border-[#2D3E6E]/30 text-[#2D3E6E] uppercase tracking-widest text-xs font-bold hover:bg-[#2D3E6E]/10 transition-all"
                                            >
                                                Add Item
                                            </button>
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-widest text-gray-400">Total Amount</p>
                                                <p className="text-2xl font-serif text-[#2D3E6E]">Rs. {adminOrderTotal}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAdminCreateOrder}
                                            disabled={isSubmittingAdminOrder}
                                            className="mt-8 w-full py-4 bg-[#2D3E6E] text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-[#1A264D] transition-all disabled:opacity-60"
                                        >
                                            {isSubmittingAdminOrder ? "Submitting..." : "Create Order"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="h-20"></div> {/* Spacer for bottom nav */}
            </div>
        </>
    );
}





