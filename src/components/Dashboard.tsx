import { useEffect, useState } from 'react';
import { MessageCircle, Download, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  order_no: string;
  bill_id: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  shipping_address: any;
  phone: string;
  created_at: string;
  payment_confirmed_at: string | null;
  order_items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_snapshot: any;
    product: {
      name: string;
      primary_image: string;
    };
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orders'),
        where('user_id', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at,
          payment_confirmed_at: data.payment_confirmed_at ? data.payment_confirmed_at : null
        } as Order;
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'payment_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'packing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Awaiting Payment';
      case 'payment_under_review':
        return 'Payment Under Review';
      case 'payment_confirmed':
        return 'Payment Confirmed';
      case 'packing':
        return 'Packing';
      case 'shipped':
        return 'Dispatched';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 25;
      case 'payment_under_review':
        return 50;
      case 'payment_confirmed':
        return 40;
      case 'packing':
        return 60;
      case 'shipped':
        return 80;
      case 'out_for_delivery':
        return 90;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  const downloadProformaInvoice = (order: Order) => {
    const invoiceContent = `
PROFORMA INVOICE

Order No: ${order.order_no}
Bill ID: ${order.bill_id}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: PENDING PAYMENT

Items:
${order.order_items.map((item) => `${item.product.name} x${item.quantity} - $${item.total_price.toFixed(2)}`).join('\n')}

Subtotal: $${order.total_amount.toFixed(2)}
Discount: -$${order.discount_amount.toFixed(2)}
Total Amount: $${order.final_amount.toFixed(2)}

This is a proforma invoice. Payment is pending confirmation.
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proforma_Invoice_${order.order_no}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFinalInvoice = (order: Order) => {
    const invoiceContent = `
TAX INVOICE

Order No: ${order.order_no}
Bill ID: ${order.bill_id}
Date: ${new Date(order.created_at).toLocaleDateString()}
Payment Confirmed: ${order.payment_confirmed_at ? new Date(order.payment_confirmed_at).toLocaleDateString() : 'N/A'}

Items:
${order.order_items.map((item) => `${item.product.name} x${item.quantity} - $${item.total_price.toFixed(2)}`).join('\n')}

Subtotal: $${order.total_amount.toFixed(2)}
Discount: -$${order.discount_amount.toFixed(2)}
Total Amount Paid: $${order.final_amount.toFixed(2)}

Thank you for your purchase!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Invoice_${order.order_no}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const contactSupport = (orderNo: string) => {
    const message = encodeURIComponent(
      `Hi, I need help with Order #${orderNo}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary dark:text-accent mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-primary-light rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order #{order.order_no}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {order.status === 'pending_payment' && (
                      <button
                        onClick={() => downloadProformaInvoice(order)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-primary text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-primary-dark transition-smooth"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Proforma</span>
                      </button>
                    )}

                    {(order.status === 'payment_confirmed' ||
                      order.status === 'shipped' ||
                      order.status === 'delivered') && (
                        <button
                          onClick={() => downloadFinalInvoice(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary dark:bg-accent text-white dark:text-primary rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Invoice</span>
                        </button>
                      )}

                    <button
                      onClick={() => contactSupport(order.order_no)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-primary text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-primary transition-smooth"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Help</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {getProgressPercentage(order.status)}%
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-primary">
                      <div
                        style={{ width: `${getProgressPercentage(order.status)}%` }}
                        className="transition-smooth shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary dark:bg-accent"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-primary pt-4">
                  <div className="space-y-3 mb-4">
                    {order.order_items && order.order_items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <img
                          src={item.product?.primary_image || item.product_snapshot?.image}
                          alt={item.product?.name || item.product_snapshot?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.product?.name || item.product_snapshot?.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-primary">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-xl font-bold text-primary dark:text-accent">
                      ${order.final_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
