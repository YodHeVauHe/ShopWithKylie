import React, { useState } from 'react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Inventory</h2>
          <p className="text-neutral-400 mt-1">Manage stock levels and product details.</p>
        </div>
        <button
          onClick={onAddProduct}
          className="group inline-flex items-center px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-all shadow-lg shadow-white/5"
        >
          <svg className="w-4 h-4 mr-2 text-neutral-600 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters and Search - Styled to match Shop */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative md:max-w-md">
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

        {/* Category Tabs inside Filter Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar md:border-l md:border-white/10 md:pl-2">
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
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-neutral-800 border border-white/10">
                        <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-white">{product.name}</div>
                        <div className="text-xs text-neutral-500 truncate max-w-[200px] mt-0.5">{product.description.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300 border border-white/5">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300 font-mono">
                    UGX {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                    <span className={`${product.stock < 15 ? 'text-amber-400 font-bold' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="text-violet-400 hover:text-violet-300 mr-4 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      No products found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let classes = "";
  switch (status) {
    case 'In Stock': classes = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; break;
    case 'Low Stock': classes = 'bg-amber-500/10 text-amber-400 border-amber-500/20'; break;
    case 'Out of Stock': classes = 'bg-rose-500/10 text-rose-400 border-rose-500/20'; break;
    default: classes = 'bg-neutral-800 text-neutral-400';
  }
  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-lg border ${classes}`}>
      {status}
    </span>
  );
};

export default Inventory;