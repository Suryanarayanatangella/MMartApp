// ─────────────────────────────────────────────
// Core domain types matching your Prisma schema
// and API response shapes
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  image?: string | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  productId: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  userId: string;
  product: Product;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId?: string | null;
  product?: Product | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingPhone: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

// ─────────────────────────────────────────────
// API response wrappers
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface CartResponse {
  success: boolean;
  cartItems: CartItem[];
  total: number;
  itemCount: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─────────────────────────────────────────────
// Redux state shapes
// ─────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────
// UI / Component prop types
// ─────────────────────────────────────────────

export interface AISuggestion {
  productId: string;
  reason: string;
  product: Product;
}

export interface BundleSuggestion {
  productIds: string[];
  bundleName: string;
  reason: string;
  estimatedDiscount: number;
  products: Product[];
  bundlePrice: number;
  totalPrice: number;
  discountAmount: number;
  savingsPercent: number;
}

export interface CartAISuggestionsData {
  upsellSuggestions: AISuggestion[];
  bundleSuggestions: BundleSuggestion[];
}

export interface AISearchResult {
  success: boolean;
  products: Product[];
  intent: string;
  filters: {
    keywords: string;
    category: string;
    maxPrice: number | null;
    minPrice: number | null;
  };
  total: number;
}
