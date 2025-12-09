import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials for demonstration
    // Using 'admin' / 'admin' as requested for temporary access
    if (username === 'admin' && password === 'admin') {
      onLogin();
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid username or password');
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
                <label htmlFor="username" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  className="block w-full px-4 py-3 bg-neutral-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-neutral-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
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
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all uppercase tracking-wide"
              >
                Enter Dashboard
              </button>
            </form>

             <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-neutral-500 mb-4">Demo Credentials: admin / admin</p>
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