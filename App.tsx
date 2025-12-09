import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ProductModal from './components/ProductModal';
import Shop from './components/Shop';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import { Product, ViewState, ToastMessage, ToastType, CartItem } from './types';
import { SALES_DATA, CATEGORY_DATA } from './constants';

const App: React.FC = () => {
  // App Mode State: 'customer' or 'admin'
  const [appMode, setAppMode] = useState<'customer' | 'admin'>('customer');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Admin User');

  // Admin View State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Customer View State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Shared Data
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Toast Logic ---
  const addToast = (message: string, type: ToastType = ToastType.INFO) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Data Fetching ---
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      addToast('Failed to load products', ToastType.ERROR);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Auth Logic ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        const name = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Admin User';
        setUserName(name);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        const name = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Admin User';
        setUserName(name);
      } else {
        setAppMode('customer');
        setUserName('Admin User');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoClick = () => {
    if (appMode === 'customer') {
      if (isAuthenticated) {
        setAppMode('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      // If already in admin, maybe go back to home? 
    }
  };

  const handleLoginSuccess = () => {
    // setIsAuthenticated(true); // Handled by listener
    setIsLoginModalOpen(false);
    setAppMode('admin');
    addToast("Welcome back, Admin", ToastType.SUCCESS);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // setIsAuthenticated(false); // Handled by listener
    // setAppMode('customer'); // Handled by listener
    addToast("Logged out successfully", ToastType.INFO);
  };

  // --- Admin Logic ---
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const toastId = Date.now().toString();
    const product = products.find(p => p.id === id);
    
    // Add confirmation toast
    setToasts(prev => [...prev, {
      id: toastId,
      message: `Are you sure you want to delete ${product?.name || 'this product'}?`,
      type: ToastType.ERROR,
      action: {
        label: 'Delete',
        onClick: () => {
          // Remove confirmation toast
          setToasts(prev => prev.filter(t => t.id !== toastId));
          // Proceed with deletion
          deleteProduct(id);
        },
        variant: 'danger'
      },
      dismiss: {
        label: 'Cancel',
        onClick: () => {
          // Remove confirmation toast
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }
      }
    }]);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      addToast("Failed to delete product", ToastType.ERROR);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast("Product deleted successfully", ToastType.SUCCESS);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (editingProduct) {
        // Update existing
        const { error } = await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            description: product.description,
            status: product.status
          })
          .eq('id', product.id);

        if (error) throw error;
        addToast("Product updated successfully", ToastType.SUCCESS);
      } else {
        // Create new
        const { error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            description: product.description,
            status: product.status
          }]);

        if (error) throw error;
        addToast("Product added successfully", ToastType.SUCCESS);
      }

      setIsProductModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error saving product:', error);
      addToast("Failed to save product", ToastType.ERROR);
    }
  };

  // --- Customer Logic ---
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast(`${product.name} added to cart`, ToastType.SUCCESS);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCart([]); // Clear cart
    // In a real app, this would process payment and deduct stock
    addToast("Thank you for your purchase!", ToastType.SUCCESS);
  };

  // 1. Customer View
  if (appMode === 'customer') {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-violet-500/30">
        {/* Customer Header */}
        <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
          <div className="absolute inset-0 bg-neutral-900/0 backdrop-blur-md border-b border-white/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* Logo - Acts as Login Trigger */}
              <button
                className="group flex items-center gap-3 cursor-pointer focus:outline-none"
                onClick={handleLogoClick}
                title="Admin Login"
              >
                <div className="bg-white text-black p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tighter">
                  ShopWith<span className="text-violet-400">Kylie</span>
                </h1>
              </button>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative group p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Open Cart</span>
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-[10px] font-bold leading-none text-white transform bg-violet-600 rounded-full border-2 border-[#0a0a0a]">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Customer Content */}
        <main className="flex-grow pt-20">
          <Shop
            products={products}
            onAddToCart={handleAddToCart}
          />
        </main>

        {/* Footer */}
        <footer className="bg-neutral-900 border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-bold tracking-tight">ShopWithKylie</span>
            </div>
            <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} ShopWithKylie. Premium Footwear.</p>
          </div>
        </footer>

        {/* Modals */}
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLoginSuccess}
        />

        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // 2. Admin View
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white selection:bg-violet-500/30">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        userName={userName}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients for Admin */}
        <div className="absolute top-0 left-0 w-full h-96 bg-violet-900/10 blur-[100px] pointer-events-none"></div>

        {/* Admin Header Mobile */}
        <div className="flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl border-b border-white/5 px-4 py-3 lg:hidden sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-3 text-lg font-bold">Admin</span>
          </div>
        </div>

        {/* Desktop Admin Header Extras */}
        <div className="hidden lg:flex justify-end p-4 lg:p-6 sticky top-0 z-20">
          <button
            onClick={() => setAppMode('customer')}
            className="hidden sm:flex px-4 py-2 rounded-full glass-button text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-2 uppercase tracking-wide"
          >
            View Storefront
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
        </div>

        {/* Admin Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {currentView === 'dashboard' && (
            <Dashboard
              products={products}
            />
          )}

          {currentView === 'inventory' && (
            <Inventory
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </main>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
};

// Toast Container Helper
const ToastContainer = ({ toasts }: { toasts: ToastMessage[] }) => (
  <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3 pointer-events-none">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`pointer-events-auto flex flex-col w-full max-w-sm p-4 rounded-xl shadow-2xl text-white transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 backdrop-blur-xl border border-white/10 ${
          toast.type === ToastType.SUCCESS ? 'bg-emerald-900/80 text-emerald-100' :
          toast.type === ToastType.ERROR ? 'bg-rose-900/80 text-rose-100' : 'bg-neutral-800/80 text-neutral-200'
        }`}
      >
        <div className="text-sm font-semibold tracking-wide mb-3">{toast.message}</div>
        
        {(toast.action || toast.dismiss) && (
          <div className="flex gap-2 mt-2">
            {toast.dismiss && (
              <button
                onClick={toast.dismiss.onClick}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {toast.dismiss.label}
              </button>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-colors ${
                  toast.action.variant === 'danger' 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default App;