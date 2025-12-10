export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  targetAudience?: 'Men' | 'Women' | 'Kids' | 'Unisex';
  images?: string[];
  sizes?: string[];
  colors?: string[];
  discount?: number; // Discount percentage (0-100)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SalesData {
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export type ViewState = 'dashboard' | 'inventory' | 'discounts';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger';
  };
  dismiss?: {
    label: string;
    onClick: () => void;
  };
}