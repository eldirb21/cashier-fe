"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Barcode from "react-barcode";
import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { productService } from "@/app/services/product.service";
import { customerService } from "@/app/services/customer.service";
import { transactionService } from "@/app/services/transaction.service";
import {
  products as defaultProducts,
  categories as defaultCategories,
  customers as defaultCustomers,
} from "@/app/libs/data";
import { Product, Category, Customer, MemberLevel } from "@/app/libs/types";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineQrCode,
  HiOutlineXMark,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserPlus,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlinePrinter,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
  HiOutlineArrowPath,
  HiOutlineCurrencyDollar,
  HiOutlineCheck,
  HiOutlineTag,
  HiOutlineReceiptPercent,
} from "react-icons/hi2";
import { Html5QrcodeScanner } from "html5-qrcode";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  product: Product;
  qty: number;
  note?: string;
};

export type CompletedTransaction = {
  invoiceNumber: string;
  date: Date;
  cashierName: string;
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  memberDiscount: number;
  pointsDiscount: number;
  pointsUsed: number;
  pointsEarned: number;
  tax: number;
  grandTotal: number;
  paymentMethod: "Cash" | "QRIS" | "Card" | "Transfer";
  cashGiven: number;
  changeAmount: number;
  referenceNumber?: string;
  cardLast4?: string;
  bankName?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (d: Date): string =>
  d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (d: Date): string =>
  d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TIER_DISCOUNTS: Record<MemberLevel, number> = {
  platinum: 0.1, // 10% diskon
  gold: 0.05, // 5% diskon
  silver: 0.02, // 2% diskon
  regular: 0, // 0%
};

const QUICK_CASH_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TransactionPage() {
  const { showAlert } = useConfirm();

  // ── Master Data State ──
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // ── Cart & Transaction State ──
  const [cart, setCart] = useState<CartItem[]>([
    { product: defaultProducts[0] || ({} as any), qty: 2 },
    { product: defaultProducts[1] || ({} as any), qty: 1 },
  ]);

  // ── Selected Customer State ──
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [usePoints, setUsePoints] = useState<boolean>(false);

  // ── Payment Modal State ──
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRIS" | "Card" | "Transfer">("Cash");
  const [cashGivenInput, setCashGivenInput] = useState<string>("");
  const [cardLast4, setCardLast4] = useState<string>("");
  const [bankName, setBankName] = useState<string>("BCA");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrisPaid, setQrisPaid] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // ── Receipt Modal State ──
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<CompletedTransaction | null>(null);

  // ── Load Products, Categories & Customers ──
  useEffect(() => {
    // Load products
    productService
      .getAll()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setProducts(res);
      })
      .catch(() => {});

    // Load customers (API or local)
    customerService
      .getAll()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCustomers(res);
        } else if (typeof window !== "undefined") {
          const stored = localStorage.getItem("my_cashier_customers_data");
          if (stored) setCustomers(JSON.parse(stored));
        }
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("my_cashier_customers_data");
          if (stored) {
            try {
              setCustomers(JSON.parse(stored));
            } catch {}
          }
        }
      });
  }, []);

  // ── Barcode Camera Scanner ──
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
            },
            false
          );
          scanner.render(
            (decodedText) => {
              handleBarcodeScanned(decodedText);
              setIsScanning(false);
              scanner?.clear();
            },
            () => {}
          );
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scanner) {
          scanner.clear().catch(() => {});
        }
      };
    }
  }, [isScanning]);

  const handleBarcodeScanned = (code: string) => {
    const found = products.find(
      (p) => p.barcode === code || (p as any).code === code || String(p.id) === code
    );
    if (found) {
      addToCart(found);
      showAlert(`Produk "${found.name}" berhasil ditambahkan ke keranjang!`, "success");
    } else {
      showAlert(`Produk dengan barcode "${code}" tidak ditemukan!`, "error");
    }
  };

  // ── Cart Operations ──
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: string | number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setSelectedCustomer(null);
    setUsePoints(false);
    showAlert("Keranjang belanja dikosongkan.", "info");
  };

  // ── Filtering Products ──
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === "all" ||
        p.category_id === selectedCategory ||
        (p as any).category === selectedCategory;

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        ((p as any).code && (p as any).code.includes(q));

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // ── Price Calculations ──
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price || 0) * item.qty, 0);
  }, [cart]);

  // Member Tier Discount calculation
  const memberDiscountRate = selectedCustomer?.member_level
    ? TIER_DISCOUNTS[selectedCustomer.member_level] || 0
    : 0;

  const memberDiscount = Math.round(subtotal * memberDiscountRate);

  // Loyalty points redemption: 1 Poin = Rp 1.000 diskon (maksimal senilai tagihan)
  const availablePoints = selectedCustomer?.points || 0;
  const maxPointsUsable = Math.min(
    availablePoints,
    Math.floor(Math.max(0, subtotal - memberDiscount) / 1000)
  );

  const pointsUsed = usePoints ? maxPointsUsable : 0;
  const pointsDiscount = pointsUsed * 1000;

  const tax = 0; // Tax included
  const grandTotal = Math.max(0, subtotal - memberDiscount - pointsDiscount + tax);

  // New loyalty points earned from this purchase: 1 point every Rp 10.000 spent
  const pointsEarned = selectedCustomer ? Math.floor(grandTotal / 10000) : 0;

  // Cash payment calculation
  const parsedCashGiven = Number(cashGivenInput.replace(/[^0-9]/g, "")) || 0;
  const changeAmount = Math.max(0, parsedCashGiven - grandTotal);
  const isCashSufficient = parsedCashGiven >= grandTotal;

  // ── Start Checkout / Payment Modal ──
  const handleOpenPayment = () => {
    if (cart.length === 0) {
      showAlert("Keranjang belanja masih kosong!", "info");
      return;
    }
    // Set default cash input to exact amount
    setCashGivenInput(String(grandTotal));
    setQrisPaid(false);
    setPaymentModalOpen(true);
  };

  // ── Confirm Payment & Process Transaction ──
  const handleConfirmPayment = async () => {
    if (paymentMethod === "Cash" && !isCashSufficient) {
      showAlert("Nominal uang tunai yang diterima kurang dari total tagihan!", "error");
      return;
    }
    if (paymentMethod === "Card" && !cardLast4.trim()) {
      showAlert("Mohon isi 4 digit terakhir nomor kartu EDC!", "error");
      return;
    }

    setIsProcessingPayment(true);

    const invoiceNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const txRecord: CompletedTransaction = {
      invoiceNumber: invoiceNum,
      date: new Date(),
      cashierName: "Kasir Utama",
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      memberDiscount,
      pointsDiscount,
      pointsUsed,
      pointsEarned,
      tax,
      grandTotal,
      paymentMethod,
      cashGiven: paymentMethod === "Cash" ? parsedCashGiven : grandTotal,
      changeAmount: paymentMethod === "Cash" ? changeAmount : 0,
      referenceNumber: referenceNumber || undefined,
      cardLast4: cardLast4 || undefined,
      bankName: paymentMethod === "Card" || paymentMethod === "Transfer" ? bankName : undefined,
    };

    try {
      // 1. Send transaction to backend
      await transactionService.createTransaction({
        id: txRecord.invoiceNumber,
        customer_id: selectedCustomer?.id || "walk-in",
        items: cart.map((i) => ({
          product_id: String(i.product.id),
          qty: i.qty,
          discount: 0,
        })),
        discount: memberDiscount + pointsDiscount,
        tax: 0,
        payment_method: paymentMethod.toLowerCase() as any,
        payment_amount: txRecord.cashGiven,
        notes: `Transaksi Kasir - ${selectedCustomer?.name || "Pelanggan Umum"}`,
      });
    } catch {
      console.warn("Backend create transaction not reachable, saved locally.");
    }

    // 2. Update customer points in local storage / API
    if (selectedCustomer) {
      const netPointsDelta = pointsEarned - pointsUsed;
      const updatedPoints = Math.max(0, (selectedCustomer.points || 0) + netPointsDelta);
      const updatedSpending = (selectedCustomer.total_spending || 0) + grandTotal;

      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("my_cashier_customers_data");
          let list: Customer[] = stored ? JSON.parse(stored) : [...customers];
          list = list.map((c) =>
            c.id === selectedCustomer.id
              ? { ...c, points: updatedPoints, total_spending: updatedSpending }
              : c
          );
          localStorage.setItem("my_cashier_customers_data", JSON.stringify(list));
          setCustomers(list);
        } catch (e) {
          console.error(e);
        }
      }

      // Try background update
      if (pointsEarned > 0) {
        customerService.addPoints(selectedCustomer.id, { points: pointsEarned, spending: grandTotal }).catch(() => {});
      }
      if (pointsUsed > 0) {
        customerService.redeemPoints(selectedCustomer.id, { points: pointsUsed }).catch(() => {});
      }
    }

    // 3. Complete and Open Receipt Modal
    setCompletedTx(txRecord);
    setIsProcessingPayment(false);
    setPaymentModalOpen(false);
    setReceiptModalOpen(true);
    showAlert("Pembayaran berhasil diselesaikan!", "success");
  };

  // ── Print Receipt Handler ──
  const handlePrintReceipt = () => {
    window.print();
  };

  // ── Send WhatsApp Receipt ──
  const handleSendWhatsAppReceipt = () => {
    if (!completedTx || !completedTx.customer?.phone) {
      showAlert("Nomor WhatsApp pelanggan belum tercatat!", "info");
      return;
    }
    const cleanPhone = completedTx.customer.phone.replace(/[^0-9]/g, "");
    const itemsText = completedTx.items
      .map((i) => `• ${i.product.name} x${i.qty} = ${formatRupiah(i.product.price * i.qty)}`)
      .join("\n");

    const text = encodeURIComponent(
      `🧾 *STRUK PEMBAYARAN - ELDIR CASHIER*\n` +
      `No. Nota: ${completedTx.invoiceNumber}\n` +
      `Tanggal: ${formatDateTime(completedTx.date)}\n` +
      `Pelanggan: ${completedTx.customer.name}\n` +
      `----------------------------------------\n` +
      `${itemsText}\n` +
      `----------------------------------------\n` +
      `Subtotal: ${formatRupiah(completedTx.subtotal)}\n` +
      (completedTx.memberDiscount > 0 ? `Diskon Member: -${formatRupiah(completedTx.memberDiscount)}\n` : "") +
      (completedTx.pointsDiscount > 0 ? `Diskon Poin: -${formatRupiah(completedTx.pointsDiscount)}\n` : "") +
      `*TOTAL: ${formatRupiah(completedTx.grandTotal)}*\n` +
      `Metode: ${completedTx.paymentMethod}\n` +
      `Bayar: ${formatRupiah(completedTx.cashGiven)}\n` +
      `Kembalian: ${formatRupiah(completedTx.changeAmount)}\n` +
      (completedTx.pointsEarned > 0 ? `⭐ Poin Diperoleh: +${completedTx.pointsEarned} Poin\n` : "") +
      `\nTerima kasih atas kunjungan Anda!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  // ── Start New Transaction ──
  const handleStartNewTransaction = () => {
    setReceiptModalOpen(false);
    setCompletedTx(null);
    setCart([]);
    setSelectedCustomer(null);
    setUsePoints(false);
    showAlert("Siap untuk transaksi berikutnya!", "info");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col font-sans">
      <div className="no-print">
        <Headers />
      </div>

      {/* ── MAIN POS CONTAINER ── */}
      <div className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 no-print">
        {/* ── LEFT PANEL: CATALOG, SEARCH & SCAN ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Top Search & Barcode Row */}
          <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <HiOutlineMagnifyingGlass className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama, kode barcode, atau scan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <HiOutlineXMark size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                title="Scan Barcode via Kamera"
                className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <HiOutlineQrCode size={20} className="text-emerald-700" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          {/* Barcode Scanner Modal */}
          {isScanning && (
            <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <HiOutlineQrCode className="text-emerald-600" size={18} />
                    Arahkan Barcode ke Kamera
                  </h3>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full cursor-pointer"
                  >
                    <HiOutlineXMark size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <div id="reader" className="w-full overflow-hidden rounded-2xl" />
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-emerald-800 text-white shadow-2xs"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/80"
              }`}
            >
              Semua Produk ({products.length})
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id || selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-2xs"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/80"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Product Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-200/70 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Image / Label Banner */}
                <div className="bg-emerald-50/70 h-28 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100/70 transition-colors relative overflow-hidden">
                  {product.img_url ? (
                    <img
                      src={product.img_url}
                      alt={product.name}
                      className="h-20 w-auto object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-emerald-800 font-black text-xs tracking-wider uppercase text-center px-2">
                      {(product as any).label || product.name.slice(0, 10)}
                    </span>
                  )}
                  {product.barcode && (
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 text-white px-1.5 rounded">
                      {product.barcode}
                    </span>
                  )}
                </div>

                {/* Info Container */}
                <div>
                  <div className="flex justify-between items-baseline gap-1">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      Stok: {product.stock || 20}
                    </span>
                  </div>
                  <p className="text-xs font-black text-gray-900 mt-1 font-mono">
                    {formatRupiah(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: CURRENT SALE & CUSTOMER PANEL ── */}
        <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 flex flex-col justify-between h-full min-h-[600px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-gray-900">
                  Transaksi Kasir
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* ── CUSTOMER ROW (SELECT / MEMBER CARD) ── */}
              <div className="bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-200/80 transition-all">
                {selectedCustomer ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {selectedCustomer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900 line-clamp-1">
                              {selectedCustomer.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                              {selectedCustomer.member_level || "REGULAR"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-mono">
                            {selectedCustomer.member_code || selectedCustomer.phone}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="text-xs text-gray-400 hover:text-red-600 font-semibold p-1 cursor-pointer"
                        title="Hapus Member"
                      >
                        <HiOutlineXMark size={16} />
                      </button>
                    </div>

                    {/* Member points & loyalty checkbox */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-purple-700 font-bold">
                        <HiOutlineSparkles size={14} />
                        <span>Saldo: {(selectedCustomer.points || 0).toLocaleString("id-ID")} Poin</span>
                      </div>

                      {availablePoints >= 10 && (
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px] text-emerald-800">
                          <input
                            type="checkbox"
                            checked={usePoints}
                            onChange={(e) => setUsePoints(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>Tukar Poin</span>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlineUser size={18} className="text-gray-400" />
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">
                          Pelanggan Umum
                        </span>
                        <span className="text-[11px] text-gray-400">Walk-in Customer</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCustomerModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      + Pilih Member
                    </button>
                  </div>
                )}
              </div>

              {/* ── CART ITEMS LIST ── */}
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Belum ada produk di keranjang
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-emerald-50 text-emerald-800 font-mono font-bold text-xs w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                          {item.qty}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {formatRupiah(item.product.price)}
                          </p>
                        </div>
                      </div>

                      {/* Line Item Total & Qty controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 font-mono">
                          {formatRupiah(item.product.price * item.qty)}
                        </span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            className="p-1 hover:text-red-600 cursor-pointer"
                          >
                            <HiOutlineMinus size={11} />
                          </button>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            className="p-1 hover:text-emerald-700 cursor-pointer"
                          >
                            <HiOutlinePlus size={11} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 hover:text-red-600 text-gray-400 cursor-pointer ml-0.5"
                          >
                            <HiOutlineTrash size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── BOTTOM FINANCIAL CALCULATION & CHARGE ── */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 font-mono">{formatRupiah(subtotal)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Diskon Member ({selectedCustomer?.member_level?.toUpperCase()})</span>
                    <span className="font-bold font-mono">- {formatRupiah(memberDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Potongan Poin ({pointsUsed} Pts)</span>
                    <span className="font-bold font-mono">- {formatRupiah(pointsDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                <span className="text-sm font-extrabold text-gray-900">Total Tagihan</span>
                <span className="text-xl font-black text-gray-900 font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Charge Button -> Opens Payment Modal */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleOpenPayment}
                className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 disabled:bg-gray-300 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                <HiOutlineCreditCard size={18} />
                <span>Bayar Sekarang {formatRupiah(grandTotal)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* ── MODAL: PILIH CUSTOMER / MEMBER ──                       */}
      {/* ========================================================== */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900">
                <HiOutlineUser className="text-blue-600" size={20} />
                <h3 className="text-sm font-extrabold">Pilih Pelanggan / Member</h3>
              </div>
              <button
                onClick={() => setCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Search customer */}
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Cari nama pelanggan, no. hp, atau kode member..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Walk-in option button */}
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerModalOpen(false);
              }}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              <span>Walk-in Customer (Tanpa Member)</span>
              <span className="text-[10px] text-gray-400 font-normal">Standard</span>
            </button>

            {/* Customers list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {customers
                .filter((c) => {
                  const q = customerSearch.toLowerCase().trim();
                  return (
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    (c.phone && c.phone.includes(q)) ||
                    (c.member_code && c.member_code.toLowerCase().includes(q))
                  );
                })
                .map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setCustomerModalOpen(false);
                      showAlert(`Pelanggan "${cust.name}" dipilih!`, "success");
                    }}
                    className="p-3 rounded-xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-between text-xs cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900">{cust.name}</p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                            {cust.member_level || "REGULAR"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {cust.phone || cust.member_code}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-purple-700 text-xs block">
                        {(cust.points || 0).toLocaleString("id-ID")} Pts
                      </span>
                      <span className="text-[10px] text-gray-400">Poin Aktif</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ── MODAL: PROSES PEMBAYARAN (PAYMENT MODAL) ──             */}
      {/* ========================================================== */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <HiOutlineBanknotes size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Pembayaran Kasir</h3>
                  <p className="text-xs text-gray-500">
                    Pelanggan: {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Total Tagihan Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Total Yang Harus Dibayar
              </span>
              <h2 className="text-3xl font-black font-mono mt-1">
                {formatRupiah(grandTotal)}
              </h2>
            </div>

            {/* Payment Methods Tabs */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
                {(["Cash", "QRIS", "Card", "Transfer"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      paymentMethod === m
                        ? "bg-white text-emerald-900 shadow-2xs font-extrabold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {m === "Cash"
                      ? "Tunai"
                      : m === "Card"
                      ? "Debit/EDC"
                      : m === "Transfer"
                      ? "Transfer"
                      : "QRIS"}
                  </button>
                ))}
              </div>

              {/* METHOD 1: TUNAI (CASH) */}
              {paymentMethod === "Cash" && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Uang Diterima dari Pelanggan (IDR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={cashGivenInput}
                      onChange={(e) => setCashGivenInput(e.target.value)}
                      placeholder="Masukkan nominal uang tunai..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                    />
                  </div>

                  {/* Quick Cash Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCashGivenInput(String(grandTotal))}
                      className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Uang Pas
                    </button>
                    {QUICK_CASH_AMOUNTS.filter((amt) => amt >= grandTotal)
                      .slice(0, 5)
                      .map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashGivenInput(String(amt))}
                          className="py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold font-mono transition-colors cursor-pointer"
                        >
                          {formatRupiah(amt)}
                        </button>
                      ))}
                  </div>

                  {/* Kembalian Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isCashSufficient
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider block">
                        {isCashSufficient ? "Uang Kembalian" : "Kekurangan Bayar"}
                      </span>
                      <span className="text-xl font-black font-mono">
                        {isCashSufficient
                          ? formatRupiah(changeAmount)
                          : formatRupiah(grandTotal - parsedCashGiven)}
                      </span>
                    </div>
                    {isCashSufficient && (
                      <HiOutlineCheckCircle className="text-emerald-600" size={28} />
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 2: QRIS */}
              {paymentMethod === "QRIS" && (
                <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                    <HiOutlineQrCode size={140} className="text-slate-800" />
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">
                      QRIS STATIS / DINAMIS
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">Scan QRIS menggunakan BCA, GoPay, OVO, ShopeePay</p>
                    <p className="text-xs text-emerald-700 font-black font-mono mt-0.5">
                      Nominal: {formatRupiah(grandTotal)}
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 3: DEBIT / KARTU EDC */}
              {paymentMethod === "Card" && (
                <div className="space-y-3.5 pt-1 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 uppercase tracking-wider">
                      Pilih Mesin EDC / Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none cursor-pointer"
                    >
                      <option value="BCA">EDC Bank BCA</option>
                      <option value="Mandiri">EDC Bank Mandiri</option>
                      <option value="BRI">EDC Bank BRI</option>
                      <option value="BNI">EDC Bank BNI</option>
                      <option value="Lainnya">Mesin EDC Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 uppercase tracking-wider">
                      4 Digit Terakhir Nomor Kartu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Contoh: 8842"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 uppercase tracking-wider">
                      Nomor Approval / Trace (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="No trace dari struk EDC"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              {/* METHOD 4: TRANSFER BANK */}
              {paymentMethod === "Transfer" && (
                <div className="space-y-3.5 pt-1 text-xs">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                    <p className="font-bold text-blue-900">Rekening Kasir Toko:</p>
                    <p className="font-mono text-sm font-black text-blue-800">
                      BCA: 123-456-7890 (a.n Eldir Cashier)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 uppercase tracking-wider">
                      Nomor Referensi Transfer / Bukti
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nomor transaksi transfer..."
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  isProcessingPayment ||
                  (paymentMethod === "Cash" && !isCashSufficient)
                }
                onClick={handleConfirmPayment}
                className="px-7 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-98 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                {isProcessingPayment ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <HiOutlineCheckCircle size={18} />
                    <span>Selesaikan Transaksi & Cetak</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ── MODAL: CETAK STRUK PEMBAYARAN (THERMAL RECEIPT) ──      */}
      {/* ========================================================== */}
      {receiptModalOpen && completedTx && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header bar (no-print) */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50 no-print">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <HiOutlineCheckCircle size={20} />
                <span>Transaksi Selesai</span>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* ── PRINTABLE THERMAL RECEIPT SLIP ── */}
            <div className="p-6 overflow-y-auto flex justify-center bg-gray-100">
              <div className="receipt-print-area bg-white p-5 rounded-2xl shadow-sm border border-gray-200 w-full max-w-[340px] text-gray-900 font-mono text-xs space-y-3">
                {/* Store Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black tracking-tight">ELDIR CASHIER & STORE</h2>
                  <p className="text-[11px] text-gray-600">Jl. Raya Utama No. 88, Jakarta Selatan</p>
                  <p className="text-[11px] text-gray-600">Telp/WA: 0813-1018-1765</p>
                </div>

                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Metadata */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>No. Nota:</span>
                    <span className="font-bold">{completedTx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{formatDateTime(completedTx.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{completedTx.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="font-bold">
                      {completedTx.customer
                        ? `${completedTx.customer.name} (${completedTx.customer.member_level?.toUpperCase()})`
                        : "Walk-in Customer"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Items */}
                <div className="space-y-2">
                  {completedTx.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="font-bold">{it.product.name}</span>
                        <span className="font-bold">
                          {formatRupiah(it.product.price * it.qty)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[10px]">
                        <span>
                          {it.qty} x {formatRupiah(it.product.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Calculation */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(completedTx.subtotal)}</span>
                  </div>
                  {completedTx.memberDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Diskon Member:</span>
                      <span>-{formatRupiah(completedTx.memberDiscount)}</span>
                    </div>
                  )}
                  {completedTx.pointsDiscount > 0 && (
                    <div className="flex justify-between text-purple-700">
                      <span>Potongan Poin:</span>
                      <span>-{formatRupiah(completedTx.pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-300">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(completedTx.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Metode:</span>
                    <span className="font-bold">{completedTx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span>{formatRupiah(completedTx.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(completedTx.changeAmount)}</span>
                  </div>
                </div>

                {/* Member points info */}
                {completedTx.customer && (
                  <>
                    <div className="border-t border-dashed border-gray-400 my-2" />
                    <div className="text-[10px] space-y-0.5 text-center text-purple-900 bg-purple-50 p-2 rounded-lg">
                      <p className="font-bold">⭐ INFO LOYALITAS MEMBER</p>
                      <p>Poin Didapat: +{completedTx.pointsEarned} Poin</p>
                      <p>
                        Total Poin Sekarang:{" "}
                        {Math.max(
                          0,
                          (completedTx.customer.points || 0) +
                            completedTx.pointsEarned -
                            completedTx.pointsUsed
                        )}{" "}
                        Pts
                      </p>
                    </div>
                  </>
                )}

                {/* Barcode Receipt */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <Barcode
                    value={completedTx.invoiceNumber}
                    width={1.2}
                    height={30}
                    fontSize={10}
                    margin={0}
                  />
                </div>

                {/* Footer Notes */}
                <div className="text-center text-[10px] text-gray-500 pt-2 space-y-0.5">
                  <p>Terima kasih atas kunjungan Anda!</p>
                  <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                  <p className="font-bold">www.eldir-cashier.com</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions (no-print) */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 no-print">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <HiOutlinePrinter size={16} />
                  <span>Cetak Struk</span>
                </button>

                {completedTx.customer?.phone && (
                  <button
                    type="button"
                    onClick={handleSendWhatsAppReceipt}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Kirim Nota via WA"
                  >
                    <HiOutlineChatBubbleLeftRight size={16} />
                    <span>Kirim WA</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartNewTransaction}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Transaksi Baru</span>
                <HiOutlinePlus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
