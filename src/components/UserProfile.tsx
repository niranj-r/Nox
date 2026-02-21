import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Edit2, Save, Phone, Mail, Home, ShoppingCart, ShieldCheck, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfile() {
    const { user, profile, updateProfile } = useAuth();
    const { items: cartItems } = useCart();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        shipping_address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                shipping_address: {
                    street: profile.shipping_address?.street || '',
                    city: profile.shipping_address?.city || '',
                    state: profile.shipping_address?.state || '',
                    zip: profile.shipping_address?.zip || '',
                    country: profile.shipping_address?.country || ''
                }
            });
        }
    }, [profile]);

    useEffect(() => {
        const fetchOrderCount = async () => {
            if (user) {
                try {
                    const q = query(collection(db, 'orders'), where('user_id', '==', user.uid));
                    const snapshot = await getCountFromServer(q);
                    setOrderCount(snapshot.data().count);
                } catch (error) {
                    console.error("Error fetching order count:", error);
                    setOrderCount(0);
                }
            }
        };
        fetchOrderCount();
    }, [user]);


    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            shipping_address: formData.shipping_address
        });

        setIsSaving(false);
        if (!error) {
            setIsEditing(false);
        } else {
            alert('Failed to update profile: ' + error.message);
        }
    };

    if (!user || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-primary transition-colors duration-500">
                <div className="animate-pulse text-gray-500 dark:text-accent/60 tracking-[0.2em] uppercase text-xs font-bold">
                    Identifying User...
                </div>
            </div>
        );
    }

    const inputClasses = "w-full bg-transparent border-b-2 border-gray-200 dark:border-accent/20 pb-2 text-primary dark:text-white font-bold focus:outline-none focus:border-primary dark:focus:border-accent transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-600";

    return (
        <section className="min-h-screen bg-gray-50 dark:bg-primary pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6"
                >
                    <div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-primary dark:text-white leading-[0.85] mb-4">
                            Profile
                        </h1>
                        <p className="text-gray-500 dark:text-accent/60 tracking-[0.2em] font-bold uppercase text-xs">
                            Account Overview & Logistics
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isEditing && (
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: profile.name || '',
                                        phone: profile.phone || '',
                                        shipping_address: {
                                            street: profile.shipping_address?.street || '',
                                            city: profile.shipping_address?.city || '',
                                            state: profile.shipping_address?.state || '',
                                            zip: profile.shipping_address?.zip || '',
                                            country: profile.shipping_address?.country || ''
                                        }
                                    });
                                }}
                                className="bg-transparent text-gray-500 dark:text-accent/60 hover:text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] transition-colors px-4 py-4"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isEditing) handleSave();
                                else setIsEditing(true);
                            }}
                            disabled={isSaving}
                            className={`group relative flex items-center justify-center space-x-3 px-8 py-4 rounded-none font-bold uppercase tracking-[0.2em] transition-all duration-300 text-xs overflow-hidden ${isEditing
                                ? 'bg-primary dark:bg-accent text-white dark:text-primary hover:bg-gray-900 dark:hover:bg-white'
                                : 'bg-white dark:bg-primary-light text-primary dark:text-white border border-gray-200 dark:border-accent/20 hover:border-primary dark:hover:border-accent'
                                }`}
                        >
                            {isSaving ? (
                                <span className="animate-pulse">Updating...</span>
                            ) : isEditing ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
                    {/* Left Column: ID Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-4 h-auto"
                    >
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-accent/10 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col items-center text-center h-full relative">
                            {/* Decorative Top Right Circle (from screenshot) */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 dark:bg-accent/5 rounded-bl-[100px] pointer-events-none" />

                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-primary-light flex items-center justify-center text-6xl font-black text-gray-300 dark:text-accent/20 uppercase mb-6 shadow-sm border border-white">
                                {profile.name ? profile.name.charAt(0) : 'S'}
                            </div>

                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full Name"
                                    className={`${inputClasses} text-center text-2xl mb-4`}
                                />
                            ) : (
                                <h2 className="text-2xl font-black uppercase tracking-tight text-[#0f342b] dark:text-white mb-4">
                                    {profile.name || 'User'}
                                </h2>
                            )}

                            <div className="flex items-center justify-center text-gray-500 dark:text-accent/60 text-sm font-medium mb-8">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{user.email || 'user@gmail.com'}</span>
                            </div>

                            <div className="w-full pt-6 border-t border-gray-100 dark:border-accent/10 mt-2 text-left">
                                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-6">
                                    Account Metrics
                                </h4>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500 dark:text-accent/60">
                                            <Package className="w-4 h-4 mr-3" />
                                            <span>Total Orders</span>
                                        </div>
                                        <span className="font-bold text-[#0f342b] dark:text-white">
                                            {orderCount === null ? (
                                                <div className="w-4 h-4 border-2 border-[#0f342b] dark:border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                orderCount
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500 dark:text-accent/60">
                                            <Clock className="w-4 h-4 mr-3" />
                                            <span>Member Since</span>
                                        </div>
                                        <span className="font-bold text-[#0f342b] dark:text-white">
                                            {new Date(user.metadata?.creationTime || Date.now()).getFullYear()}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-accent/10">
                                    <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400 dark:text-accent/40 uppercase mb-4">
                                        Verification Status
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#0f342b] dark:text-white">Active Clearance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-8 flex flex-col gap-8"
                    >
                        {/* Communications Card */}
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-accent/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center mb-6 pb-6 border-b border-gray-100 dark:border-accent/10">
                                <Phone className="w-4 h-4 text-gray-400 dark:text-accent/50 mr-4" />
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f342b] dark:text-white">
                                    Communications
                                </h3>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-3">
                                    Primary Comms Line
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="91 9207755908"
                                        className={inputClasses}
                                    />
                                ) : (
                                    <p className="text-xl font-medium text-[#0f342b] dark:text-gray-300">
                                        {profile.phone || '91 9207755908'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Logistics Card */}
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-accent/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-accent/10">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 text-gray-400 dark:text-accent/50 mr-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f342b] dark:text-white">
                                        Logistics Routing
                                    </h3>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, shipping_address: { street: '', city: '', state: '', zip: '', country: '' } }));
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear Form
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.shipping_address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                shipping_address: { ...formData.shipping_address, street: e.target.value }
                                            })}
                                            placeholder="123 Sector Ave"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.shipping_address.city}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    shipping_address: { ...formData.shipping_address, city: e.target.value }
                                                })}
                                                placeholder="Metropolis"
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">
                                                State / Province
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.shipping_address.state}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    shipping_address: { ...formData.shipping_address, state: e.target.value }
                                                })}
                                                placeholder="NY"
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.shipping_address.zip}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    shipping_address: { ...formData.shipping_address, zip: e.target.value }
                                                })}
                                                placeholder="10001"
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.shipping_address.country}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    shipping_address: { ...formData.shipping_address, country: e.target.value }
                                                })}
                                                placeholder="United States"
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {profile.shipping_address?.street ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">Street</p>
                                                <p className="text-sm font-medium text-[#0f342b] dark:text-gray-300 break-words">{profile.shipping_address.street}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">City / Region</p>
                                                <p className="text-sm font-medium text-[#0f342b] dark:text-gray-300 break-words">
                                                    {profile.shipping_address.city}{profile.shipping_address.state ? `, ${profile.shipping_address.state}` : ''}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">Postal Code</p>
                                                <p className="text-sm font-medium text-[#0f342b] dark:text-gray-300">{profile.shipping_address.zip || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 dark:text-accent/50 mb-2">Country</p>
                                                <p className="text-sm font-medium text-[#0f342b] dark:text-gray-300">{profile.shipping_address.country || '—'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-16 text-center bg-gray-50/50 dark:bg-primary-light/10 border border-dashed border-gray-200 dark:border-accent/20 rounded-xl">
                                            <Home className="w-8 h-8 text-gray-300 dark:text-accent/30 mx-auto mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-[0.1em] text-gray-600 dark:text-accent/80">No Logistics Data Found</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Enter edit mode to set your secure routing information.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}