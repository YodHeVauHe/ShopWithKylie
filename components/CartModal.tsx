import React, { useState } from 'react';
import { CartItem } from '../types';
import { useDiscountCode } from '../hooks/useDiscountCode';
import { Gift, X, Check, AlertCircle } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity, onCheckout }) => {
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const { discountCode, isLoading, error, validateCode, clearDiscount, applyDiscount } = useDiscountCode();
  
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountCode ? Math.round(subtotal * (discountCode.discount_percentage / 100)) : 0;
  const total = subtotal - discountAmount;

  const handleApplyDiscount = async () => {
    const isValid = await validateCode(discountCodeInput, subtotal, cartItems.map(item => item.id));
    if (isValid) {
      setDiscountCodeInput('');
    }
  };

  const handleCheckout = async () => {
    if (discountCode) {
      await applyDiscount();
    }
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="flex-1 flex flex-col bg-[#0f0f0f] shadow-2xl animate-slide-in-right border-l border-white/5">

          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white tracking-tight">Your Cart <span className="text-violet-500">({cartItems.length})</span></h2>
            <button type="button" className="text-neutral-500 hover:text-white transition-colors" onClick={onClose}>
              <span className="sr-only">Close panel</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Cart is empty</h3>
                <p className="text-neutral-500 text-sm max-w-xs">Looks like you haven't found your perfect pair yet.</p>
                <button
                  onClick={onClose}
                  className="mt-8 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-neutral-200 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex p-3 bg-neutral-900/50 rounded-2xl border border-white/5">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/5 bg-neutral-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-base font-bold text-white">
                          <h3>{item.name}</h3>
                          <p className="ml-4 font-mono">UGX {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500 uppercase tracking-wide">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <div className="flex items-center bg-black/30 rounded-lg px-2 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-neutral-400 hover:text-white px-2 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-white font-medium mx-2">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="text-neutral-400 hover:text-white px-2 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="font-medium text-xs text-neutral-500 hover:text-rose-400 transition-colors uppercase tracking-wide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-white/5 px-4 py-4 bg-neutral-900/80 backdrop-blur-xl">
              {/* Discount Code Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Discount Code</span>
                </div>
                
                {!discountCode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter discount code"
                        className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={isLoading || !discountCodeInput.trim()}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-xs text-rose-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-sm font-medium text-white">{discountCode.code}</span>
                        <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
                          {discountCode.discount_percentage}% OFF
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={clearDiscount}
                      className="text-neutral-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-base font-medium text-neutral-400">
                  <p>Subtotal</p>
                  <p className="text-white font-bold">UGX {subtotal.toLocaleString()}</p>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-base font-medium text-emerald-400">
                    <p>Discount ({discountCode?.code})</p>
                    <p className="font-bold">-UGX {discountAmount.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium text-neutral-400">
                  <p>Shipping</p>
                  <p className="text-white">Calculated at checkout</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <p>Total</p>
                    <p>UGX {total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center rounded-xl bg-violet-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-violet-900/20 hover:bg-violet-500 transition-all uppercase tracking-wide"
              >
                Checkout Now
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-xs font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-wide"
                  onClick={onClose}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;