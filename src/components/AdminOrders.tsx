import { useEffect, useState, Fragment } from 'react';
import { ArrowLeft, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, query, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Order {
    id: string;
    order_no: string;
    bill_id: string;
    status: string;
    final_amount: number;
    created_at: string;
    user_id: string;
    order_items: {
        product: {
            name: string;
            primary_image: string;
        };
        quantity: number;
        unit_price: number;
        total_price: number;
    }[];
    profiles: {
        name: string;
        phone: string;
    };
}

interface AdminOrdersProps {
    onBack: () => void;
}

export default function AdminOrders({ onBack }: AdminOrdersProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const fetchProfileName = async (userId: string) => {
        try {
            const profileDoc = await getDoc(doc(db, 'profiles', userId));
            if (profileDoc.exists()) {
                const data = profileDoc.data();
                return { name: data.name, phone: data.phone };
            }
            return { name: 'Unknown', phone: 'Unknown' };
        } catch {
            return { name: 'Unknown', phone: 'Unknown' };
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'orders'));
            const querySnapshot = await getDocs(q);

            const ordersData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const profile = await fetchProfileName(data.user_id);

                return {
                    id: docSnap.id,
                    ...data,
                    created_at: data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at,
                    profiles: profile
                } as Order;
            }));

            // Sort client-side to avoid index issues
            ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setOrders(ordersData);
        } catch (error) {
            console.error("Error loading orders:", error);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const updateData: any = { status: newStatus };
            if (newStatus === 'payment_confirmed') {
                updateData.payment_confirmed_at = new Date().toISOString();
            }

            await updateDoc(doc(db, 'orders', orderId), updateData);

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.profiles.phone.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'pending_payment', label: 'Pending Payment' },
        { value: 'payment_under_review', label: 'Payment Under Review' },
        { value: 'payment_confirmed', label: 'Payment Confirmed' },
        { value: 'packing', label: 'Packing' },
        { value: 'shipped', label: 'Dispatched' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-primary rounded-full transition-smooth"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-primary dark:text-accent">
                        Order Management
                    </h1>
                </div>
            </div>

            <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order No, Name or Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-primary rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-primary rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-primary-light rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-primary">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-primary">
                            {filteredOrders.map((order) => (
                                <Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-primary transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                    className="text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                                                >
                                                    {expandedOrderId === order.id ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.order_no}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Bill ID: {order.bill_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{order.profiles.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{order.profiles.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                ${order.final_amount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-sm rounded-full px-3 py-1 border-0 cursor-pointer font-medium focus:ring-2 focus:ring-offset-1 focus:ring-primary ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'payment_confirmed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr>
                                            <td colSpan={5} className="bg-gray-50 dark:bg-primary-light/50 px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-bold mb-3 text-gray-700 dark:text-gray-300">Order Items:</p>
                                                    <div className="grid gap-4">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="border-b border-gray-200 dark:border-primary">
                                                                    <th className="pb-2 text-xs text-gray-500">Product</th>
                                                                    <th className="pb-2 text-xs text-gray-500">Qty</th>
                                                                    <th className="pb-2 text-xs text-gray-500">Price</th>
                                                                    <th className="pb-2 text-xs text-gray-500">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.order_items?.map((item, idx) => (
                                                                    <tr key={idx} className="border-b border-gray-100 dark:border-primary last:border-0">
                                                                        <td className="py-2 flex items-center gap-3">
                                                                            <img src={item.product?.primary_image} alt="" className="w-10 h-10 rounded object-cover" />
                                                                            <span className="text-gray-900 dark:text-gray-100">{item.product?.name}</span>
                                                                        </td>
                                                                        <td className="py-2 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                                        <td className="py-2 text-gray-600 dark:text-gray-400">${item.unit_price}</td>
                                                                        <td className="py-2 font-medium text-gray-900 dark:text-gray-100">${item.total_price}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No orders found matching your criteria
                    </div>
                )}
            </div>
        </div >
    );
}
