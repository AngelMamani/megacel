export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  items: number;
  orderItems?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: 'online' | 'store';
  orderNumber?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}
