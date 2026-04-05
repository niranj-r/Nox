import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import AuthModal from './components/AuthModal';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import Navbar from './components/Navbar';


type Page = 'home' | 'checkout' | 'dashboard' | 'profile';

function App() {
  const { loading } = useAuth();
  const { items } = useCart();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setShowCart(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const handleShowAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setCurrentPage('checkout');
  };

  const handleCheckoutSuccess = () => {
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center transition-smooth">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] dark:bg-[#121212] transition-smooth flex flex-col">
      <Helmet>
        <title>
          {currentPage === 'home' ? 'NOX | Premium Digital Assets & Security' :
           currentPage === 'checkout' ? 'Checkout | NOX' :
           currentPage === 'dashboard' ? 'Your Dashboard | NOX' :
           'Your Profile | NOX'}
        </title>
        <meta name="description" content={
          currentPage === 'home' ? 'NOX is the premier destination for high-end digital assets, security solutions, and exclusive technology.' :
          currentPage === 'checkout' ? 'Securely complete your purchase of premium digital assets on NOX.' :
          currentPage === 'dashboard' ? 'Manage your acquired assets and security settings in your NOX dashboard.' :
          'Manage your personal information and security preferences on NOX.'
        } />
      </Helmet>
      <Navbar

        onShowAuth={handleShowAuth}
        onShowCart={() => setShowCart(true)}
        onNavigate={(page) => setCurrentPage(page as Page)}
      />
      <main className="flex-grow">


        {currentPage === 'home' && (
          <ProductCatalog />
        )}
        {currentPage === 'checkout' && (
          <Checkout
            onBack={() => setCurrentPage('home')}
            onSuccess={handleCheckoutSuccess}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard onNavigate={(page) => setCurrentPage(page as Page)} />}
        {currentPage === 'profile' && <UserProfile />}

        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onSwitchMode={setAuthMode}
          />
        )}

        <CartSidebar
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />

        <Footer onNavigate={(page) => setCurrentPage(page as Page)} />

        {/* Global Persistent View Cart Banner */}
        <AnimatePresence>
          {items.length > 0 && currentPage !== 'checkout' && !showCart && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 p-4 md:px-6 md:py-4 bg-[#111] dark:bg-white text-white dark:text-[#111] shadow-2xl rounded-xl border border-white/10 dark:border-black/10 max-w-sm w-[calc(100%-3rem)] md:w-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] leading-tight">Items in Vault</p>
                  <p className="text-[10px] text-white/60 dark:text-black/60 hidden sm:block">You have pending items.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="bg-white dark:bg-[#111] text-[#111] dark:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                View Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;
