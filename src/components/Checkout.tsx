import { useState } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { user, profile } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<{
    id: string;
    code: string;
    amount: number;
    type: string;
  } | null>(null);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      const q = query(
        collection(db, 'discount_codes'),
        where('code', '==', discountCode.toUpperCase()),
        where('is_active', '==', true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Invalid discount code');
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      const now = new Date();
      if (data.valid_until && new Date(data.valid_until) < now) {
        alert('Discount code has expired');
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        alert('Discount code has reached maximum uses');
        return;
      }

      const total = getTotalPrice();
      if (total < data.min_order_amount) {
        alert(`Minimum order amount is $${data.min_order_amount}`);
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (total * data.discount_value) / 100;
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount({
        id: docSnap.id,
        code: data.code,
        amount: discountAmount,
        type: data.discount_type,
      });
    } catch (error) {
      console.error("Error applying discount:", error);
      alert('Error applying discount');
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  };

  const generateBillId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `BILL-${timestamp}-${random}`.toUpperCase();
  };

  const handleCheckout = async () => {
    if (!user || !profile) {
      alert('Please sign in to complete checkout');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderNo = generateOrderNumber();
      const billId = generateBillId();
      const totalAmount = getTotalPrice();
      const discountAmount = discount?.amount || 0;
      const finalAmount = totalAmount - discountAmount;

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity,
        product: { // Store product details directly for history
          name: item.product?.name,
          primary_image: item.product?.primary_image,
        },
        product_snapshot: { // Backup for compatibility
          name: item.product?.name,
          image: item.product?.primary_image,
        },
      }));

      const orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user.uid,
        order_no: orderNo,
        bill_id: billId,
        status: 'pending_payment',
        total_amount: totalAmount,
        discount_code: discount?.code || null,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        shipping_address: profile.shipping_address,
        phone: profile.phone,
        created_at: new Date(),
        order_items: orderItems // Storing items array in order doc
      });

      if (discount?.id) {
        try {
          await updateDoc(doc(db, 'discount_codes', discount.id), {
            current_uses: (await getDoc(doc(db, 'discount_codes', discount.id))).data()?.current_uses + 1 || 1
          });
        } catch (e) {
          console.error("Failed to increment discount usage", e);
        }
      }

      await clearCart();

      const whatsappMessage = encodeURIComponent(
        `Hi, I'd like to pay for Order #${orderNo}. Bill ID: ${billId}\n\nTotal Amount: $${finalAmount.toFixed(2)}`
      );
      const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');

      onSuccess(orderRef.id);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = getTotalPrice();
  const discountAmount = discount?.amount || 0;
  const finalAmount = totalAmount - discountAmount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-smooth mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-4xl font-serif font-bold text-primary dark:text-accent mb-8">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white dark:bg-primary-light rounded-lg p-6 mb-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>

            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4">
                  <img
                    src={item.product?.primary_image}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × ${item.product?.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-primary pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              {discount && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({discount.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold text-primary dark:text-accent pt-2 border-t border-gray-200 dark:border-primary">
                <span>Total</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              Discount Code
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-primary rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary text-gray-900 dark:text-gray-100 transition-smooth"
              />
              <button
                onClick={handleApplyDiscount}
                className="px-6 py-2 bg-gray-200 dark:bg-primary text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-primary-dark transition-smooth"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-primary-light rounded-lg p-6 mb-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
              Shipping Information
            </h2>

            {profile ? (
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-gray-100">{profile.name}</p>
                <p>{profile.phone}</p>
                <p>{profile.shipping_address.street}</p>
                <p>
                  {profile.shipping_address.city}, {profile.shipping_address.state}{' '}
                  {profile.shipping_address.zip}
                </p>
                <p>{profile.shipping_address.country}</p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Please sign in to continue</p>
            )}
          </div>

          <div className="bg-accent/10 dark:bg-accent/5 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Payment Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Click the button below to open WhatsApp</li>
              <li>Send the pre-filled message with your order details</li>
              <li>Share your payment screenshot via WhatsApp</li>
              <li>Wait for admin confirmation</li>
              <li>Download your invoice once payment is confirmed</li>
            </ol>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !user}
            className="w-full py-4 bg-primary dark:bg-accent text-white dark:text-primary font-medium rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span>Pay via WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
