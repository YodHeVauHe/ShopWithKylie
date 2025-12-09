import React, { useState } from 'react';
import { Product } from '../types';

interface ShopProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const Shop: React.FC<ShopProps> = ({ products, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
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
            className="group relative inline-flex items-center justify-center px-12 py-5 bg-white text-black font-bold text-sm tracking-[0.2em] uppercase rounded-full transition-all hover:scale-105 hover:bg-violet-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          >
            Shop Collection
          </button>
        </div>
      </div>

      <div id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24">
        
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
                  relative
                  px-6 py-2.5 
                  rounded-full 
                  text-xs font-bold uppercase tracking-widest 
                  whitespace-nowrap 
                  transition-all duration-300 ease-out
                  ${activeCategory === cat
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="group relative bg-neutral-900/40 rounded-3xl overflow-hidden hover:bg-neutral-900/60 transition-colors duration-300 border border-white/5"
            >
              {/* Image Area */}
              <div className="aspect-[4/5] overflow-hidden bg-neutral-800/50 relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   {product.stock === 0 ? (
                    <span className="px-3 py-1 bg-neutral-950/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                      Sold Out
                    </span>
                   ) : product.stock < 15 ? (
                    <span className="px-3 py-1 bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      Low Stock
                    </span>
                   ) : null}
                </div>

                {/* Quick Add Button */}
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    disabled={product.stock === 0}
                    className={`absolute bottom-4 right-4 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 transform translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 ${
                      product.stock === 0
                        ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-violet-400 hover:text-white shadow-xl'
                    }`}
                    title="Add to Cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">
                    ${product.price.toFixed(2)}
                  </span>
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
    </div>
  );
};

export default Shop;