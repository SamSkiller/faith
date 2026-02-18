
export type Category = 'Popular' | 'Hot' | 'Women' | 'Men' | 'Accessories' | 'Hot Deals' | 'All';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  isHot?: boolean;
  isNew?: boolean;
  stock: number;
  soldCount?: number; // For analytics
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer';
  joinedAt: string;
  profilePic?: string;
  faithPoints: number;
  phoneNumber?: string;
  address?: string;
  isRevoked?: boolean;
  wishlist: string[];
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: CartItem[];
  total: number;
  shippingMethod: string;
  shippingCost: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'M-Pesa';
  date: string;
  phoneNumber: string;
}
