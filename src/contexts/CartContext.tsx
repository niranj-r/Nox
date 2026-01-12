import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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

  const fetchProductDetails = async (productId: string) => {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as any;
    }
    return null;
  };

  const loadUserCart = async () => {
    if (!user) return [];

    const q = query(collection(db, 'cart_items'), where('user_id', '==', user.uid));
    const querySnapshot = await getDocs(q);

    const cartItems = (await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();

      // Self-healing: Delete corrupted items where product_id is not a string
      if (typeof data.product_id !== 'string') {
        console.warn("Found corrupted cart item, deleting:", docSnap.id);
        await deleteDoc(doc(db, 'cart_items', docSnap.id));
        return null;
      }

      const product = await fetchProductDetails(data.product_id);
      return {
        id: docSnap.id,
        ...data,
        product
      } as CartItem;
    }))).filter(item => item !== null) as CartItem[];

    return cartItems;
  };

  const syncGuestCartToUser = async () => {
    if (!user) return;

    const guestCart = loadGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      const q = query(
        collection(db, 'cart_items'),
        where('user_id', '==', user.uid),
        where('product_id', '==', item.product_id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'cart_items', existingDoc.id), {
          quantity: existingDoc.data().quantity + item.quantity
        });
      } else {
        await addDoc(collection(db, 'cart_items'), {
          user_id: user.uid,
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
            const product = await fetchProductDetails(item.product_id);
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
      const q = query(
        collection(db, 'cart_items'),
        where('user_id', '==', user.uid),
        where('product_id', '==', productId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'cart_items', existingDoc.id), {
          quantity: existingDoc.data().quantity + quantity
        });
      } else {
        await addDoc(collection(db, 'cart_items'), {
          user_id: user.uid,
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

      const product = await fetchProductDetails(productId);
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
      const q = query(
        collection(db, 'cart_items'),
        where('user_id', '==', user.uid),
        where('product_id', '==', productId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await updateDoc(doc(db, 'cart_items', querySnapshot.docs[0].id), { quantity });
        const updatedCart = await loadUserCart();
        setItems(updatedCart);
      }
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
      const q = query(
        collection(db, 'cart_items'),
        where('user_id', '==', user.uid),
        where('product_id', '==', productId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await deleteDoc(doc(db, 'cart_items', querySnapshot.docs[0].id));
        const updatedCart = await loadUserCart();
        setItems(updatedCart);
      }
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
      const q = query(collection(db, 'cart_items'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'cart_items', d.id)));
      await Promise.all(deletePromises);
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
