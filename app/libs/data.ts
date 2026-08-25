// ============ MASTER DATA ============

import {
  Cashier,
  Category,
  Discount,
  Order,
  OrderItem,
  Product,
  Shift,
  StockMovement,
  Supplier,
} from "./types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Makanan Ringan",
    slug: "makanan-ringan",
    description: "Aneka makanan ringan dan camilan gurih/manis",
    img: "https://cdn-icons-png.flaticon.com/512/2553/2553642.png",
    is_active: true,
  },
  {
    id: "2",
    name: "Mie Cup",
    slug: "mie-cup",
    description: "Mie instan dalam kemasan cup praktis",
    img: "https://cdn-icons-png.flaticon.com/512/3014/3014534.png",
    is_active: true,
  },
  {
    id: "3",
    name: "Mie Instan",
    slug: "mie-instan",
    description: "Mie instan rebus dan goreng berbagai varian",
    img: "https://cdn-icons-png.flaticon.com/512/599/599502.png",
    is_active: true,
  },
  {
    id: "4",
    name: "Air Mineral",
    slug: "air-mineral",
    description: "Air mineral botol dan galon berbagai ukuran",
    img: "https://cdn-icons-png.flaticon.com/512/3100/3100566.png",
    is_active: true,
  },
];

export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "PT Tirta Investama",
    phone: "02112345678",
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-1",
    supplier_id: "sup-1",
    name: "Galon Le Minerale 5 L",
    barcode: "8992759170570",
    price: 15000,
    cost_price: 12000, // harga beli, untuk laporan margin
    stock: 20,
    min_stock: 5, // alert jika stok di bawah ini
    img_url: "https://le-minerale.com/assets/img/product/le-minerale-5l.png",
    is_active: true,
  },
  {
    id: "prod-2",
    category_id: "cat-1",
    supplier_id: "sup-1",
    name: "Aqua 600 ML",
    barcode: "8992759170571",
    price: 3000,
    cost_price: 2200,
    stock: 50,
    min_stock: 10,
    img_url:
      "https://www.sehataqua.co.id/wp-content/uploads/2021/11/AQUA-600ml.png",
    is_active: true,
  },
];

export const discounts: Discount[] = [
  {
    id: "disc-1",
    name: "Promo Galon 5%",
    type: "percentage",
    value: 5,
    product_id: "prod-1", // null = berlaku untuk semua produk
    min_qty: 1,
    valid_until: "2026-12-31T23:59:59Z",
    is_active: true,
  },
];

// ============ KASIR & SHIFT ============

export const cashiers: Cashier[] = [
  {
    id: "cashier-1",
    name: "Andi",
    pin: "1234", // hashed di implementasi nyata
    role: "kasir",
  },
  {
    id: "cashier-2",
    name: "Budi",
    pin: "5678",
    role: "supervisor",
  },
];

export const shifts: Shift[] = [
  {
    id: "shift-1",
    cashier_id: "cashier-1",
    started_at: "2026-03-24T08:00:00Z",
    ended_at: "2026-03-24T16:00:00Z",
    opening_cash: 500000,
    closing_cash: 1750000,
    total_sales: 1250000,
  },
];

// ============ TRANSAKSI ============

export const orders: Order[] = [
  {
    id: "order-1",
    shift_id: "shift-1",
    cashier_id: "cashier-1",
    status: "paid",
    total_items: 5,
    subtotal: 39000,
    discount_amount: 1500,
    total_price: 37500,
    payment_method: "cash",
    cash_given: 50000,
    change: 12500,
    ordered_at: "2026-03-24T10:00:00Z",
  },
];

export const orderItems: OrderItem[] = [
  {
    id: "item-1",
    order_id: "order-1",
    product_id: "prod-1",
    qty: 2,
    price_item: 15000,
    discount_pct: 5,
    price_total: 28500,
  },
  {
    id: "item-2",
    order_id: "order-1",
    product_id: "prod-2",
    qty: 3,
    price_item: 3000,
    discount_pct: 0,
    price_total: 9000,
  },
];

// ============ MANAJEMEN STOK ============

export const stockMovements: StockMovement[] = [
  {
    id: "mov-1",
    product_id: "prod-1",
    type: "sale",
    qty: -2, // negatif = keluar
    reference_id: "order-1",
    note: "Terjual via kasir",
    created_at: "2026-03-24T10:00:00Z",
  },
  {
    id: "mov-2",
    product_id: "prod-1",
    type: "purchase",
    qty: 10, // positif = masuk
    reference_id: "sup-1",
    note: "Restock dari supplier",
    created_at: "2026-03-24T09:00:00Z",
  },
];
