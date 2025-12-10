import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Tag, Percent, Check, X, Sparkles, AlertCircle, CheckSquare, Square, MinusSquare } from 'lucide-react';

interface DiscountPanelProps {
    products: Product[];
    onApplyDiscount: (productIds: string[], discount: number) => Promise<void>;
    onRemoveDiscount: (productIds: string[]) => Promise<void>;
}

const DiscountPanel: React.FC<DiscountPanelProps> = ({
    products,
    onApplyDiscount,
    onRemoveDiscount,
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [discountPercentage, setDiscountPercentage] = useState<number>(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDiscount, setFilterDiscount] = useState<'all' | 'discounted' | 'not-discounted'>('all');
    const [isApplying, setIsApplying] = useState(false);

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
            return newSet;
        });
    };

    const selectAllFiltered = () => {
        const allFilteredIds = filteredProducts.map(p => p.id);
        setSelectedIds(new Set(allFilteredIds));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const isAllSelected = filteredProducts.length > 0 &&
        filteredProducts.every(p => selectedIds.has(p.id));

    const isSomeSelected = filteredProducts.some(p => selectedIds.has(p.id));

    const handleApplyDiscount = async () => {
        if (selectedIds.size === 0) return;
        setIsApplying(true);
        try {
            await onApplyDiscount(Array.from(selectedIds), discountPercentage);
            setSelectedIds(new Set());
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveDiscount = async () => {
        if (selectedIds.size === 0) return;
        setIsApplying(true);
        try {
            await onRemoveDiscount(Array.from(selectedIds));
            setSelectedIds(new Set());
        } finally {
            setIsApplying(false);
        }
    };

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

            {/* Action Panel */}
            <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Discount Percentage Input */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <label className="text-sm font-medium text-neutral-300">Discount:</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-20 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-center font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">%</span>
                        </div>
                    </div>

                    {/* Quick Discount Buttons */}
                    <div className="flex items-center gap-2">
                        {[10, 15, 20, 25, 30, 50].map(percent => (
                            <button
                                key={percent}
                                onClick={() => setDiscountPercentage(percent)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${discountPercentage === percent
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {percent}%
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 lg:ml-auto">
                        <button
                            onClick={handleApplyDiscount}
                            disabled={selectedIds.size === 0 || isApplying}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedIds.size === 0
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            Apply {discountPercentage}% to {selectedIds.size} items
                        </button>
                        {discountedSelectedCount > 0 && (
                            <button
                                onClick={handleRemoveDiscount}
                                disabled={isApplying}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Remove Discount
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="relative lg:max-w-md">
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
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar lg:border-l lg:border-white/10 lg:pl-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filterCategory === cat
                                ? 'bg-white text-black'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Discount Filter */}
                <div className="flex items-center space-x-1 lg:border-l lg:border-white/10 lg:pl-2">
                    <button
                        onClick={() => setFilterDiscount('all')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filterDiscount === 'all'
                            ? 'bg-violet-600 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterDiscount('discounted')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filterDiscount === 'discounted'
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Discounted
                    </button>
                    <button
                        onClick={() => setFilterDiscount('not-discounted')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filterDiscount === 'not-discounted'
                            ? 'bg-neutral-600 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        No Discount
                    </button>
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
                    const hasDiscount = product.discount && product.discount > 0;
                    const discountedPrice = hasDiscount ? Math.round(product.price * (1 - (product.discount || 0) / 100)) : product.price;

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

                            {/* Discount Badge */}
                            {hasDiscount && (
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
