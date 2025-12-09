import { Product, SalesData, CategoryData } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Air Strider X1',
    category: 'Running',
    price: 129.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    description: 'Experience lightweight agility with the Air Strider X1. Designed for the modern runner, it features breathable mesh and responsive cushioning for miles of comfort.',
    status: 'In Stock',
  },
  {
    id: '2',
    name: 'Urban Glide Lo',
    category: 'Casual',
    price: 89.50,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
    description: 'The Urban Glide Lo blends minimalist design with maximum comfort. Perfect for city walks, its sleek profile and durable sole make it an everyday essential.',
    status: 'Low Stock',
  },
  {
    id: '3',
    name: 'Court Master Pro',
    category: 'Basketball',
    price: 159.00,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=1000&auto=format&fit=crop',
    description: 'Dominate the paint with the Court Master Pro. High-top support meets explosive energy return, ensuring you stay ahead of the competition on every play.',
    status: 'In Stock',
  },
  {
    id: '4',
    name: 'Summit Trekker',
    category: 'Hiking',
    price: 145.00,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=1000&auto=format&fit=crop',
    description: 'Conquer any trail with the Summit Trekker. Waterproof, rugged, and reliable, these boots provide superior grip and ankle support for your wildest adventures.',
    status: 'Low Stock',
  },
  {
    id: '5',
    name: 'Velvet Slip-On',
    category: 'Formal',
    price: 110.00,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1614252235316-06960d1173a5?q=80&w=1000&auto=format&fit=crop',
    description: 'Elegance meets ease in the Velvet Slip-On. Crafted from premium materials, this shoe adds a touch of sophistication to any formal ensemble without sacrificing comfort.',
    status: 'Out of Stock',
  },
  {
    id: '6',
    name: 'Retro Runner 90',
    category: 'Running',
    price: 95.00,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop',
    description: 'Step back in time with modern tech. The Retro Runner 90 combines vintage aesthetics with contemporary foam technology for a stylish, cloud-like ride.',
    status: 'In Stock',
  },
];

export const SALES_DATA: SalesData[] = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

export const CATEGORY_DATA: CategoryData[] = [
  { name: 'Running', value: 400, color: '#4f46e5' }, // Indigo-600
  { name: 'Casual', value: 300, color: '#0ea5e9' }, // Sky-500
  { name: 'Basketball', value: 300, color: '#8b5cf6' }, // Violet-500
  { name: 'Hiking', value: 200, color: '#10b981' }, // Emerald-500
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'inventory', label: 'Inventory', icon: 'M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM9 4h6v3H9V4zm0 6h6v2H9v-2z' },
];