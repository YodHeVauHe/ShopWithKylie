import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialProduct }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Running',
    price: 0,
    stock: 0,
    description: '',
    image: '',
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
    } else {
      // Reset for new product
      setFormData({
        name: '',
        category: 'Running',
        price: 0,
        stock: 0,
        description: '',
        image: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/500`,
      });
    }
  }, [initialProduct, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine status
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if ((formData.stock || 0) === 0) status = 'Out of Stock';
    else if ((formData.stock || 0) < 15) status = 'Low Stock';

    const productToSave: Product = {
      id: initialProduct ? initialProduct.id : Date.now().toString(),
      name: formData.name || 'Untitled Product',
      category: formData.category || 'General',
      price: formData.price || 0,
      stock: formData.stock || 0,
      image: formData.image || 'https://picsum.photos/200',
      description: formData.description || '',
      status
    };

    onSave(productToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom glass-panel rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/10">
          <form onSubmit={handleSubmit}>
            <div className="px-6 pt-6 pb-6 sm:p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {initialProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-sm text-neutral-400">Manage product details and inventory.</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Image Preview */}
                <div className="sm:col-span-2 flex justify-center mb-4">
                  <div className="relative group w-32 h-32 sm:w-40 sm:h-40">
                    <img 
                      src={formData.image} 
                      alt="Product Preview" 
                      className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-2xl cursor-pointer backdrop-blur-[2px]">
                      <span className="text-white font-medium text-xs uppercase tracking-wider">Change</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 transition-all"
                    placeholder="e.g. Air Strider X1"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white cursor-pointer"
                  >
                    <option className="bg-neutral-900">Running</option>
                    <option className="bg-neutral-900">Casual</option>
                    <option className="bg-neutral-900">Basketball</option>
                    <option className="bg-neutral-900">Hiking</option>
                    <option className="bg-neutral-900">Formal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600"
                  />
                </div>

                <div className="sm:col-span-2">
                   <label htmlFor="description" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                   <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 text-sm leading-relaxed resize-none"
                    placeholder="Enter product description..."
                  ></textarea>
                </div>

              </div>
            </div>
            <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wide hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Save Product
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-white/10 px-6 py-3 bg-transparent text-white text-sm font-bold uppercase tracking-wide hover:bg-white/5 focus:outline-none transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;