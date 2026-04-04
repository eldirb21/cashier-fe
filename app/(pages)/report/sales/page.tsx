"use client";

import { Headers } from "@/app/components/atoms";
import React, { useState, useMemo } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import {
  HiOutlineDocumentText,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineChartBar,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

// ── types ─────────────────────────────────────────────────────────────────────

interface SaleItemRow {
  date: string;
  invoice: string;
  cashier: string;
  product_name: string;
  category: string;
  barcode: string;
  qty: number;
  price: number;
  discount_pct: number;
  subtotal: number;
  total: number;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── mock data ─────────────────────────────────────────────────────────────────

const RAW_DATA: SaleItemRow[] = [
  {
    date: "2024-09-02T00:50:30Z",
    invoice: "INV-5908",
    cashier: "Andi",
    product_name: "Galon Le Minerale 5L",
    category: "Air Minum",
    barcode: "8992759170570",
    qty: 2,
    price: 15000,
    discount_pct: 5,
    subtotal: 30000,
    total: 28500,
  },
  {
    date: "2024-09-02T00:50:30Z",
    invoice: "INV-5908",
    cashier: "Andi",
    product_name: "Aqua 600ml",
    category: "Air Minum",
    barcode: "8992759170571",
    qty: 3,
    price: 3000,
    discount_pct: 0,
    subtotal: 9000,
    total: 9000,
  },
  {
    date: "2024-09-02T00:50:30Z",
    invoice: "INV-5908",
    cashier: "Andi",
    product_name: "Chitato BBQ 68g",
    category: "Snack",
    barcode: "8991101190301",
    qty: 2,
    price: 8500,
    discount_pct: 0,
    subtotal: 17000,
    total: 17000,
  },
  {
    date: "2024-09-02T01:26:39Z",
    invoice: "INV-3200",
    cashier: "Andi",
    product_name: "Indomie Goreng",
    category: "Mie Instan",
    barcode: "8991101010004",
    qty: 5,
    price: 3000,
    discount_pct: 0,
    subtotal: 15000,
    total: 15000,
  },
  {
    date: "2024-09-02T01:28:16Z",
    invoice: "INV-2103",
    cashier: "Budi",
    product_name: "Aqua 600ml",
    category: "Air Minum",
    barcode: "8992759170571",
    qty: 1,
    price: 3000,
    discount_pct: 0,
    subtotal: 3000,
    total: 3000,
  },
  {
    date: "2024-09-03T03:39:07Z",
    invoice: "INV-7439",
    cashier: "Budi",
    product_name: "Galon Le Minerale 5L",
    category: "Air Minum",
    barcode: "8992759170570",
    qty: 3,
    price: 15000,
    discount_pct: 5,
    subtotal: 45000,
    total: 42750,
  },
  {
    date: "2024-09-03T03:39:07Z",
    invoice: "INV-7439",
    cashier: "Budi",
    product_name: "Teh Botol Sosro 1L",
    category: "Minuman",
    barcode: "8991101010011",
    qty: 4,
    price: 7000,
    discount_pct: 0,
    subtotal: 28000,
    total: 28000,
  },
  {
    date: "2024-09-03T05:12:00Z",
    invoice: "INV-1023",
    cashier: "Andi",
    product_name: "Sabun Lifebuoy 90g",
    category: "Kebersihan",
    barcode: "8991101010022",
    qty: 2,
    price: 5500,
    discount_pct: 0,
    subtotal: 11000,
    total: 11000,
  },
  {
    date: "2024-09-04T08:20:11Z",
    invoice: "INV-8812",
    cashier: "Citra",
    product_name: "Minyak Goreng Bimoli 2L",
    category: "Sembako",
    barcode: "8991101010033",
    qty: 2,
    price: 32000,
    discount_pct: 10,
    subtotal: 64000,
    total: 57600,
  },
  {
    date: "2024-09-04T08:20:11Z",
    invoice: "INV-8812",
    cashier: "Citra",
    product_name: "Gula Pasir 1kg",
    category: "Sembako",
    barcode: "8991101010044",
    qty: 2,
    price: 14000,
    discount_pct: 0,
    subtotal: 28000,
    total: 28000,
  },
  {
    date: "2024-09-05T10:05:44Z",
    invoice: "INV-4421",
    cashier: "Citra",
    product_name: "Indomie Goreng",
    category: "Mie Instan",
    barcode: "8991101010004",
    qty: 10,
    price: 3000,
    discount_pct: 0,
    subtotal: 30000,
    total: 30000,
  },
  {
    date: "2024-09-06T07:33:22Z",
    invoice: "INV-9901",
    cashier: "Andi",
    product_name: "Chitato BBQ 68g",
    category: "Snack",
    barcode: "8991101190301",
    qty: 5,
    price: 8500,
    discount_pct: 0,
    subtotal: 42500,
    total: 42500,
  },
  {
    date: "2024-09-06T07:33:22Z",
    invoice: "INV-9901",
    cashier: "Andi",
    product_name: "Galon Le Minerale 5L",
    category: "Air Minum",
    barcode: "8992759170570",
    qty: 4,
    price: 15000,
    discount_pct: 5,
    subtotal: 60000,
    total: 57000,
  },
  {
    date: "2024-09-07T09:14:55Z",
    invoice: "INV-3312",
    cashier: "Budi",
    product_name: "Sabun Lifebuoy 90g",
    category: "Kebersihan",
    barcode: "8991101010022",
    qty: 3,
    price: 5500,
    discount_pct: 0,
    subtotal: 16500,
    total: 16500,
  },
  {
    date: "2024-09-08T11:22:08Z",
    invoice: "INV-6634",
    cashier: "Citra",
    product_name: "Minyak Goreng Bimoli 2L",
    category: "Sembako",
    barcode: "8991101010033",
    qty: 3,
    price: 32000,
    discount_pct: 10,
    subtotal: 96000,
    total: 86400,
  },
  {
    date: "2024-09-08T11:22:08Z",
    invoice: "INV-6634",
    cashier: "Citra",
    product_name: "Aqua 600ml",
    category: "Air Minum",
    barcode: "8992759170571",
    qty: 8,
    price: 3000,
    discount_pct: 0,
    subtotal: 24000,
    total: 24000,
  },
  {
    date: "2024-09-09T06:45:33Z",
    invoice: "INV-2218",
    cashier: "Andi",
    product_name: "Teh Botol Sosro 1L",
    category: "Minuman",
    barcode: "8991101010011",
    qty: 6,
    price: 7000,
    discount_pct: 0,
    subtotal: 42000,
    total: 42000,
  },
  {
    date: "2024-09-10T13:08:19Z",
    invoice: "INV-5541",
    cashier: "Budi",
    product_name: "Indomie Goreng",
    category: "Mie Instan",
    barcode: "8991101010004",
    qty: 12,
    price: 3000,
    discount_pct: 0,
    subtotal: 36000,
    total: 36000,
  },
  {
    date: "2024-09-11T08:55:01Z",
    invoice: "INV-7723",
    cashier: "Citra",
    product_name: "Gula Pasir 1kg",
    category: "Sembako",
    barcode: "8991101010044",
    qty: 3,
    price: 14000,
    discount_pct: 0,
    subtotal: 42000,
    total: 42000,
  },
  {
    date: "2024-09-12T10:30:44Z",
    invoice: "INV-3398",
    cashier: "Andi",
    product_name: "Galon Le Minerale 5L",
    category: "Air Minum",
    barcode: "8992759170570",
    qty: 5,
    price: 15000,
    discount_pct: 5,
    subtotal: 75000,
    total: 71250,
  },
  {
    date: "2024-09-13T14:12:07Z",
    invoice: "INV-8856",
    cashier: "Budi",
    product_name: "Chitato BBQ 68g",
    category: "Snack",
    barcode: "8991101190301",
    qty: 3,
    price: 8500,
    discount_pct: 0,
    subtotal: 25500,
    total: 25500,
  },
  {
    date: "2024-09-14T09:40:29Z",
    invoice: "INV-1145",
    cashier: "Citra",
    product_name: "Minyak Goreng Bimoli 2L",
    category: "Sembako",
    barcode: "8991101010033",
    qty: 4,
    price: 32000,
    discount_pct: 10,
    subtotal: 128000,
    total: 115200,
  },
  {
    date: "2024-09-15T11:58:52Z",
    invoice: "INV-4467",
    cashier: "Andi",
    product_name: "Aqua 600ml",
    category: "Air Minum",
    barcode: "8992759170571",
    qty: 6,
    price: 3000,
    discount_pct: 0,
    subtotal: 18000,
    total: 18000,
  },
  {
    date: "2024-09-16T07:25:18Z",
    invoice: "INV-6679",
    cashier: "Budi",
    product_name: "Sabun Lifebuoy 90g",
    category: "Kebersihan",
    barcode: "8991101010022",
    qty: 4,
    price: 5500,
    discount_pct: 0,
    subtotal: 22000,
    total: 22000,
  },
  {
    date: "2024-09-17T15:03:41Z",
    invoice: "INV-9912",
    cashier: "Citra",
    product_name: "Teh Botol Sosro 1L",
    category: "Minuman",
    barcode: "8991101010011",
    qty: 5,
    price: 7000,
    discount_pct: 0,
    subtotal: 35000,
    total: 35000,
  },
  {
    date: "2024-09-18T12:47:03Z",
    invoice: "INV-2234",
    cashier: "Andi",
    product_name: "Indomie Goreng",
    category: "Mie Instan",
    barcode: "8991101010004",
    qty: 20,
    price: 3000,
    discount_pct: 0,
    subtotal: 60000,
    total: 60000,
  },
];

const COLORS_CAT = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const PAGE_SIZE = 8;

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}) {
  const isPos = (trend ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 tracking-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-bold ${isPos ? "text-emerald-500" : "text-red-400"}`}
        >
          {isPos ? (
            <HiArrowTrendingUp size={14} />
          ) : (
            <HiArrowTrendingDown size={14} />
          )}
          {Math.abs(trend)}% vs bulan lalu
        </div>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

const ReportSales = () => {
  const [startDate, setStartDate] = useState("2024-09-01");
  const [endDate, setEndDate] = useState("2024-09-19");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cashierFilter, setCashierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [filtered, setFiltered] = useState<SaleItemRow[]>(RAW_DATA);
  const [sortKey, setSortKey] = useState<keyof SaleItemRow>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(RAW_DATA.map((r) => r.category)))],
    [],
  );
  const cashiers = useMemo(
    () => ["all", ...Array.from(new Set(RAW_DATA.map((r) => r.cashier)))],
    [],
  );

  const handleFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    setFiltered(
      RAW_DATA.filter((r) => {
        const d = new Date(r.date);
        const inRange = d >= start && d <= end;
        const inSearch =
          !search ||
          r.product_name.toLowerCase().includes(search.toLowerCase()) ||
          r.invoice.toLowerCase().includes(search.toLowerCase()) ||
          r.barcode.includes(search);
        const inCat = categoryFilter === "all" || r.category === categoryFilter;
        const inCashier =
          cashierFilter === "all" || r.cashier === cashierFilter;
        return inRange && inSearch && inCat && inCashier;
      }),
    );
    setPage(1);
  };

  const handleSort = (key: keyof SaleItemRow) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const av = a[sortKey] as any,
          bv = b[sortKey] as any;
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      }),
    [filtered, sortKey, sortAsc],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── aggregates ──────────────────────────────────────────────────────────────
  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0);
  const totalQty = filtered.reduce((s, r) => s + r.qty, 0);
  const totalDiscount = filtered.reduce(
    (s, r) => s + (r.subtotal - r.total),
    0,
  );
  const uniqueProducts = new Set(filtered.map((r) => r.barcode)).size;

  // top products by qty
  const topProducts = useMemo(() => {
    const map: Record<
      string,
      { name: string; qty: number; revenue: number; category: string }
    > = {};
    filtered.forEach((r) => {
      if (!map[r.barcode])
        map[r.barcode] = {
          name: r.product_name,
          qty: 0,
          revenue: 0,
          category: r.category,
        };
      map[r.barcode].qty += r.qty;
      map[r.barcode].revenue += r.total;
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [filtered]);

  // category breakdown
  const catData = useMemo(() => {
    const map: Record<string, { qty: number; revenue: number }> = {};
    filtered.forEach((r) => {
      if (!map[r.category]) map[r.category] = { qty: 0, revenue: 0 };
      map[r.category].qty += r.qty;
      map[r.category].revenue += r.total;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // daily sales qty trend
  const trendData = useMemo(() => {
    const map: Record<string, { date: string; qty: number; revenue: number }> =
      {};
    filtered.forEach((r) => {
      const k = new Date(r.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      if (!map[k]) map[k] = { date: k, qty: 0, revenue: 0 };
      map[k].qty += r.qty;
      map[k].revenue += r.total;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // excel export
  const handleExport = () => {
    const rows = filtered.map((r) => ({
      Tanggal: fmtDate(r.date),
      Invoice: r.invoice,
      Kasir: r.cashier,
      "Nama Produk": r.product_name,
      Kategori: r.category,
      Barcode: r.barcode,
      Qty: r.qty,
      "Harga Satuan": r.price,
      "Diskon (%)": r.discount_pct,
      Subtotal: r.subtotal,
      Total: r.total,
    }));
    rows.push({} as any);
    rows.push({
      Tanggal: "TOTAL",
      Invoice: "",
      Kasir: "",
      "Nama Produk": `${uniqueProducts} produk`,
      Kategori: "",
      Barcode: "",
      Qty: totalQty,
      "Harga Satuan": 0,
      "Diskon (%)": 0,
      Subtotal: filtered.reduce((s, r) => s + r.subtotal, 0),
      Total: totalRevenue,
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 26 },
      { wch: 14 },
      { wch: 16 },
      { wch: 8 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan Produk");
    XLSX.writeFile(wb, `laporan-sales-${startDate}-sd-${endDate}.xlsx`);
  };

  const SortIcon = ({ col }: { col: keyof SaleItemRow }) => (
    <span
      className={`ml-1 ${sortKey === col ? "text-blue-500" : "text-gray-300"}`}
    >
      {sortKey === col ? (sortAsc ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Headers />
      <main className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Laporan Penjualan Produk
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Volume penjualan per produk & kategori
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <HiOutlineDocumentText size={16} />
            Export Excel
          </button>
        </div>

        {/* filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {[
              {
                label: "Dari Tanggal",
                type: "date",
                value: startDate,
                onChange: setStartDate,
              },
              {
                label: "Sampai Tanggal",
                type: "date",
                value: endDate,
                onChange: setEndDate,
              },
            ].map(({ label, type, value, onChange }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Semua Kategori" : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Kasir
              </label>
              <select
                value={cashierFilter}
                onChange={(e) => setCashierFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {cashiers.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Semua Kasir" : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Cari
              </label>
              <div className="relative">
                <HiMagnifyingGlass
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type="text"
                  placeholder="Produk / barcode"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <HiXMark size={14} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleFilter}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <HiOutlineFilter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Pendapatan"
            value={fmt(totalRevenue)}
            sub={`${filtered.length} baris transaksi`}
            icon={HiOutlineShoppingBag}
            trend={9.3}
            color="bg-blue-50 text-blue-500"
          />
          <StatCard
            label="Total Unit Terjual"
            value={totalQty.toLocaleString()}
            sub={`${uniqueProducts} produk unik`}
            icon={HiOutlineCube}
            trend={14.1}
            color="bg-emerald-50 text-emerald-500"
          />
          <StatCard
            label="Total Diskon"
            value={fmt(totalDiscount)}
            sub={`${((totalDiscount / (totalRevenue + totalDiscount || 1)) * 100).toFixed(1)}% dari subtotal`}
            icon={HiOutlineTag}
            trend={-3.2}
            color="bg-amber-50 text-amber-500"
          />
          <StatCard
            label="Produk Terlaris"
            value={topProducts[0]?.name.split(" ").slice(0, 2).join(" ") ?? "—"}
            sub={topProducts[0] ? `${topProducts[0].qty} unit terjual` : ""}
            icon={HiOutlineChartBar}
            color="bg-violet-50 text-violet-500"
          />
        </div>

        {/* top products + trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* top products bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800">Produk Terlaris</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Berdasarkan jumlah unit terjual
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(v) =>
                    v.length > 14 ? v.slice(0, 14) + "…" : v
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number, name: string) => [
                    name === "qty" ? `${v} unit` : fmt(v),
                    name === "qty" ? "Unit" : "Revenue",
                  ]}
                />
                <Bar dataKey="qty" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* daily trend line */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800">
              Tren Penjualan Harian
            </p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Unit terjual per hari
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} unit`, "Qty"]}
                />
                <Line
                  type="monotone"
                  dataKey="qty"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* category pie + breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800">Per Kategori</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Distribusi unit terjual
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="qty"
                >
                  {catData.map((_, i) => (
                    <Cell key={i} fill={COLORS_CAT[i % COLORS_CAT.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`${v} unit`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {catData.map((d, i) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS_CAT[i % COLORS_CAT.length] }}
                    />
                    <span className="text-gray-500">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-700">{d.qty} unit</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">
              Performa per Kategori
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Unit terjual & total pendapatan
            </p>
            <div className="space-y-3">
              {catData.map((d, i) => {
                const pct = Math.round((d.revenue / (totalRevenue || 1)) * 100);
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: COLORS_CAT[i % COLORS_CAT.length],
                          }}
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400">{d.qty} unit</span>
                        <span className="font-bold text-gray-800">
                          {fmt(d.revenue)}
                        </span>
                        <span className="text-gray-400 w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: COLORS_CAT[i % COLORS_CAT.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* detail table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">
                Detail Penjualan Produk
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} baris ditemukan
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {(
                    [
                      ["date", "Tanggal"],
                      ["invoice", "Invoice"],
                      ["cashier", "Kasir"],
                      ["product_name", "Produk"],
                      ["category", "Kategori"],
                      ["barcode", "Barcode"],
                      ["qty", "Qty"],
                      ["price", "Harga"],
                      ["discount_pct", "Disc%"],
                      ["subtotal", "Subtotal"],
                      ["total", "Total"],
                    ] as [keyof SaleItemRow, string][]
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 select-none whitespace-nowrap"
                    >
                      {label}
                      <SortIcon col={key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-[10px] font-mono text-gray-400 whitespace-nowrap">
                      {fmtDate(row.date)}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-bold text-blue-500 whitespace-nowrap">
                      {row.invoice}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">
                      {row.cashier}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-gray-800">
                      {row.product_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono text-gray-400">
                      {row.barcode}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-black text-center text-gray-800">
                      {row.qty}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-600 whitespace-nowrap">
                      {fmt(row.price)}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-center">
                      {row.discount_pct > 0 ? (
                        <span className="text-emerald-600">
                          {row.discount_pct}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                      {row.discount_pct > 0 ? (
                        <span className="line-through">
                          {fmt(row.subtotal)}
                        </span>
                      ) : (
                        fmt(row.subtotal)
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-black text-gray-900 whitespace-nowrap">
                      {fmt(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3.5 text-[11px] font-bold text-gray-500"
                  >
                    Total ({filtered.length} baris · {uniqueProducts} produk
                    unik)
                  </td>
                  <td className="px-4 py-3.5 text-[11px] font-black text-center text-gray-800">
                    {totalQty}
                  </td>
                  <td />
                  <td />
                  <td className="px-4 py-3.5 text-[11px] font-bold text-gray-500">
                    {fmt(filtered.reduce((s, r) => s + r.subtotal, 0))}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-black text-gray-900">
                    {fmt(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <HiChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${p === page ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <HiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportSales;
