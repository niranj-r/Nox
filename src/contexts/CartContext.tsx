import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id?: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    primary_image: string;
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuestCart = () => {
    const saved = localStorage.getItem('guestCart');
    return saved ? JSON.parse(saved) : [];
  };

  const saveGuestCart = (cart: CartItem[]) => {
    localStorage.setItem('guestCart', JSON.stringify(cart));
  };

  const loadUserCart = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id,
          name,
          price,
          primary_image,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart:', error);
      return [];
    }

    return data || [];
  };

  const syncGuestCartToUser = async () => {
    if (!user) return;

    const guestCart = loadGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', item.product_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
          });
      }
    }

    localStorage.removeItem('guestCart');
  };

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        await syncGuestCartToUser();
        const userCart = await loadUserCart();
        setItems(userCart);
      } else {
        const guestCart = loadGuestCart();
        const cartWithProducts = await Promise.all(
          guestCart.map(async (item: CartItem) => {
            const { data: product } = await supabase
              .from('products')
              .select('id, name, price, primary_image, stock_quantity')
              .eq('id', item.product_id)
              .maybeSingle();

            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        setItems(cartWithProducts);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (user) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
      }

      const updatedCart = await loadUserCart();
      setItems(updatedCart);
    } else {
      const guestCart = loadGuestCart();
      const existingIndex = guestCart.findIndex(
        (item: CartItem) => item.product_id === productId
      );

      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += quantity;
      } else {
        guestCart.push({ product_id: productId, quantity });
      }

      saveGuestCart(guestCart);

      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, primary_image, stock_quantity')
        .eq('id', productId)
        .maybeSingle();

      const updatedItems = [...items];
      const itemIndex = updatedItems.findIndex((i) => i.product_id === productId);

      if (itemIndex >= 0) {
        updatedItems[itemIndex].quantity += quantity;
      } else {
        updatedItems.push({
          product_id: productId,
          quantity,
          product: product || undefined,
        });
      }

      setItems(updatedItems);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      const updatedCart = await loadUserCart();
      setItems(updatedCart);
    } else {
      const guestCart = loadGuestCart();
      const itemIndex = guestCart.findIndex(
        (item: CartItem) => item.product_id === productId
      );

      if (itemIndex >= 0) {
        guestCart[itemIndex].quantity = quantity;
        saveGuestCart(guestCart);
        setItems(
          items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          )
        );
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      const updatedCart = await loadUserCart();
      setItems(updatedCart);
    } else {
      const guestCart = loadGuestCart();
      const filtered = guestCart.filter(
        (item: CartItem) => item.product_id !== productId
      );
      saveGuestCart(filtered);
      setItems(items.filter((item) => item.product_id !== productId));
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      localStorage.removeItem('guestCart');
    }
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
