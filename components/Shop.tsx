import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Tag } from 'lucide-react';
import StoreProductModal from './StoreProductModal';

interface ShopProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const Shop: React.FC<ShopProps> = ({ products, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="animate-fade-in pb-20">

      {/* Hero / Banner */}
      <div className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-neutral-950">
        {/* Background Image */}
        <div className="absolute inset-0 select-none">
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2400&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-neutral-950/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-20">
          <h1 className="text-7xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 tracking-tighter leading-[0.8] mb-8 drop-shadow-2xl">
            READY.
          </h1>
          <p className="text-white/90 text-lg md:text-2xl max-w-xl mx-auto mb-12 leading-relaxed font-light drop-shadow-lg">
            Engineered for comfort. Designed for the bold. Experience the next generation of footwear.
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('collection');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold text-xs tracking-[0.2em] uppercase rounded-full transition-all hover:scale-105 hover:bg-violet-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          >
            Shop Collection
          </button>
        </div>
      </div>

      <div id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-12">

        {/* Redesigned Floating Capsule Filter */}
        <div className="flex justify-center mb-16">
          <div className="
            relative z-30
            flex items-center gap-1.5 
            p-2 
            bg-neutral-900/80 backdrop-blur-2xl 
            border border-white/10 
            rounded-full 
            shadow-2xl shadow-black/50
            overflow-x-auto 
            max-w-[95vw] sm:max-w-fit
          "
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                  ${activeCategory === cat
                    ? 'bg-white text-black shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group relative bg-neutral-900/40 rounded-2xl overflow-hidden hover:bg-neutral-900/60 transition-all duration-300 border border-white/5 cursor-pointer flex flex-col h-full"
            >
              {/* Image Area */}
              <div className="aspect-square overflow-hidden bg-neutral-800/50 relative flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    style={{
                      objectPosition: 'center',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto'
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.stock === 0 ? (
                    <span className="px-2 py-0.5 bg-neutral-950/90 text-white text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 rounded">
                      Sold Out
                    </span>
                  ) : product.stock < 15 ? (
                    <span className="px-2 py-0.5 bg-amber-500/90 text-black text-[8px] font-bold uppercase tracking-wider backdrop-blur-md rounded">
                      Low Stock
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Details */}
              <div className="p-3 flex flex-col flex-grow justify-between">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">{product.category}</p>
                </div>

                {/* Price Tag with Discount */}
                <div className="flex flex-col gap-1.5">
                  {product.discount && product.discount > 0 ? (
                    <>
                      {/* Original Price Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Original Price - Crossed Out */}
                        <div className="flex items-center gap-1 opacity-60">
                          <Tag className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-400 line-through">
                            UGX {product.price.toLocaleString()}
                          </span>
                        </div>
                        {/* Discount Badge */}
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
                          {product.discount}% OFF
                        </span>
                      </div>

                      {/* Discounted Price Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-full whitespace-nowrap">
                          <Tag className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-emerald-300 truncate">
                            UGX {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}
                          </span>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className={`p-1.5 rounded-lg transition-all transform hover:scale-105 flex-shrink-0 ${product.stock === 0
                            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                            : 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg hover:shadow-violet-500/25'
                            }`}
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Regular Price (No Discount) */
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 bg-violet-500/20 border border-violet-500/30 px-2 py-1 rounded-full whitespace-nowrap">
                        <Tag className="w-3 h-3 text-violet-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-violet-300 truncate">
                          UGX {product.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className={`p-1.5 rounded-lg transition-all transform hover:scale-105 flex-shrink-0 ${product.stock === 0
                          ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg hover:shadow-violet-500/25'
                          }`}
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <div className="inline-block p-6 rounded-full bg-white/5 mb-6">
              <svg className="w-12 h-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-neutral-500">Try selecting a different category.</p>
          </div>
        )}
      </div>

      <StoreProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default Shop;