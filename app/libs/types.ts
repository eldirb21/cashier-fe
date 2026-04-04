export type PaymentMethod = "cash" | "debit" | "qris" | "transfer";
export type OrderStatus = "open" | "paid" | "voided";
export type DiscountType = "percentage" | "fixed";
export type MovementType = "purchase" | "sale" | "adjustment" | "void";

export interface Category {
  id: string;
  name: string;
  description: string;
  img: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
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
  min_stock: number;5
  
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
