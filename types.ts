export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
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

export type ViewState = 'dashboard' | 'inventory';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}