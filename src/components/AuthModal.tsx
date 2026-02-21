import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signUp(registerData.email, registerData.password, {
      name: registerData.name,
      phone: registerData.phone,
      shipping_address: {
        street: registerData.street,
        city: registerData.city,
        state: registerData.state,
        zip: registerData.zip,
        country: registerData.country,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#424242] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-smooth">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary dark:bg-white text-white dark:text-[#363636] font-bold uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-primary-light dark:hover:bg-gray-300 transition-smooth disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('register')}
                  className="text-primary dark:text-white font-bold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={registerData.street}
                  onChange={(e) => setRegisterData({ ...registerData, street: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.state}
                    onChange={(e) => setRegisterData({ ...registerData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.zip}
                    onChange={(e) => setRegisterData({ ...registerData, zip: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.country}
                    onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent bg-white dark:bg-[#363636] text-gray-900 dark:text-gray-100 transition-smooth"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary dark:bg-white text-white dark:text-[#363636] font-medium rounded-lg hover:bg-primary-light dark:hover:bg-gray-300 transition-smooth disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('login')}
                  className="text-primary dark:text-white font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
