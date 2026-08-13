"use client";

import { PaymentModal } from "./paymentModal";
import React, { useState } from "react";
import { HiOutlineCube } from "react-icons/hi";
import { HiMinus, HiPlus, HiReceiptPercent } from "react-icons/hi2";
import { ReceiptModal } from "./receiptModal";

// ── helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// ── types ─────────────────────────────────────────────────────────────────────

interface OrderItemData {
  id: string;
  product_id: string;
  name: string;
  img_url?: string;
  qty: number;
  price_item: number;
  discount_pct: number;
  price_total: number;
}

// ── mock data (ganti dengan data asli) ───────────────────────────────────────

const initialItems: OrderItemData[] = [
  {
    id: "item-1",
    product_id: "prod-1",
    name: "Galon Le Minerale 5 L",
    qty: 2,
    price_item: 15000,
    discount_pct: 5,
    price_total: 28500,
  },
  {
    id: "item-2",
    product_id: "prod-2",
    name: "Aqua 600 ML",
    qty: 3,
    price_item: 3000,
    discount_pct: 0,
    price_total: 9000,
  },
];

function ItemRow({
  item,
  onQtyChange,
}: {
  item: OrderItemData;
  onQtyChange: (id: string, delta: number) => void;
}) {
  const subtotal = item.price_item * item.qty;
  const discountAmt = subtotal - item.price_total;

  return (
    <div className="group flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/40 border border-gray-100 hover:border-blue-100 transition-all duration-200">
      {/* icon */}
      <div className="shrink-0 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-400 mt-0.5">
        <HiOutlineCube size={20} />
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {item.name}
        </p>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">
            {formatRupiah(item.price_item)} / pcs
          </span>
          {item.discount_pct > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              <HiReceiptPercent size={10} />
              {item.discount_pct}% off
            </span>
          )}
        </div>

        {/* discount breakdown */}
        {item.discount_pct > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-gray-400 line-through">
              {formatRupiah(subtotal)}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">
              −{formatRupiah(discountAmt)}
            </span>
          </div>
        )}
      </div>

      {/* qty + total */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="text-sm font-bold text-gray-900">
          {formatRupiah(item.price_total)}
        </span>

        {/* qty control */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-1.5 py-1">
          <button
            onClick={() => onQtyChange(item.id, -1)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <HiMinus size={12} />
          </button>
          <span className="text-xs font-bold text-gray-700 min-w-[20px] text-center">
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item.id, 1)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <HiPlus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
interface OrderSummary {
  subtotal: number;
  discount_amount: number;
  grand_total: number;
  total_items: number;
}
interface OrderItemReceipt {
  name: string;
  qty: number;
  price_item: number;
  discount_pct: number;
  price_total: number;
}
interface ReceiptData {
  store_name: string;
  store_address: string;
  store_phone: string;
  cashier_name: string;
  shift: string;
  transaction_id: string;
  ordered_at: Date;
  items: OrderItemReceipt[];
  subtotal: number;
  discount_item: number;
  discount_extra: number;
  grand_total: number;
  payment_method: "cash" | "transfer" | "member";
  cash_given?: number;
  change?: number;
  member_name?: string;
  points_used?: number;
  transfer_ref?: string;
}
const DEMO_DATA: ReceiptData = {
  store_name: "TOKO MAKMUR JAYA",
  store_address: "Jl. Sudirman No. 10, Jakarta",
  store_phone: "021-12345678",
  cashier_name: "Andi",
  shift: "Pagi (08.00–16.00)",
  transaction_id: "TRX-20260324-001",
  ordered_at: new Date(),
  items: [
    {
      name: "Galon Le Minerale 5 L",
      qty: 2,
      price_item: 15000,
      discount_pct: 5,
      price_total: 28500,
    },
    {
      name: "Aqua 600 ML",
      qty: 3,
      price_item: 3000,
      discount_pct: 0,
      price_total: 9000,
    },
  ],
  subtotal: 39000,
  discount_item: 1500,
  discount_extra: 0,
  grand_total: 37500,
  payment_method: "cash",
  cash_given: 50000,
  change: 12500,
};
export function OrderItem() {
  const [items, setItems] = useState<OrderItemData[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);

  const order: OrderSummary = {
    subtotal: 39000,
    discount_amount: 1500,
    grand_total: 37500,
    total_items: 5,
  };
  const handleQtyChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, item.qty + delta);
          const subtotal = item.price_item * newQty;
          const discountAmt = subtotal * (item.discount_pct / 100);
          return {
            ...item,
            qty: newQty,
            price_total: Math.round(subtotal - discountAmt),
          };
        })
        .filter((item) => item.qty > 0),
    );
  };

  // summary calculations
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price_item * i.qty, 0);
  const totalDiscount = items.reduce(
    (s, i) => s + (i.price_item * i.qty * i.discount_pct) / 100,
    0,
  );
  const grandTotal = subtotal - totalDiscount;
  const canPay = items.length > 0;

  return (
    <div className="w-full lg:w-96 space-y-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col">
        {/* header */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">
            Order Items
          </h2>
          {totalItems > 0 && (
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full">
              {totalItems} item
            </span>
          )}
        </div>

        {/* list */}
        <div className="flex-1 p-3 space-y-2 min-h-40">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm italic py-10">
              Belum ada item
            </div>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onQtyChange={handleQtyChange}
              />
            ))
          )}
        </div>

        {/* summary */}
        <div className="px-5 pt-4 pb-5 border-t border-gray-100 space-y-5 bg-gray-50/50">
          {/* breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                Subtotal ({totalItems} item)
              </span>
              <span className="text-xs font-medium text-gray-600">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <HiReceiptPercent size={12} className="text-emerald-400" />
                Total diskon
              </span>
              <span className="text-xs font-semibold text-emerald-500">
                {totalDiscount > 0
                  ? `−${formatRupiah(totalDiscount)}`
                  : formatRupiah(0)}
              </span>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-base font-extrabold text-gray-900">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* pay button */}
          <button
            disabled={!canPay}
            onClick={() => setOpen(true)}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
              canPay
                ? "bg-[#ff9a72] hover:bg-[#ff8559] active:scale-[0.98] text-white shadow-sm shadow-orange-200 cursor-pointer"
                : "bg-[#ffc3a0] text-white cursor-not-allowed opacity-60"
            }`}
          >
            {canPay ? `Bayar ${formatRupiah(grandTotal)}` : "Tambah item dulu"}
          </button>
        </div>
      </div>
      <PaymentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        order={order}
        onPay={(result) => {
          console.log("Payment result:", result);
          setOpen(false);
        }}
        onPrint={() => setOpenReceipt(true)}
      />

      <ReceiptModal
        isOpen={openReceipt}
        onClose={() => setOpenReceipt(false)}
        data={DEMO_DATA}
      />
    </div>
  );
}
