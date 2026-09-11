export type PaymentMethod = "cash" | "debit" | "qris" | "transfer";
export type OrderStatus = "open" | "paid" | "voided";
export type DiscountType = "percentage" | "fixed";
export type MovementType = "purchase" | "sale" | "adjustment" | "void";

export interface PaginationRequest {
  page?: number;
  size?: number;
  search?: string;
  category_id?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
export interface PaginationResponse {
  page: number;
  size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}
export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  message: string;
  success: boolean;
}
export interface ApiErrorResponse {
  message: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  img?: string;
  img_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategory {
  name: string;
  description?: string;
  slug?: string;
  img?: string;
  img_url?: string;
  is_active?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSupplier {
  name: string;
  code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  notes?: string;
  is_active?: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  supplier_id: string;
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  img_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  data: Product[];
  pagination: PaginationResponse;
}

export interface CreateProduct {
  category_id: string;
  supplier_id: string;
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  img_url: string;
  is_active: boolean;
}

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  product_id: string | null;
  min_qty: number;
  valid_until: string;
  is_active: boolean;
}

export interface Cashier {
  id: string;
  name: string;
  pin: string;
  role: "kasir" | "supervisor" | "owner";
}

export interface Shift {
  id: string;
  cashier_id: string;
  started_at: string;
  ended_at: string | null;
  opening_cash: number;
  closing_cash: number | null;
  total_sales: number;
}

export interface Order {
  id: string;
  shift_id: string;
  cashier_id: string;
  status: OrderStatus;
  total_items: number;
  subtotal: number;
  discount_amount: number;
  total_price: number;
  payment_method: PaymentMethod;
  cash_given: number | null;
  change: number | null;
  ordered_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  price_item: number;
  discount_pct: number;
  price_total: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: MovementType;
  qty: number;
  reference_id: string;
  note: string;
  created_at: string;
}

export interface CreateTransactionRequestItem {
  product_id: string;
  qty: number;
  discount: number;
}

export interface CreateTransactionRequest {
  id: string;
  customer_id: string;
  items: CreateTransactionRequestItem[];
  discount: number;
  tax: number;
  payment_method: PaymentMethod;
  payment_amount: number;
  notes: string;
}

export interface TransactionItemRecord {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  price: number;
  cost_price: number;
  qty: number;
  discount: number;
  subtotal: number;
  created_at?: string;
}

export interface TransactionRecord {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  user_id?: string | number;
  cashier_name?: string | null;
  invoice_number: string;
  total_amount: number;
  discount: number;
  tax: number;
  grand_total: number;
  payment_method: PaymentMethod | string;
  payment_amount: number;
  change_amount: number;
  status: "pending" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  items?: TransactionItemRecord[];
}

export interface TransactionSummaryMetrics {
  total_transactions: number;
  total_revenue: number;
  total_discount: number;
  total_tax: number;
  avg_transaction: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  count: number;
  total: number;
}

export interface TransactionSummaryResponse {
  summary: TransactionSummaryMetrics;
  by_payment_method: PaymentMethodBreakdown[];
}

export interface TransactionQueryParams {
  status?: string;
  payment_method?: string;
  customer_id?: string;
  user_id?: string | number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

