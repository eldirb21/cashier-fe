"use client";

import React, { useEffect, useState } from "react";
import { Headers } from "@/app/components/atoms";
import {
  HiOutlineSearch,
  HiOutlineCamera,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineQrcode,
  HiMinus,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import { Html5QrcodeScanner } from "html5-qrcode";

type ProductProps = {
  id: number;
  label: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  code: string;
};

type CartItem = {
  product: ProductProps;
  qty: number;
};

const initialProducts: ProductProps[] = [
  {
    id: 1,
    label: "ESPRESSO",
    name: "Double Espresso",
    category: "Coffee",
    price: 28000,
    stock: 24,
    code: "8992759170570",
  },
  {
    id: 2,
    label: "OAT LATTE",
    name: "Oat Milk Latte",
    category: "Coffee",
    price: 42000,
    stock: 8,
    code: "8992759170571",
  },
  {
    id: 3,
    label: "CROISSANT",
    name: "Butter Croissant",
    category: "Pastry",
    price: 24500,
    stock: 12,
    code: "8992759170572",
  },
  {
    id: 4,
    label: "COLD BREW",
    name: "Cold Brew",
    category: "Cold drinks",
    price: 35000,
    stock: 17,
    code: "8992759170573",
  },
  {
    id: 5,
    label: "MATCHA",
    name: "Iced Matcha",
    category: "Cold drinks",
    price: 38000,
    stock: 9,
    code: "8992759170574",
  },
  {
    id: 6,
    label: "MUFFIN",
    name: "Banana Muffin",
    category: "Pastry",
    price: 22000,
    stock: 6,
    code: "8992759170575",
  },
  {
    id: 7,
    label: "BEANS",
    name: "House Beans 250g",
    category: "Retail",
    price: 95000,
    stock: 15,
    code: "8992759170576",
  },
  {
    id: 8,
    label: "TEA",
    name: "Peach Tea",
    category: "Cold drinks",
    price: 30000,
    stock: 21,
    code: "8992759170577",
  },
];

const categories = [
  "All products",
  "Coffee",
  "Pastry",
  "Cold drinks",
  "Retail",
];

const formatRupiah = (amount: number): string => {
  return "Rp " + amount.toLocaleString("id-ID");
};

const Transactions = () => {
  const [selectedCategory, setSelectedCategory] = useState("All products");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "QRIS">(
    "Cash",
  );
  const [discountAmount, setDiscountAmount] = useState(7000);

  // Initial cart set up to match the screenshot exactly (Double Espresso, Oat Milk Latte, Butter Croissant)
  const [cart, setCart] = useState<CartItem[]>([
    { product: initialProducts[0], qty: 1 },
    { product: initialProducts[1], qty: 1 },
    { product: initialProducts[2], qty: 1 },
  ]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById("reader");
        if (element) {
          scanner = new Html5QrcodeScanner(
            "reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              useBarCodeDetectorIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 10,
            },
            false,
          );

          scanner.render(
            (decodedText) => {
              setSearchQuery(decodedText);
              handleScannedProduct(decodedText);
              setIsScanning(false);
              scanner?.clear();
            },
            (error) => {
              /* ignore error */
            },
          );
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scanner) {
          scanner
            .clear()
            .catch((err) => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [isScanning]);

  const handleScannedProduct = (code: string) => {
    const found = initialProducts.find((p) => p.code === code);
    if (found) {
      addToCart(found);
    }
  };

  const addToCart = (product: ProductProps) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += 1;
        return updated;
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.product.id === productId) {
              const newQty = item.qty + delta;
              return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const filteredProducts = initialProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === "All products" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const tax = 0;
  const total = Math.max(0, subtotal - discountAmount + tax);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col font-sans">
      <Headers />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* ── LEFT SIDE: PRODUCTS & FILTERS ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <HiOutlineSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search product, SKU, or scan barcode"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block bg-gray-50 border border-gray-200 text-gray-400 text-[11px] font-mono px-2 py-0.5 rounded-md">
                F2
              </span>
              <button
                onClick={() => setIsScanning(true)}
                title="Scan Barcode"
                className="p-1.5 text-gray-400 hover:text-[#065f46] hover:bg-emerald-50 rounded-lg transition-all"
              >
                <HiOutlineQrcode size={20} />
              </button>
            </div>
          </div>

          {/* Barcode Scanner Modal */}
          {isScanning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-800">
                    Scan Barcode / QR
                  </h3>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                  >
                    <HiOutlineX size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <div
                    id="reader"
                    className="w-full overflow-hidden rounded-xl"
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#065f46] text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/70"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-3 shadow-2xs border border-gray-200/70 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Image / Label Container */}
                <div className="bg-[#e0f2fe]/80 h-28 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#d0eaec] transition-colors">
                  <span className="text-[#065f46] font-black text-xs tracking-widest uppercase">
                    {product.label}
                  </span>
                </div>

                {/* Info Container */}
                <div>
                  <div className="flex justify-between items-baseline gap-1">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#065f46] transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0">
                      {product.stock} left
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 mt-1">
                    {formatRupiah(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT SIDE: CURRENT SALE PANEL ── */}
        <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200/80 flex flex-col justify-between h-full min-h-[560px]">
            <div>
              {/* Header */}
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Current sale
              </h2>

              {/* Customer Row */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-5 border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">
                  Walk-in customer
                </span>
                <button className="text-xs font-bold text-gray-900 hover:text-[#065f46] transition-colors">
                  + Add customer
                </button>
              </div>

              {/* Order Items List */}
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No items in cart
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Qty Badge Box */}
                        <div className="bg-[#e0f2fe] text-[#0284c7] font-bold text-xs w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                          {item.qty}
                        </div>
                        {/* Details */}
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {formatRupiah(item.product.price)}
                          </p>
                        </div>
                      </div>

                      {/* Line Item Total & Qty controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {formatRupiah(item.product.price * item.qty)}
                        </span>
                        <div className="hidden group-hover:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            className="p-1 hover:text-red-600"
                          >
                            <HiMinus size={12} />
                          </button>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            className="p-1 hover:text-emerald-700"
                          >
                            <HiPlus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Calculation & Checkout Section */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Member discount</span>
                  <span className="font-bold text-gray-900">
                    – {formatRupiah(discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tax included</span>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(tax)}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-lg font-extrabold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-extrabold text-gray-900">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(["Cash", "Card", "QRIS"] as const).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#e0f2fe] border-2 border-[#065f46] text-[#065f46]"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>

              {/* Charge Button */}
              <button
                disabled={cart.length === 0}
                className="w-full bg-[#065f46] hover:bg-[#044e39] disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                Charge {formatRupiah(total)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
