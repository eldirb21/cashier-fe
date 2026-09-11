// ============ MASTER DATA ============

import {
  Cashier,
  Category,
  Customer,
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

export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "Budi Santoso",
    phone: "081298765401",
    email: "budi.santoso@gmail.com",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    gender: "male",
    birth_date: "1990-05-14",
    member_code: "MBR-BUDI-001",
    member_level: "gold",
    points: 620,
    total_spending: 6200000,
    is_active: true,
    joined_at: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "CUST-002",
    name: "Siti Nurhaliza",
    phone: "081298765402",
    email: "siti.nurhaliza@yahoo.com",
    address: "Jl. Melati No. 12, Tebet, Jakarta Selatan",
    gender: "female",
    birth_date: "1994-08-22",
    member_code: "MBR-SITI-002",
    member_level: "silver",
    points: 280,
    total_spending: 2800000,
    is_active: true,
    joined_at: "2026-06-15T14:30:00.000Z",
  },
  {
    id: "CUST-003",
    name: "Hendra Gunawan",
    phone: "081298765403",
    email: "hendra.gunawan@gmail.com",
    address: "Jl. Kelapa Gading Boulevard Blok LC-6",
    gender: "male",
    birth_date: "1988-12-03",
    member_code: "MBR-HNDR-003",
    member_level: "platinum",
    points: 1250,
    total_spending: 12500000,
    is_active: true,
    joined_at: "2026-03-20T09:15:00.000Z",
  },
  {
    id: "CUST-004",
    name: "Dewi Anggraini",
    phone: "081298765404",
    email: "dewi.anggraini@outlook.com",
    address: "Jl. Fatmawati Raya No. 88, Cilandak",
    gender: "female",
    birth_date: "1996-03-19",
    member_code: "MBR-DEWI-004",
    member_level: "regular",
    points: 95,
    total_spending: 950000,
    is_active: true,
    joined_at: "2026-07-02T11:45:00.000Z",
  },
  {
    id: "CUST-005",
    name: "Ahmad Fauzi",
    phone: "081298765405",
    email: "ahmad.fauzi@gmail.com",
    address: "Jl. Kemang Raya No. 17, Bangka",
    gender: "male",
    birth_date: "1992-11-28",
    member_code: "MBR-FAUZ-005",
    member_level: "silver",
    points: 340,
    total_spending: 3400000,
    is_active: true,
    joined_at: "2026-04-18T16:20:00.000Z",
  },
  {
    id: "CUST-006",
    name: "Rina Wijayanti",
    phone: "081298765406",
    email: "rina.wijayanti@gmail.com",
    address: "Jl. Bintaro Utama Sektor 3A, Tangerang",
    gender: "female",
    birth_date: "1995-09-08",
    member_code: "MBR-RINA-006",
    member_level: "gold",
    points: 780,
    total_spending: 7800000,
    is_active: true,
    joined_at: "2026-02-14T08:00:00.000Z",
  },
  {
    id: "CUST-007",
    name: "Dimas Pratama",
    phone: "081298765407",
    email: "dimas.pratama@gmail.com",
    address: "Jl. Boulevard Barat Raya Blok LA-1",
    gender: "male",
    birth_date: "1998-01-15",
    member_code: "MBR-DIMS-007",
    member_level: "regular",
    points: 45,
    total_spending: 450000,
    is_active: false,
    joined_at: "2026-08-01T10:00:00.000Z",
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
