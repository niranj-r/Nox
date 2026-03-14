import { X, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#121212] shadow-2xl z-50 flex flex-col transition-smooth">
        <div className="p-6 border-b border-gray-200 dark:border-[#4A4A4A] flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-primary dark:text-white">
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#424242] transition-smooth"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product_id}-${item.ring_size || 'no-size'}`}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg"
                >
                  <img
                    src={item.product?.primary_image}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {item.product?.name}
                      {item.ring_size && <span className="text-gray-500 text-sm ml-2">Size {item.ring_size}</span>}
                    </h3>
                    <p className="text-sm text-primary dark:text-white font-bold mb-2">
                      ₹{item.product?.price.toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 dark:border-[#4A4A4A] rounded">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.ring_size)}
                          className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth text-gray-700 dark:text-gray-300"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-gray-900 dark:text-gray-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.ring_size)}
                          className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth text-gray-700 dark:text-gray-300"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id, item.ring_size)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-smooth"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-[#4A4A4A]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-2xl font-black uppercase tracking-tighter text-primary dark:text-white">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-4 bg-primary dark:bg-white text-white dark:text-[#363636] font-bold tracking-[0.2em] uppercase text-[10px] rounded-lg hover:bg-primary-light dark:hover:bg-gray-300 transition-smooth flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Checkout via WhatsApp</span>
            </button>

            {!user && (
              <p className="text-[10px] tracking-[0.1em] uppercase text-center text-gray-500 dark:text-gray-400 mt-3 font-bold">
                Sign in to save your cart and track orders
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
