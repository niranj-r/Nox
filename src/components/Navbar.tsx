import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Sun, Moon } from 'lucide-react';

interface NavbarProps {
    onShowAuth?: (mode: 'login' | 'register') => void;
    onShowCart?: () => void;
    onNavigate?: (page: string) => void;
}

export default function Navbar({ onShowAuth, onShowCart, onNavigate }: NavbarProps) {
    const { user, profile, signOut } = useAuth();
    const { getTotalItems } = useCart();
    const { theme, toggleTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogoClick = () => {
        onNavigate?.('home');
        setTimeout(() => {
            const el = document.getElementById('about');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <nav className="w-full bg-[#F6F6F6] dark:bg-[#121212] font-sans text-[#111] dark:text-white transition-colors duration-500 pt-8 pb-4 relative z-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
                <div>
                    <h2
                        onClick={handleLogoClick}
                        className="cursor-pointer text-4xl md:text-5xl font-black uppercase tracking-tighter mb-0 md:mb-4"
                    >
                        NOX
                    </h2>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 mt-0 md:mt-2 w-full md:w-auto">
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-[10px] font-bold tracking-[0.15em] uppercase text-black/60 dark:text-white/60 w-full">
                        <span onClick={() => onNavigate?.('home')} className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">Collections</span>

                        <button onClick={toggleTheme} className="hover:text-black dark:hover:text-white transition-colors">
                            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        <div
                            onClick={() => onShowCart?.()}
                            className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                            <span>Cart</span>
                            <span>{getTotalItems().toString().padStart(2, '0')}</span>
                        </div>
                        {user && profile ? (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">{profile.name}</span>
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/10 shadow-lg py-4 flex flex-col items-start px-4 gap-4 z-50">
                                        <button onClick={() => { onNavigate?.('dashboard'); setShowMenu(false); }} className="w-full text-left hover:text-black dark:hover:text-white transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">My Orders</button>
                                        <button onClick={() => { onNavigate?.('profile'); setShowMenu(false); }} className="w-full text-left hover:text-black dark:hover:text-white transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">Profile</button>
                                        <button onClick={async () => { await signOut(); setShowMenu(false); }} className="w-full text-left text-red-500 hover:text-red-700 transition-colors uppercase tracking-[0.15em] text-[10px] font-bold">Sign Out</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => onShowAuth?.('login')} className="hover:text-black dark:hover:text-white transition-colors">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
