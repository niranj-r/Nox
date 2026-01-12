import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, Phone, Key, ArrowRight, Loader } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminAuth() {
    const { signIn, signUp, signOut } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        secretKey: '' // Required for admin signup
    });

    const ADMIN_SECRET_KEY = "NOX-ADMIN-2024"; // Simple secret key for demo purposes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Admin Login
                const { error: signInError } = await signIn(formData.email, formData.password);
                if (signInError) throw signInError;

                // Check if user is actually an admin is handled by the parent component (AdminPanel) 
                // watching the auth state, but we can double check here to show a specific error
                // However, AuthContext state updates might take a moment. 
                // We will rely on the AuthContext logic finding the admin_user doc.

            } else {
                // Admin Signup
                if (formData.secretKey !== ADMIN_SECRET_KEY) {
                    throw new Error("Invalid Admin Secret Key");
                }

                const { error: signUpError } = await signUp(formData.email, formData.password, {
                    name: formData.name,
                    phone: formData.phone,
                    shipping_address: { // Placeholder for admin
                        street: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: ''
                    }
                });

                if (signUpError) throw signUpError;

                // Grant Admin Privileges
                // We need the user ID. signUp logs them in, so auth.currentUser is set.
                // But we need to use the auth instance from firebase.ts or rely on context
                // Since `signUp` in context handles profile creation, we just need to add the admin doc.

                // Wait briefly for auth state to propagate or fetch current user directly?
                // Actually, successful signUp logs the user in.

                // We need to access the user ID. The context `user` might not be updated immediately in this closure.
                // Instead of complicating, let's look at `signUp` return. 
                // AuthContext `signUp` returns { error }.

                // Let's manually get the current user from the auth import to be safe and immediate
                const { auth } = await import('../lib/firebase');
                if (auth.currentUser) {
                    await setDoc(doc(db, 'admin_users', auth.currentUser.uid), {
                        role: 'admin',
                        created_at: new Date().toISOString()
                    });
                    // Force refresh of admin status in context?
                    // AuthContext listens to onAuthStateChanged, which might not re-trigger on db write.
                    // But the component `AdminPanel` checks `isAdmin`. 
                    // We might need to reload the page or trigger a profile refresh.
                    window.location.reload();
                }
            }
        } catch (err) {
            setError((err as Error).message);
            if (isLogin) {
                // If login failed or not admin, sign out to clean state
                await signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-primary flex items-center justify-center px-4 transition-smooth">
            <div className="max-w-md w-full bg-white dark:bg-primary-light rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-primary-light/50">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-primary dark:bg-accent rounded-xl flex items-center justify-center mb-4 text-white dark:text-primary shadow-lg dark:shadow-accent/20">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-primary dark:text-accent">
                            {isLogin ? 'Admin Portal' : 'Admin Registration'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isLogin ? 'Secure access for store managers' : 'Create a new administrative account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-primary border border-gray-200 dark:border-primary rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all dark:text-gray-100"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                        Phone
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-primary border border-gray-200 dark:border-primary rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all dark:text-gray-100"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                        Admin Secret Key
                                    </label>
                                    <div className="relative group">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.secretKey}
                                            onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-primary border border-gray-200 dark:border-primary rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all dark:text-gray-100"
                                            placeholder="Enter secret key"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-primary border border-gray-200 dark:border-primary rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all dark:text-gray-100"
                                    placeholder="admin@nox.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-primary border border-gray-200 dark:border-primary rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all dark:text-gray-100"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary dark:bg-accent text-white dark:text-primary font-bold text-lg rounded-xl hover:bg-primary-light dark:hover:bg-accent-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl dark:shadow-accent/10 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? (
                                <Loader className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Access Dashboard' : 'Create Admin Account'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-primary-light/50 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({
                                    email: '',
                                    password: '',
                                    name: '',
                                    phone: '',
                                    secretKey: ''
                                });
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent font-medium transition-colors"
                        >
                            {isLogin ? "Don't have an admin account? Register" : 'Already have an account? Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
