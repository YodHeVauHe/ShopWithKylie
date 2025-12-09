import React, { useState } from 'react';
import { Product } from '../types';

interface StoreProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

const StoreProductModal: React.FC<StoreProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    // Reset state when product changes
    React.useEffect(() => {
        if (product) {
            setSelectedImage(product.image);
            if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
            if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    return (
        <div className="fixed inset-0 z-[70] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom glass-panel rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-white/10">

                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                        {/* Left Column: Images */}
                        <div className="bg-neutral-900/50 p-3 md:p-4 flex flex-col gap-3">
                            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 relative group">
                                <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                    <img
                                        src={selectedImage || product.image}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                        style={{ objectPosition: 'center' }}
                                    />
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`
                        relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                        ${selectedImage === img ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-transparent opacity-70 hover:opacity-100'}
                      `}
                                        >
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                                <img 
                                                    src={img} 
                                                    alt={`View ${idx + 1}`} 
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{ objectPosition: 'center' }}
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Details */}
                        <div className="p-2 md:p-3 flex flex-col">
                            <div className="mb-1">
                                <span className="text-violet-400 text-sm font-bold uppercase tracking-wider">{product.category}</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{product.name}</h2>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 px-3 py-1.5 rounded-full">
                                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="text-sm font-bold text-violet-300">
                                        UGX {product.price.toLocaleString()}
                                    </span>
                                </div>
                                {product.stock < 15 && product.stock > 0 && (
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                                        Low Stock: {product.stock} left
                                    </span>
                                )}
                                {product.stock === 0 && (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-full border border-red-500/20">
                                        Sold Out
                                    </span>
                                )}
                            </div>

                            <div className="prose prose-invert prose-sm mb-8 text-neutral-400 leading-relaxed">
                                <p>{product.description}</p>
                            </div>

                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Select Size</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.sizes.map((size, index) => (
                                            <button
                                                key={`size-${index}-${size}`}
                                                onClick={() => setSelectedSize(size)}
                                                className={`
                          min-w-[2rem] h-8 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center
                          ${selectedSize === size
                                                        ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                                        : 'bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                                                    }
                        `}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Select Color</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.colors.map((color, index) => (
                                            <button
                                                key={`color-${index}-${color}`}
                                                onClick={() => setSelectedColor(color)}
                                                className={`
                          px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all
                          ${selectedColor === color
                                                        ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                                        : 'bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                                                    }
                        `}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        // You might want to pass selected size/color to cart here
                                        onAddToCart({ ...product, description: `${product.description} [Size: ${selectedSize}, Color: ${selectedColor}]` });
                                        onClose();
                                    }}
                                    disabled={product.stock === 0}
                                    className={`
                    w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all
                    ${product.stock === 0
                                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                            : 'bg-white text-black hover:bg-violet-50 hover:scale-[1.02] shadow-lg hover:shadow-white/20'
                                        }
                  `}
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreProductModal;
