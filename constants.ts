import { Product, SalesData, CategoryData } from './types';



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