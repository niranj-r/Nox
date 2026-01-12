import { ShoppingCart, User, Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onShowAuth: (mode: 'login' | 'register') => void;
  onShowCart: () => void;
  onNavigate: (page: string) => void;
}

export default function Header({ onShowAuth, onShowCart, onNavigate }: HeaderProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-primary border-b border-gray-200 dark:border-primary-light transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            onClick={() => onNavigate('home')}
            className="text-2xl font-serif font-bold text-primary dark:text-accent transition-smooth"
          >
            LUXE
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-smooth"
            >
              Collections
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-smooth"
              >
                Admin
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light transition-smooth"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-300" />
              )}
            </button>

            <button
              onClick={onShowCart}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light transition-smooth"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light transition-smooth"
                >
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="hidden md:inline text-sm text-gray-700 dark:text-gray-300">
                    {profile.name}
                  </span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-primary-light rounded-lg shadow-lg py-2 border border-gray-200 dark:border-primary">
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary transition-smooth"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary transition-smooth"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-primary transition-smooth"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onShowAuth('login')}
                className="px-4 py-2 bg-primary dark:bg-accent text-white dark:text-primary font-medium rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light transition-smooth"
              aria-label="Menu"
            >
              {showMenu ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
