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

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_details: {
    address: string;
    city: string;
    zip_code: string;
    country: string;
    phone?: string;
  };
  tracking_number?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  description?: string;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  created_by: string;
  minimum_amount?: number;
  applicable_products?: string[]; // Product IDs the code can be applied to
  applicable_categories?: string[]; // Categories the code can be applied to
}