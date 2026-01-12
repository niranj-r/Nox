import { useEffect, useState } from 'react';
import { Package, Tag, TrendingUp, Plus, CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  order_no: string;
  bill_id: string;
  status: string;
  final_amount: number;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    phone: string;
  };
}

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'discounts' | 'analytics'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscountForm, setShowDiscountForm] = useState(false);

  const [newDiscount, setNewDiscount] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: null as number | null,
    valid_until: '',
  });

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadDiscounts();
    }
  }, [isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const loadDiscounts = async () => {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDiscounts(data);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };

    if (newStatus === 'payment_confirmed') {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (!error) {
      await loadOrders();
    }
  };

  const createDiscount = async () => {
    if (!newDiscount.code.trim()) {
      alert('Code is required');
      return;
    }

    const { error } = await supabase.from('discount_codes').insert({
      code: newDiscount.code.toUpperCase(),
      description: newDiscount.description,
      discount_type: newDiscount.discount_type,
      discount_value: newDiscount.discount_value,
      min_order_amount: newDiscount.min_order_amount,
      max_uses: newDiscount.max_uses,
      valid_until: newDiscount.valid_until || null,
      is_active: true,
    });

    if (!error) {
      await loadDiscounts();
      setShowDiscountForm(false);
      setNewDiscount({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_uses: null,
        valid_until: '',
      });
    } else {
      alert('Error creating discount code');
    }
  };

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('discount_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    await loadDiscounts();
  };

  const getPendingOrders = () => orders.filter((o) => o.status === 'pending_payment');
  const getTotalRevenue = () =>
    orders
      .filter((o) => o.status === 'payment_confirmed' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.final_amount, 0);

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary dark:text-accent mb-8">
        Admin Panel
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-primary dark:text-accent" />
            <span className="text-3xl font-bold text-primary dark:text-accent">
              {orders.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Total Orders</p>
        </div>

        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-primary dark:text-accent">
              ${getTotalRevenue().toFixed(2)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold text-primary dark:text-accent">
              {getPendingOrders().length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Pending Approval</p>
        </div>
      </div>

      <div className="bg-white dark:bg-primary-light rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200 dark:border-primary">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 border-b-2 transition-smooth ${
                activeTab === 'orders'
                  ? 'border-primary dark:border-accent text-primary dark:text-accent'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`py-4 border-b-2 transition-smooth ${
                activeTab === 'discounts'
                  ? 'border-primary dark:border-accent text-primary dark:text-accent'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Discount Codes
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  Pending Payment Approval
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
                </div>
              ) : getPendingOrders().length === 0 ? (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No pending orders
                </p>
              ) : (
                <div className="space-y-4">
                  {getPendingOrders().map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-primary rounded-lg p-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Order #{order.order_no}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bill ID: {order.bill_id}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Customer: {order.profiles.name} ({order.profiles.phone})
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Date: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-lg font-bold text-primary dark:text-accent mt-2">
                            ${order.final_amount.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'payment_confirmed')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-smooth flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm Payment</span>
                          </button>

                          <button
                            onClick={() => updateOrderStatus(order.id, 'payment_under_review')}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-smooth"
                          >
                            Mark Under Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
                  All Orders
                </h2>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-primary rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          #{order.order_no}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.profiles.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${order.final_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  Discount Codes
                </h2>
                <button
                  onClick={() => setShowDiscountForm(!showDiscountForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary dark:bg-accent text-white dark:text-primary rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Code</span>
                </button>
              </div>

              {showDiscountForm && (
                <div className="mb-6 p-6 bg-gray-50 dark:bg-primary rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    New Discount Code
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code
                      </label>
                      <input
                        type="text"
                        value={newDiscount.code}
                        onChange={(e) =>
                          setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newDiscount.description}
                        onChange={(e) =>
                          setNewDiscount({ ...newDiscount, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={newDiscount.discount_type}
                        onChange={(e) =>
                          setNewDiscount({ ...newDiscount, discount_type: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Value
                      </label>
                      <input
                        type="number"
                        value={newDiscount.discount_value}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            discount_value: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Order Amount
                      </label>
                      <input
                        type="number"
                        value={newDiscount.min_order_amount}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            min_order_amount: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Uses (optional)
                      </label>
                      <input
                        type="number"
                        value={newDiscount.max_uses || ''}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            max_uses: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valid Until (optional)
                      </label>
                      <input
                        type="date"
                        value={newDiscount.valid_until}
                        onChange={(e) =>
                          setNewDiscount({ ...newDiscount, valid_until: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary-light text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={createDiscount}
                      className="px-6 py-2 bg-primary dark:bg-accent text-white dark:text-primary rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowDiscountForm(false)}
                      className="px-6 py-2 bg-gray-200 dark:bg-primary text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-primary-dark transition-smooth"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {discounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-primary rounded-lg"
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {discount.code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {discount.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {discount.discount_type === 'percentage'
                          ? `${discount.discount_value}% off`
                          : `$${discount.discount_value} off`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Used: {discount.current_uses}
                        {discount.max_uses ? ` / ${discount.max_uses}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDiscountStatus(discount.id, discount.is_active)}
                      className={`px-4 py-2 rounded-lg transition-smooth ${
                        discount.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 dark:bg-primary-dark text-gray-700 dark:text-gray-400 hover:bg-gray-400'
                      }`}
                    >
                      {discount.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
