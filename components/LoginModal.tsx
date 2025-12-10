import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { error: error?.message });

      if (error) {
        throw error;
      }

      onLogin();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-middle glass-panel rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md w-full border border-white/5">
          <div className="px-8 py-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Admin Access</h3>
              <p className="text-sm text-neutral-400">
                Secure gateway for store management.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="block w-full px-4 py-3 bg-neutral-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-neutral-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  className="block w-full px-4 py-3 bg-neutral-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-neutral-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••"
                />
              </div>

              {error && (
                <div className="text-sm text-rose-400 bg-rose-900/10 p-3 rounded-xl border border-rose-500/20 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Enter Dashboard'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button
                onClick={onClose}
                className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                Return to Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;