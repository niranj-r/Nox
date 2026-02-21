import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    material: string;
    color: string;
    collection: string;
    primary_image: string;
    stock_quantity: number;
}

interface AlternateHeroProps {
    products: Product[];
    onProductClick: (index: number) => void;
    onShowAuth?: (mode: 'login' | 'register') => void;
    onShowCart?: () => void;
    onNavigate?: (page: string) => void;
}

export default function AlternateHero({ products, onProductClick, onShowAuth, onShowCart, onNavigate }: AlternateHeroProps) {
    const { user, profile, signOut } = useAuth();
    const { getTotalItems } = useCart();
    const { theme, toggleTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);

    if (!products || products.length === 0) {
        return (
            <div className="h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-primary transition-colors duration-500">
                <div className="animate-pulse text-gray-500 dark:text-accent/60 tracking-[0.2em] uppercase text-xs font-bold">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <section className="w-full bg-[#F6F6F6] dark:bg-primary overflow-hidden font-sans text-[#111] dark:text-white transition-colors duration-500 select-none pb-12 pt-8">

            {/* Header Layout Similar to BECANE Reference */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-start mb-16">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        NOX
                    </h2>
                    <div className="flex gap-4 text-[10px] font-bold tracking-[0.15em] text-black/40 dark:text-accent/40 uppercase">
                        <span className="text-black dark:text-accent">ALL <span className="opacity-40">{products.length.toString().padStart(2, '0')}</span></span>
                        <span>STORIES <span className="opacity-40">04</span></span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 mt-2 relative z-50">
                    {/* Header Controls */}
                    <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.15em] uppercase text-black/60 dark:text-accent/60">
                        <span onClick={() => onNavigate?.('home')} className="cursor-pointer hover:text-black dark:hover:text-accent transition-colors">Collections</span>


                        <button onClick={toggleTheme} className="hover:text-black dark:hover:text-accent transition-colors">
                            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        {user && profile ? (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 hover:text-black dark:hover:text-accent transition-colors">
                                    <User className="w-4 h-4" />
                                    <span>{profile.name}</span>
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-primary-light border border-black/5 dark:border-accent/10 shadow-lg py-4 flex flex-col items-start px-4 gap-4 z-50">
                                        <button onClick={() => { onNavigate?.('dashboard'); setShowMenu(false); }} className="w-full text-left hover:text-black dark:hover:text-accent transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">My Orders</button>
                                        <button onClick={() => { onNavigate?.('profile'); setShowMenu(false); }} className="w-full text-left hover:text-black dark:hover:text-accent transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">Profile</button>
                                        <button onClick={async () => { await signOut(); setShowMenu(false); }} className="w-full text-left text-red-500 hover:text-red-700 transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">Sign Out</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => onShowAuth?.('login')} className="hover:text-black dark:hover:text-accent transition-colors">
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Collection and Cart Context */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 bg-white dark:bg-primary-dark px-4 py-2 border border-black/5 dark:border-accent/10 shadow-sm text-[10px] font-bold tracking-[0.15em] uppercase text-black/60 dark:text-accent/60">
                            <span>Collection</span>
                            <span>01 / 01</span>
                        </div>
                        <div
                            onClick={() => onShowCart?.()}
                            className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-black/60 dark:text-accent/60 cursor-pointer hover:text-black dark:hover:text-accent transition-colors">
                            <span>Cart</span>
                            <span>{getTotalItems().toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collection Title section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20 flex justify-between items-end">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-black/40 dark:text-accent/40 uppercase">
                        COLLECTION 01 / 01
                    </span>
                    <h1 style={{ fontFamily: 'Inter, sans-serif' }} className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none">
                        COLLECTION
                    </h1>
                </div>

                <div className="hidden md:flex gap-12 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                    <span className="text-black/40 dark:text-accent/40">PRODUCTS</span>
                    <span>{products.length}</span>
                </div>
            </div>


            {/* Continuously Scrolling Marquee of Rings */}
            <div className="relative w-full overflow-hidden bg-transparent mb-16 h-[320px]">
                {/* 
                    Using framer-motion approach for a seamless marquee loop. 
                    We duplicate the products array to ensure no gaps as it scrolls.
                */}
                <motion.div
                    className="flex items-center gap-16 md:gap-24 absolute top-0 left-0"
                    animate={{
                        x: ['0%', '-50%'], // Move from 0 to -50% (since we duplicated items, 50% is the end of the first set)
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: products.length * 3, // Speed based on item count
                            ease: "linear",
                        },
                    }}
                    style={{ width: "max-content", height: "100%" }}
                >
                    {[...products, ...products].map((p, idx) => (
                        <div
                            key={`${p.id}-${idx}`}
                            onClick={() => onProductClick(idx % products.length)} // modulo to get original index
                            className="relative flex-shrink-0 flex flex-col items-center justify-center cursor-pointer group"
                            style={{ width: '180px', height: '240px' }}
                        >
                            <img
                                src={p.primary_image}
                                alt={p.name}
                                draggable={false}
                                className="w-full h-[180px] object-contain drop-shadow-xl dark:drop-shadow-[0_20px_20px_rgba(255,237,168,0.05)] transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4"
                            />
                            <div className="mt-6 text-center">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-white transition-colors duration-300">
                                    {p.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Footer Discover section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center text-[10px] font-bold tracking-[0.15em] uppercase text-black/40 dark:text-accent/40 bg-white/50 dark:bg-primary-dark/80 p-4 border border-black/5 dark:border-accent/10">
                <span>{products.length} Products</span>
                <span className="cursor-pointer hover:text-black dark:hover:text-accent transition-colors">DISCOVER</span>
            </div>

        </section>
    );
}
