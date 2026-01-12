import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

type Page = 'home' | 'checkout' | 'dashboard' | 'profile' | 'admin';

function App() {
  const { loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showCart, setShowCart] = useState(false);

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
      <div className="min-h-screen bg-gray-50 dark:bg-primary flex items-center justify-center transition-smooth">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary transition-smooth">
      <Header
        onShowAuth={handleShowAuth}
        onShowCart={() => setShowCart(true)}
        onNavigate={(page) => setCurrentPage(page as Page)}
      />

      {currentPage === 'home' && <ProductCatalog />}
      {currentPage === 'checkout' && (
        <Checkout
          onBack={() => setCurrentPage('home')}
          onSuccess={handleCheckoutSuccess}
        />
      )}
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'admin' && <AdminPanel />}

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
    </div>
  );
}

export default App;
