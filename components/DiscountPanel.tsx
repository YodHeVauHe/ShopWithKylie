import React, { useState, useMemo } from 'react';
import { Product, DiscountCode } from '../types';
import { Tag, Percent, Check, X, Sparkles, AlertCircle, CheckSquare, Square, MinusSquare, Gift, Clock, Users, Trash2, Edit, Copy } from 'lucide-react';
import { DiscountService } from '../services/discountService';

interface DiscountPanelProps {
    products: Product[];
    onApplyDiscount: (productIds: string[], discount: number) => Promise<void>;
    onRemoveDiscount: (productIds: string[]) => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    userName?: string;
}

const DiscountPanel: React.FC<DiscountPanelProps> = ({
    products,
    onApplyDiscount,
    onRemoveDiscount,
    addToast,
    userName = 'admin',
}) => {
    // Load saved state from localStorage on component mount
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('discountPanel_selectedIds');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [discountPercentage, setDiscountPercentage] = useState<number>(() => {
        const saved = localStorage.getItem('discountPanel_percentage');
        return saved ? parseInt(saved) : 20;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDiscount, setFilterDiscount] = useState<'all' | 'discounted' | 'not-discounted'>('all');
    const [isApplying, setIsApplying] = useState(false);

    // Discount code states
    const [showCodeGenerator, setShowCodeGenerator] = useState(false);
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [newCodeData, setNewCodeData] = useState({
        code: '',
        discount_percentage: 10,
        description: '',
        max_uses: '',
        expires_at: '',
        minimum_amount: '',
        applicable_products: [] as string[],
        applicable_categories: [] as string[]
    });
    const [isCreatingCode, setIsCreatingCode] = useState(false);

    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(products.map(p => p.category)))];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
            const matchesDiscount =
                filterDiscount === 'all' ||
                (filterDiscount === 'discounted' && product.discount && product.discount > 0) ||
                (filterDiscount === 'not-discounted' && (!product.discount || product.discount === 0));
            return matchesSearch && matchesCategory && matchesDiscount;
        });
    }, [products, searchTerm, filterCategory, filterDiscount]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            // Save to localStorage
            localStorage.setItem('discountPanel_selectedIds', JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    const selectAllFiltered = () => {
        const allFilteredIds = filteredProducts.map(p => p.id);
        setSelectedIds(new Set(allFilteredIds));
        // Save to localStorage
        localStorage.setItem('discountPanel_selectedIds', JSON.stringify(allFilteredIds));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
        // Save to localStorage
        localStorage.setItem('discountPanel_selectedIds', JSON.stringify([]));
    };

    const isAllSelected = filteredProducts.length > 0 &&
        filteredProducts.every(p => selectedIds.has(p.id));

    const isSomeSelected = filteredProducts.some(p => selectedIds.has(p.id));

    const handleApplyDiscount = async () => {
        if (selectedIds.size === 0) return;
        setIsApplying(true);
        try {
            await onApplyDiscount(Array.from(selectedIds), discountPercentage);
            // Clear selection after successful application
            setSelectedIds(new Set());
            localStorage.setItem('discountPanel_selectedIds', JSON.stringify([]));
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveDiscount = async () => {
        if (selectedIds.size === 0) return;
        setIsApplying(true);
        try {
            await onRemoveDiscount(Array.from(selectedIds));
            // Clear selection after successful removal
            setSelectedIds(new Set());
            localStorage.setItem('discountPanel_selectedIds', JSON.stringify([]));
        } finally {
            setIsApplying(false);
        }
    };

    // Discount code functions
    const loadDiscountCodes = async () => {
        setLoadingCodes(true);
        try {
            const result = await DiscountService.getDiscountCodes();
            if (result.success && result.data) {
                setDiscountCodes(result.data);
            }
        } finally {
            setLoadingCodes(false);
        }
    };

    const handleCreateDiscountCode = async () => {
        if (!newCodeData.code) {
            addToast('Please enter a discount code', 'error');
            return;
        }

        console.log('Starting discount code creation...');
        setIsCreatingCode(true);
        try {
            console.log('Calling DiscountService.createDiscountCode...');
            const result = await DiscountService.createDiscountCode({
                code: newCodeData.code || undefined,
                discount_percentage: newCodeData.discount_percentage,
                description: newCodeData.description || undefined,
                max_uses: newCodeData.max_uses ? parseInt(newCodeData.max_uses) : undefined,
                expires_at: newCodeData.expires_at || undefined,
                minimum_amount: newCodeData.minimum_amount ? parseInt(newCodeData.minimum_amount) : undefined,
                applicable_products: newCodeData.applicable_products.length > 0 ? newCodeData.applicable_products : undefined,
                applicable_categories: newCodeData.applicable_categories.length > 0 ? newCodeData.applicable_categories : undefined,
                created_by: userName || 'admin'
            });

            console.log('Discount code creation result:', result);

            if (result.success) {
                setNewCodeData({
                    code: '',
                    discount_percentage: 10,
                    description: '',
                    max_uses: '',
                    expires_at: '',
                    minimum_amount: '',
                    applicable_products: [],
                    applicable_categories: []
                });
                setShowCodeGenerator(false);
                loadDiscountCodes();
                addToast('Discount code created successfully!', 'success');
            } else {
                console.error('Discount code creation failed:', result.error);
                addToast(result.error || 'Failed to create discount code', 'error');
            }
        } catch (error) {
            console.error('Error creating discount code:', error);
            addToast('Failed to create discount code', 'error');
        } finally {
            console.log('Setting isCreatingCode to false');
            setIsCreatingCode(false);
        }
    };

    const handleDeleteDiscountCode = async (codeId: string) => {
        try {
            const result = await DiscountService.deleteDiscountCode(codeId);
            if (result.success) {
                loadDiscountCodes();
                addToast('Discount code deleted successfully', 'success');
            } else {
                addToast(result.error || 'Failed to delete discount code', 'error');
            }
        } catch (error) {
            console.error('Failed to delete discount code:', error);
            addToast('Failed to delete discount code', 'error');
        }
    };

    const handleRemoveAllDiscounts = async () => {
        const discountedProducts = products.filter(p => p.discount && p.discount > 0);
        if (discountedProducts.length === 0) {
            addToast('No products have discounts to remove', 'info');
            return;
        }

        setIsApplying(true);
        try {
            const discountedProductIds = discountedProducts.map(p => p.id);
            await onRemoveDiscount(discountedProductIds);
            addToast(`Removed discounts from ${discountedProductIds.length} products`, 'success');
        } catch (error) {
            console.error('Error removing all discounts:', error);
            addToast('Failed to remove discounts', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    const generateRandomCode = () => {
        setNewCodeData(prev => ({
            ...prev,
            code: DiscountService.generateRandomCode(8)
        }));
    };

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            addToast('Discount code copied to clipboard!', 'success');
        } catch (error) {
            addToast('Failed to copy code', 'error');
        }
    };

    // Load discount codes on component mount
    React.useEffect(() => {
        loadDiscountCodes();
    }, []);

    // Validate selected IDs when products change - remove any that no longer exist
    React.useEffect(() => {
        if (products.length > 0) {
            const currentProductIds = new Set(products.map(p => p.id));
            const validSelectedIds = new Set(Array.from(selectedIds).filter(id => currentProductIds.has(id)));

            // Only update if there's a change to avoid infinite loops
            if (validSelectedIds.size !== selectedIds.size) {
                setSelectedIds(validSelectedIds);
                localStorage.setItem('discountPanel_selectedIds', JSON.stringify(Array.from(validSelectedIds)));
            }
        }
    }, [products]);

    // Save discount percentage to localStorage whenever it changes
    React.useEffect(() => {
        localStorage.setItem('discountPanel_percentage', discountPercentage.toString());
    }, [discountPercentage]);

    const selectedProducts = products.filter(p => selectedIds.has(p.id));
    const discountedSelectedCount = selectedProducts.filter(p => p.discount && p.discount > 0).length;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                            <Tag className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Discounts</h2>
                            <p className="text-neutral-400 mt-1">Apply discounts to your inventory items.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/20">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Total Products</p>
                            <p className="text-2xl font-bold text-white">{products.length}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Percent className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Discounted</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                {products.filter(p => p.discount && p.discount > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                            <CheckSquare className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Selected</p>
                            <p className="text-2xl font-bold text-amber-400">{selectedIds.size}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Codes Section - Premium Redesign */}
            <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative p-4 sm:p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative">
                                <div className="absolute inset-0 bg-teal-500/30 rounded-xl blur-lg" />
                                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-teal-500/30 to-cyan-500/20 border border-teal-400/20">
                                    <Gift className="w-5 h-5 text-teal-300" />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Checkout Discount Codes</h3>
                                <p className="text-xs text-teal-200/60 mt-0.5 line-clamp-1">Generate and manage promo codes for customers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCodeGenerator(!showCodeGenerator)}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
                        >
                            <Gift className="w-4 h-4" />
                            <span className="hidden sm:inline">{showCodeGenerator ? 'Hide Generator' : 'Generate Code'}</span>
                            <span className="sm:hidden">{showCodeGenerator ? 'Hide' : 'New'}</span>
                        </button>
                    </div>

                    {/* Code Generator Form */}
                    {showCodeGenerator && (
                        <div className="mb-6 p-4 sm:p-5 bg-black/30 rounded-xl border border-white/10 backdrop-blur-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {/* Code Input */}
                                <div className="md:col-span-2 xl:col-span-1">
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Discount Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCodeData.code}
                                            onChange={(e) => setNewCodeData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            placeholder="SUMMER2024"
                                            className="flex-1 px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                        <button
                                            onClick={generateRandomCode}
                                            className="px-3.5 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 hover:text-teal-200 rounded-xl text-xs font-bold transition-all border border-teal-500/20 hover:border-teal-500/30"
                                        >
                                            Random
                                        </button>
                                    </div>
                                </div>

                                {/* Discount Percentage */}
                                <div>
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Discount %</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newCodeData.discount_percentage}
                                        onChange={(e) => setNewCodeData(prev => ({ ...prev, discount_percentage: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) }))}
                                        className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    />
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Max Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newCodeData.max_uses}
                                        onChange={(e) => setNewCodeData(prev => ({ ...prev, max_uses: e.target.value }))}
                                        placeholder="Unlimited"
                                        className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    />
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Expires</label>
                                    <input
                                        type="datetime-local"
                                        value={newCodeData.expires_at}
                                        onChange={(e) => setNewCodeData(prev => ({ ...prev, expires_at: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all [color-scheme:dark]"
                                    />
                                </div>

                                {/* Minimum Amount */}
                                <div>
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Min Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newCodeData.minimum_amount}
                                        onChange={(e) => setNewCodeData(prev => ({ ...prev, minimum_amount: e.target.value }))}
                                        placeholder="No minimum"
                                        className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2 xl:col-span-1">
                                    <label className="block text-xs font-semibold text-teal-200/80 mb-1.5 uppercase tracking-wider">Description</label>
                                    <input
                                        type="text"
                                        value={newCodeData.description}
                                        onChange={(e) => setNewCodeData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Holiday special discount..."
                                        className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                                <button
                                    onClick={handleCreateDiscountCode}
                                    disabled={isCreatingCode || !newCodeData.code}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Gift className="w-4 h-4" />
                                    {isCreatingCode ? 'Creating...' : 'Create Code'}
                                </button>
                                <button
                                    onClick={() => setShowCodeGenerator(false)}
                                    className="flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/20"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Existing Codes List */}
                    <div className="space-y-3">
                        {loadingCodes ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="relative">
                                    <div className="w-10 h-10 border-2 border-teal-500/20 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-teal-400 rounded-full animate-spin" />
                                </div>
                                <p className="text-teal-200/60 text-sm mt-4 font-medium">Loading codes...</p>
                            </div>
                        ) : discountCodes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl" />
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-400/20">
                                        <Gift className="w-8 h-8 text-teal-300/80" />
                                    </div>
                                </div>
                                <p className="text-white/80 text-sm font-semibold">No discount codes yet</p>
                                <p className="text-teal-200/50 text-xs mt-1 text-center max-w-[200px]">Create your first promo code to offer discounts</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {discountCodes.map((code) => (
                                    <div
                                        key={code.id}
                                        className="group relative bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 hover:border-teal-500/20 overflow-hidden transition-all duration-300 backdrop-blur-sm"
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="relative p-4">
                                            {/* Top Row - Code & Actions */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                                                    {/* Code Name */}
                                                    <span className="font-bold text-white text-base sm:text-lg tracking-wide font-mono">{code.code}</span>
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-2 py-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold rounded-lg shadow-sm">
                                                            {code.discount_percentage}% OFF
                                                        </span>
                                                        {code.is_active ? (
                                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/20">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/20">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/20 text-white/50 hover:text-sky-300 transition-all duration-200 border border-transparent hover:border-sky-500/20"
                                                        onClick={() => handleCopyCode(code.code)}
                                                        title="Copy code"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-300 transition-all duration-200 border border-transparent hover:border-rose-500/20"
                                                        onClick={() => handleDeleteDiscountCode(code.id)}
                                                        title="Delete code"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {code.description && (
                                                <p className="text-sm text-teal-200/60 mb-3 line-clamp-1">{code.description}</p>
                                            )}

                                            {/* Details Row */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                                {code.max_uses && (
                                                    <div className="flex items-center gap-1.5 text-white/50">
                                                        <Users className="w-3.5 h-3.5 text-teal-400/70" />
                                                        <span>
                                                            <span className="text-white/80 font-semibold">{code.uses_count}</span>
                                                            <span className="text-white/40">/{code.max_uses}</span>
                                                            <span className="ml-1">uses</span>
                                                        </span>
                                                    </div>
                                                )}
                                                {code.expires_at && (
                                                    <div className="flex items-center gap-1.5 text-white/50">
                                                        <Clock className="w-3.5 h-3.5 text-cyan-400/70" />
                                                        <span>
                                                            Expires <span className="text-white/70 font-medium">{new Date(code.expires_at).toLocaleDateString()}</span>
                                                        </span>
                                                    </div>
                                                )}
                                                {code.minimum_amount && (
                                                    <div className="flex items-center gap-1.5 text-white/50">
                                                        <span className="text-emerald-400/70 font-semibold">Min:</span>
                                                        <span className="text-white/70 font-medium">UGX {code.minimum_amount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Panel - Premium Glassmorphism Design */}
            <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-violet-500/5" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

                {/* Content */}
                <div className="relative p-4 sm:p-5 lg:p-6">
                    {/* Discount Configuration */}
                    <div className="flex flex-col gap-4 lg:gap-6">
                        {/* Top Row - Discount Input & Quick Set */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Discount Input Group */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <label className="text-sm font-semibold text-white/90 tracking-wide">
                                    Discount Percentage
                                </label>
                                <div className="relative flex items-center gap-2">
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-violet-500/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                                        <div className="relative bg-black/30 border border-white/10 rounded-xl overflow-hidden">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={discountPercentage}
                                                onChange={(e) => setDiscountPercentage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                                className="w-16 sm:w-20 px-3 py-2.5 bg-transparent text-white text-center text-lg font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                    <span className="px-3 py-2.5 bg-white/5 text-white/60 font-medium rounded-xl border border-white/10">%</span>
                                </div>
                            </div>

                            {/* Quick Set Buttons */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-white/40 font-medium tracking-wider uppercase sm:text-right">Quick set</span>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {[10, 15, 20, 25, 30, 50].map(percent => (
                                        <button
                                            key={percent}
                                            onClick={() => setDiscountPercentage(percent)}
                                            className={`
                                                px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl 
                                                transition-all duration-200 transform hover:scale-105 active:scale-95
                                                ${discountPercentage === percent
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                                                }
                                            `}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Divider with gradient */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                                {/* Apply Discount Button */}
                                <button
                                    onClick={handleApplyDiscount}
                                    disabled={selectedIds.size === 0 || isApplying}
                                    className={`
                                        group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 
                                        text-sm font-bold rounded-xl transition-all duration-300 transform
                                        ${selectedIds.size === 0
                                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="hidden sm:inline">Apply Discount</span>
                                    <span className="sm:hidden">Apply</span>
                                    {selectedIds.size > 0 && (
                                        <span className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs">
                                            {selectedIds.size}
                                        </span>
                                    )}
                                </button>

                                {/* Remove from Selected Button */}
                                {discountedSelectedCount > 0 && (
                                    <button
                                        onClick={handleRemoveDiscount}
                                        disabled={isApplying}
                                        className="
                                            inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 
                                            text-sm font-bold text-white/80 bg-white/5 hover:bg-white/10 
                                            border border-white/10 hover:border-white/20
                                            rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                        "
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove from Selected</span>
                                        <span className="sm:hidden">Remove</span>
                                    </button>
                                )}

                                {/* Clear All Discounts Button */}
                                <button
                                    onClick={handleRemoveAllDiscounts}
                                    disabled={isApplying || products.filter(p => p.discount && p.discount > 0).length === 0}
                                    className="
                                        inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 
                                        text-sm font-bold rounded-xl transition-all duration-200 
                                        hover:scale-[1.02] active:scale-[0.98]
                                        text-rose-400/80 hover:text-rose-400 
                                        bg-rose-500/5 hover:bg-rose-500/10 
                                        border border-rose-500/10 hover:border-rose-500/20
                                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                                    "
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Clear All Discounts</span>
                                    <span className="sm:hidden">Clear All</span>
                                </button>
                            </div>

                            {/* Selected Items Counter */}
                            <div className="flex items-center justify-between sm:justify-end lg:justify-end gap-3 sm:gap-4 p-3 sm:p-0 bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none">
                                <div className="flex flex-col items-start sm:items-end">
                                    <span className="text-xs text-white/40 font-medium tracking-wider uppercase">Selected Items</span>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <span className={`text-xl sm:text-2xl font-black ${selectedIds.size > 0 ? 'text-emerald-400' : 'text-white/60'}`}>
                                            {selectedIds.size}
                                        </span>
                                        <span className="text-sm text-white/40 font-medium">
                                            of {filteredProducts.length}
                                        </span>
                                    </div>
                                </div>
                                {/* Progress Ring (Mobile) */}
                                <div className="sm:hidden relative w-12 h-12">
                                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                                        <circle
                                            cx="20" cy="20" r="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="text-white/10"
                                        />
                                        <circle
                                            cx="20" cy="20" r="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(selectedIds.size / Math.max(filteredProducts.length, 1)) * 100} 100`}
                                            className="text-emerald-400 transition-all duration-500"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80">
                                        {filteredProducts.length > 0 ? Math.round((selectedIds.size / filteredProducts.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg text-sm leading-5 bg-black/20 text-white placeholder-neutral-500 focus:outline-none focus:bg-black/40 transition-colors"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${filterCategory === cat
                                    ? 'bg-white text-black'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Discount Filter */}
                    <div className="flex items-center space-x-1 sm:border-l sm:border-white/10 sm:pl-3">
                        <button
                            onClick={() => setFilterDiscount('all')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${filterDiscount === 'all'
                                ? 'bg-violet-600 text-white'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterDiscount('discounted')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${filterDiscount === 'discounted'
                                ? 'bg-emerald-600 text-white'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Discounted
                        </button>
                        <button
                            onClick={() => setFilterDiscount('not-discounted')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${filterDiscount === 'not-discounted'
                                ? 'bg-neutral-600 text-white'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            No Discount
                        </button>
                    </div>
                </div>
            </div>

            {/* Select All Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/30 rounded-xl border border-white/5">
                <button
                    onClick={() => isAllSelected ? deselectAll() : selectAllFiltered()}
                    className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                    {isAllSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : isSomeSelected ? (
                        <MinusSquare className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Square className="w-5 h-5 text-neutral-500" />
                    )}
                    <span className="font-medium">
                        {isAllSelected ? 'Deselect All' : `Select All (${filteredProducts.length})`}
                    </span>
                </button>
                {selectedIds.size > 0 && (
                    <span className="text-xs text-neutral-400">
                        {selectedIds.size} of {filteredProducts.length} selected
                    </span>
                )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                    const isSelected = selectedIds.has(product.id);
                    const hasDiscount = product.discount != null && product.discount > 0;
                    const discountedPrice = hasDiscount ? Math.round(product.price * (1 - product.discount / 100)) : product.price;

                    return (
                        <div
                            key={product.id}
                            onClick={() => toggleSelect(product.id)}
                            className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${isSelected
                                ? 'bg-emerald-900/20 border-emerald-500/40 ring-2 ring-emerald-500/30'
                                : 'bg-neutral-900/40 border-white/5 hover:border-white/10 hover:bg-neutral-900/60'
                                }`}
                        >
                            {/* Selection Checkbox */}
                            <div className={`absolute top-3 left-3 z-10 p-1 rounded-lg transition-all ${isSelected ? 'bg-emerald-500' : 'bg-black/60 backdrop-blur-sm'
                                }`}>
                                {isSelected ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <Square className="w-4 h-4 text-neutral-400" />
                                )}
                            </div>

                            {/* Discount Badge - Only show when discount is actually greater than 0 */}
                            {(hasDiscount) && (
                                <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                    {product.discount}% OFF
                                </div>
                            )}

                            {/* Image */}
                            <div className="aspect-square overflow-hidden bg-neutral-800/50">
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={`max-w-full max-h-full object-contain transition-all duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'
                                            }`}
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-neutral-500 mb-3">{product.category}</p>

                                {/* Price Display */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {hasDiscount ? (
                                        <>
                                            <span className="text-xs text-neutral-500 line-through">
                                                UGX {product.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-bold text-emerald-400">
                                                UGX {discountedPrice.toLocaleString()}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-bold text-white">
                                            UGX {product.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Stock */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`text-xs ${product.stock < 15 ? 'text-amber-400' : 'text-neutral-500'}`}>
                                        {product.stock} in stock
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="py-16 text-center">
                    <div className="inline-block p-4 rounded-full bg-neutral-900/50 mb-4">
                        <AlertCircle className="w-8 h-8 text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No products found</h3>
                    <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default DiscountPanel;
