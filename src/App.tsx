import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';

type Page = 'home' | 'checkout' | 'dashboard' | 'profile';

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
      <div className="min-h-screen bg-gray-50 dark:bg-[#363636] flex items-center justify-center transition-smooth">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#363636] transition-smooth">


      {currentPage === 'home' && (
        <ProductCatalog
          onShowAuth={handleShowAuth}
          onShowCart={() => setShowCart(true)}
          onNavigate={(page) => setCurrentPage(page as Page)}
        />
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
    </div>
  );
}

export default App;
