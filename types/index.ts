// ============================================
//   TopinStock Marketplace — Global Types
//   All user-facing labels are in Romanian
// ============================================

// ── Enums (mirrored from Prisma schema) ─────────────────────────────────────

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ProductStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'OUT_OF_STOCK'
  | 'ARCHIVED';

// ── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  sellerProfile?: SellerProfile;
}

// ── Seller ───────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  positiveRating: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;       // e.g. "Electronice"
  slug: string;
  icon: string | null; // emoji or icon key
  parentId: string | null;
  children?: Category[];
}

// ── Product (placeholder — full schema in Step 2) ────────────────────────────

export interface Product {
  id: string;
  name: string;         // Denumire produs
  slug: string;
  description: string;
  price: number;        // Preț curent (Lei)
  originalPrice?: number; // Preț înainte de reducere
  images: string[];
  status: ProductStatus;
  stock: number;
  sellerId: string;
  seller?: SellerProfile;
  categoryId: string;
  category?: Category;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  sellerId: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
  badge?: number;
}

// ── API Response Wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Dashboard Metrics (Seller) ────────────────────────────────────────────────

export interface SellerMetrics {
  activeListings: number;
  pendingOrders: number;
  totalSalesMonth: number; // Lei
  activeReturns: number;
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Romanian label for order status */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:    'În așteptare',
  PROCESSING: 'Se procesează',
  SHIPPED:    'Expediat',
  DELIVERED:  'Livrat',
  CANCELLED:  'Anulat',
  RETURNED:   'Returnat',
};

/** Romanian label for product status */
export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT:        'Ciornă',
  ACTIVE:       'Activ',
  PAUSED:       'Pauzat',
  OUT_OF_STOCK: 'Stoc epuizat',
  ARCHIVED:     'Arhivat',
};
