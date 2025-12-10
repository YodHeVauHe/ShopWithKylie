import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { supabase } from '../services/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct: Product | null;
}

const CustomSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-2.5 px-3 text-left text-white focus:outline-none focus:border-violet-500 flex justify-between items-center transition-colors hover:bg-neutral-800/50"
      >
        <span className="truncate text-sm">{value}</span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-auto py-1 custom-scrollbar">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${value === opt ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomNumberInput = ({ value, onChange, min = 0, step = 1 }: { value: number, onChange: (val: number) => void, min?: number, step?: number }) => {
  const handleIncrement = () => onChange(Number(value) + step);
  const handleDecrement = () => onChange(Math.max(min, Number(value) - step));

  return (
    <div className="flex items-center bg-neutral-900/50 border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={handleDecrement}
        className="px-3 py-2.5 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors border-r border-white/5"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-center text-white focus:outline-none py-2.5 appearance-none text-sm font-medium"
        style={{ MozAppearance: 'textfield' }}
      />
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
      <button
        type="button"
        onClick={handleIncrement}
        className="px-3 py-2.5 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors border-l border-white/5"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialProduct }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Running',
    price: 0,
    stock: 0,
    description: '',
    image: '',
    images: [],
    sizes: [],
    colors: [],
    targetAudience: 'Unisex',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
      setSelectedFiles([]); // Clear selected files when editing
    } else {
      // Reset for new product
      setFormData({
        name: '',
        category: 'Running',
        price: 0,
        stock: 0,
        description: '',
        image: '',
        images: [],
        sizes: [],
        colors: [],
        targetAudience: 'Unisex',
      });
      setSelectedFiles([]); // Clear selected files for new product
    }
  }, [initialProduct, isOpen]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for immediate display
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...previewUrls]
    }));
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      
      // Also remove from selected files if it's a preview URL
      const removedImage = prev.images?.[index];
      if (removedImage && removedImage.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage); // Clean up blob URL
      }
      
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : ''
      };
    });
    
    // Also remove from selected files array
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sizes' | 'colors') => {
    const values = e.target.value.split(',').map(v => v.trim()).filter(v => v !== '');
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length > 0) {
      setUploading(true);
      try {
        
        // First check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          throw bucketError;
        }
        
        const productImagesBucket = buckets?.find(b => b.name === 'product-images');
        if (!productImagesBucket) {
          throw new Error('product-images bucket does not exist. Please create it in Supabase dashboard.');
        }
        
        // Upload all selected files
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);
            
          if (uploadError) {
            throw uploadError;
          }
          
          
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
            
          return publicUrl;
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Update form data with uploaded URLs
        setFormData(prev => ({
          ...prev,
          images: uploadedUrls,
          image: uploadedUrls[0] || prev.image
        }));
        
        // Clear selected files after successful upload
        setSelectedFiles([]);
        
        // Continue with form submission after upload
        await submitForm(uploadedUrls);
        
      } catch (error) {
        alert('Error uploading images: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setUploading(false);
      }
    } else {
      // No files to upload, submit form directly
      await submitForm(formData.images || []);
    }
  };
  
  const submitForm = async (imageUrls: string[]) => {
    // Determine status
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if ((formData.stock || 0) === 0) status = 'Out of Stock';
    else if ((formData.stock || 0) < 15) status = 'Low Stock';

    const productToSave: Product = {
      id: initialProduct ? initialProduct.id : '', // Let DB handle ID for new, or App.tsx
      name: formData.name || 'Untitled Product',
      category: formData.category || 'General',
      price: formData.price || 0,
      stock: formData.stock || 0,
      image: imageUrls[0] || '',
      images: imageUrls,
      sizes: formData.sizes || [],
      colors: formData.colors || [],
      description: formData.description || '',
      status,
      targetAudience: formData.targetAudience || 'Unisex'
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

        <div className="inline-block align-bottom glass-panel rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-white/10">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-4 pb-4 sm:p-6">
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

                {/* Image Gallery */}
                <div className="sm:col-span-2 mb-4">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Product Images</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {formData.images && formData.images.length > 0 ? (
                      formData.images.map((img, index) => (
                        <div key={index} className="relative group aspect-square bg-neutral-900/50 rounded-xl border border-white/10 overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover" 
                            onLoad={() => {}}
                            onError={() => {}}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-bold uppercase">Main</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-neutral-500 text-sm py-4">
                        No images uploaded yet
                      </div>
                    )}
                    <div
                      onClick={handleImageClick}
                      className="aspect-square cursor-pointer bg-neutral-900/50 rounded-xl border border-white/10 border-dashed flex flex-col items-center justify-center hover:bg-neutral-800/50 transition-colors"
                    >
                      <svg className="h-6 w-6 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{uploading ? '...' : 'Add'}</span>
                    </div>
                  </div>
                                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
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
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 transition-all text-sm"
                    placeholder="e.g. Air Strider X1"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Category</label>
                  <CustomSelect
                    value={formData.category || 'Running'}
                    onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                    options={['Running', 'Casual', 'Basketball', 'Hiking', 'Formal']}
                  />
                </div>

                <div>
                  <label htmlFor="targetAudience" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Target Audience</label>
                  <CustomSelect
                    value={formData.targetAudience || 'Unisex'}
                    onChange={(val) => setFormData(prev => ({ ...prev, targetAudience: val as any }))}
                    options={['Men', 'Women', 'Kids', 'Unisex']}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Price (UGX)</label>
                  <CustomNumberInput
                    value={formData.price || 0}
                    onChange={(val) => setFormData(prev => ({ ...prev, price: val }))}
                    min={0}
                    step={100}
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Stock Quantity</label>
                  <CustomNumberInput
                    value={formData.stock || 0}
                    onChange={(val) => setFormData(prev => ({ ...prev, stock: val }))}
                    min={0}
                    step={1}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="sizes" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Sizes (comma separated)</label>
                  <input
                    type="text"
                    id="sizes"
                    placeholder="e.g. 38, 39, 40, 41, 42"
                    defaultValue={formData.sizes?.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'sizes')}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="colors" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Colors (comma separated)</label>
                  <input
                    type="text"
                    id="colors"
                    placeholder="e.g. Red, Blue, Black"
                    defaultValue={formData.colors?.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'colors')}
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 text-sm"
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
                    className="block w-full bg-neutral-900/50 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-neutral-600 text-sm leading-relaxed resize-none"
                    placeholder="Enter product description..."
                  ></textarea>
                </div>

              </div>
            </div>
            <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-2.5 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wide hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Save Product'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-white/10 px-2.5 py-1.5 bg-transparent text-white text-[10px] font-bold uppercase tracking-wide hover:bg-white/5 focus:outline-none transition-colors"
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