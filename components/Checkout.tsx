import React, { useState } from 'react';
import { CartItem, UserProfile } from '../types';
import { supabase } from '../services/supabase';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface CheckoutProps {
    cart: CartItem[];
    total: number;
    onBack: () => void;
    onSuccess: (orderId: string) => void;
    user: UserProfile | null;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, onBack, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        fullName: user?.full_name || '',
        address: user?.address || '',
        city: user?.city || '',
        zipCode: user?.zip_code || '',
        country: user?.country || '',
        phone: user?.phone || '',
        password: '', // For new account creation
        createAccount: !user, // Default to true if no user
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let userId = user?.id;

            // 1. Handle Account Creation / Auth
            if (!user && formData.createAccount) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        }
                    }
                });

                if (authError) throw authError;
                if (authData.user) {
                    userId = authData.user.id;

                    // Create Profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            email: formData.email,
                            full_name: formData.fullName,
                            address: formData.address,
                            city: formData.city,
                            zip_code: formData.zipCode,
                            country: formData.country,
                            phone: formData.phone
                        }]);

                    if (profileError) {
                        // If profile creation fails, we might still want to proceed but log it
                        console.error("Profile creation failed", profileError);
                    }
                }
            } else if (!user) {
                // Guest checkout logic could go here, but for now we require account or create one
                // If we want to support guest checkout, we'd need to adjust the RLS or create a 'guest' user concept
                // For this task, "create user account" is a requirement.
                throw new Error("Please create an account to checkout.");
            }

            if (!userId) throw new Error("Authentication failed");

            // 2. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: userId,
                    total_amount: total,
                    status: 'pending',
                    shipping_details: {
                        address: formData.address,
                        city: formData.city,
                        zip_code: formData.zipCode,
                        country: formData.country,
                        phone: formData.phone
                    }
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            onSuccess(orderData.id);

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
                onClick={onBack}
                className="flex items-center text-neutral-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Shop
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-8">Checkout</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                                {!user && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required={formData.createAccount}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                        />
                                        <p className="text-xs text-neutral-500 mt-1">Create a password to track your order later.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">ZIP Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            required
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Complete Order
                                    <span className="font-normal opacity-80">(UGX {total.toLocaleString()})</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-neutral-400">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">UGX {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-2">
                            <div className="flex justify-between text-neutral-400">
                                <span>Subtotal</span>
                                <span>UGX {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10 mt-2">
                                <span>Total</span>
                                <span>UGX {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
