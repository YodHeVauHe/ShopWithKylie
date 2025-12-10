import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Order, OrderItem } from '../types';
import { Search, Package, MapPin, Calendar, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface OrderTrackingProps {
    onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ onBack }) => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items (
            *,
            product:products (*)
          )
        `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (err: any) {
            console.error('Tracking error:', err);
            setError('Order not found. Please check the Order ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'shipped': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'processing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'cancelled': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
                onClick={onBack}
                className="flex items-center text-neutral-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Shop
            </button>

            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Track Your Order</h2>
                <p className="text-neutral-400">Enter your Order ID to see the current status and details.</p>
            </div>

            <form onSubmit={handleTrack} className="relative max-w-xl mx-auto mb-12">
                <div className="relative">
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter Order ID (e.g., 123e4567-e89b...)"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl pl-6 pr-32 py-4 text-white focus:outline-none focus:border-violet-500 transition-colors shadow-lg"
                    />
                    <button
                        type="submit"
                        disabled={loading || !orderId.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-violet-600 hover:bg-violet-500 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-xl flex items-center gap-3 justify-center mb-8">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {order && (
                <div className="bg-neutral-900/50 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-sm text-neutral-400 mb-1">Order ID: <span className="font-mono text-white">{order.id}</span></p>
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full border text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 grid gap-8">
                        {/* Shipping */}
                        <div className="flex items-start gap-4">
                            <div className="bg-neutral-800 p-2.5 rounded-lg">
                                <MapPin className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Shipping Address</h4>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    {order.shipping_details.address}<br />
                                    {order.shipping_details.city}, {order.shipping_details.zip_code}<br />
                                    {order.shipping_details.country}<br />
                                    {order.shipping_details.phone && <span className="text-neutral-500 mt-1 block">{order.shipping_details.phone}</span>}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-violet-400" />
                                Order Items
                            </h4>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-neutral-800/30 p-3 rounded-xl">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                                            {item.product?.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium">{item.product?.name || 'Unknown Product'}</h5>
                                            <p className="text-sm text-neutral-400">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">UGX {item.price_at_purchase.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                            <span className="text-neutral-400">Total Amount</span>
                            <span className="text-2xl font-bold">UGX {order.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
