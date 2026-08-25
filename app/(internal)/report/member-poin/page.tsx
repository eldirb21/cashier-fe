"use client";

import { Headers } from "@/app/components/atoms";
import React, { useState, useMemo } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import {
  HiOutlineDocumentText,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiOutlineBanknotes,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineReceiptPercent,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

// ── types ─────────────────────────────────────────────────────────────────────

interface SaleRow {
  date: string;
  invoice: string;
  cashier: string;
  customer: string;
  items: number;
  subtotal: number;
  discount: number;
  total: number;
  payment: "cash" | "transfer" | "member";
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

const RAW_DATA: SaleRow[] = [
  {
    date: "2024-09-02T00:50:30.120Z",
    invoice: "INV-1725238230117-5908",
    cashier: "Andi",
    customer: "Akhmad Lutfi",
    items: 4,
    subtotal: 65000,
    discount: 2000,
    total: 63000,
    payment: "cash",
  },
  {
    date: "2024-09-02T01:26:39.632Z",
    invoice: "INV-1725240399631-3200",
    cashier: "Andi",
    customer: "Umum",
    items: 1,
    subtotal: 15000,
    discount: 0,
    total: 15000,
    payment: "cash",
  },
  {
    date: "2024-09-02T01:28:16.415Z",
    invoice: "INV-1725240496414-2103",
    cashier: "Budi",
    customer: "Umum",
    items: 1,
    subtotal: 3000,
    discount: 0,
    total: 3000,
    payment: "transfer",
  },
  {
    date: "2024-09-03T03:39:07.751Z",
    invoice: "INV-1725673147749-7439",
    cashier: "Budi",
    customer: "May Uswatun",
    items: 5,
    subtotal: 82000,
    discount: 4000,
    total: 78000,
    payment: "member",
  },
  {
    date: "2024-09-03T05:12:00.000Z",
    invoice: "INV-1725673147749-1023",
    cashier: "Andi",
    customer: "Rudi Hartono",
    items: 3,
    subtotal: 45000,
    discount: 0,
    total: 45000,
    payment: "cash",
  },
  {
    date: "2024-09-04T08:20:11.000Z",
    invoice: "INV-1725673147749-8812",
    cashier: "Citra",
    customer: "Siti Rahayu",
    items: 6,
    subtotal: 120000,
    discount: 10000,
    total: 110000,
    payment: "transfer",
  },
  {
    date: "2024-09-05T10:05:44.000Z",
    invoice: "INV-1725673147749-4421",
    cashier: "Citra",
    customer: "Umum",
    items: 2,
    subtotal: 28000,
    discount: 0,
    total: 28000,
    payment: "cash",
  },
  {
    date: "2024-09-06T07:33:22.000Z",
    invoice: "INV-1725673147749-9901",
    cashier: "Andi",
    customer: "Ahmad Fauzi",
    items: 8,
    subtotal: 195000,
    discount: 15000,
    total: 180000,
    payment: "member",
  },
  {
    date: "2024-09-07T09:14:55.000Z",
    invoice: "INV-1725673147749-3312",
    cashier: "Budi",
    customer: "Dewi Lestari",
    items: 3,
    subtotal: 55000,
    discount: 5000,
    total: 50000,
    payment: "cash",
  },
  {
    date: "2024-09-08T11:22:08.000Z",
    invoice: "INV-1725673147749-6634",
    cashier: "Citra",
    customer: "Hendra Wijaya",
    items: 10,
    subtotal: 250000,
    discount: 25000,
    total: 225000,
    payment: "member",
  },
  {
    date: "2024-09-09T06:45:33.000Z",
    invoice: "INV-1725673147749-2218",
    cashier: "Andi",
    customer: "Umum",
    items: 2,
    subtotal: 36000,
    discount: 0,
    total: 36000,
    payment: "cash",
  },
  {
    date: "2024-09-10T13:08:19.000Z",
    invoice: "INV-1725673147749-5541",
    cashier: "Budi",
    customer: "Rina Susanti",
    items: 7,
    subtotal: 142000,
    discount: 12000,
    total: 130000,
    payment: "transfer",
  },
  {
    date: "2024-09-11T08:55:01.000Z",
    invoice: "INV-1725673147749-7723",
    cashier: "Citra",
    customer: "Bayu Pratama",
    items: 4,
    subtotal: 88000,
    discount: 8000,
    total: 80000,
    payment: "cash",
  },
  {
    date: "2024-09-12T10:30:44.000Z",
    invoice: "INV-1725673147749-3398",
    cashier: "Andi",
    customer: "Lia Amelia",
    items: 5,
    subtotal: 97000,
    discount: 7000,
    total: 90000,
    payment: "member",
  },
  {
    date: "2024-09-13T14:12:07.000Z",
    invoice: "INV-1725673147749-8856",
    cashier: "Budi",
    customer: "Umum",
    items: 1,
    subtotal: 12000,
    discount: 0,
    total: 12000,
    payment: "cash",
  },
  {
    date: "2024-09-14T09:40:29.000Z",
    invoice: "INV-1725673147749-1145",
    cashier: "Citra",
    customer: "Farida Hanum",
    items: 9,
    subtotal: 210000,
    discount: 20000,
    total: 190000,
    payment: "transfer",
  },
  {
    date: "2024-09-15T11:58:52.000Z",
    invoice: "INV-1725673147749-4467",
    cashier: "Andi",
    customer: "Umum",
    items: 3,
    subtotal: 51000,
    discount: 1000,
    total: 50000,
    payment: "cash",
  },
  {
    date: "2024-09-16T07:25:18.000Z",
    invoice: "INV-1725673147749-6679",
    cashier: "Budi",
    customer: "Irwan Setiawan",
    items: 6,
    subtotal: 135000,
    discount: 10000,
    total: 125000,
    payment: "member",
  },
  {
    date: "2024-09-17T15:03:41.000Z",
    invoice: "INV-1725673147749-9912",
    cashier: "Citra",
    customer: "Novi Kurniawan",
    items: 2,
    subtotal: 44000,
    discount: 4000,
    total: 40000,
    payment: "cash",
  },
  {
    date: "2024-09-18T12:47:03.000Z",
    invoice: "INV-1725673147749-2234",
    cashier: "Andi",
    customer: "Yusuf Hakim",
    items: 12,
    subtotal: 310000,
    discount: 30000,
    total: 280000,
    payment: "member",
  },
];

const COLORS_PIE = ["#3b82f6", "#10b981", "#f59e0b"];

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
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
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

// ── payment badge ─────────────────────────────────────────────────────────────

const paymentStyle: Record<string, string> = {
  cash: "bg-emerald-50 text-emerald-700 border-emerald-100",
  transfer: "bg-blue-50 text-blue-700 border-blue-100",
  member: "bg-amber-50 text-amber-700 border-amber-100",
};
const paymentLabel: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  member: "Member",
};

// ── main ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const ReportMemberPoin = () => {
  const [startDate, setStartDate] = useState("2024-09-01");
  const [endDate, setEndDate] = useState("2024-09-19");
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [filtered, setFiltered] = useState<SaleRow[]>(RAW_DATA);
  const [sortKey, setSortKey] = useState<keyof SaleRow>("date");
  const [sortAsc, setSortAsc] = useState(false);

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
          r.invoice.toLowerCase().includes(search.toLowerCase()) ||
          r.customer.toLowerCase().includes(search.toLowerCase());
        const inCashier =
          cashierFilter === "all" || r.cashier === cashierFilter;
        const inPayment =
          paymentFilter === "all" || r.payment === paymentFilter;
        return inRange && inSearch && inCashier && inPayment;
      }),
    );
    setPage(1);
  };

  const handleSort = (key: keyof SaleRow) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const av = a[sortKey] as any;
        const bv = b[sortKey] as any;
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      }),
    [filtered, sortKey, sortAsc],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // stats
  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0);
  const totalDiscount = filtered.reduce((s, r) => s + r.discount, 0);
  const totalTransactions = filtered.length;
  const totalItems = filtered.reduce((s, r) => s + r.items, 0);
  const avgTransaction = totalTransactions
    ? totalRevenue / totalTransactions
    : 0;

  // chart data — group by date
  const chartData = useMemo(() => {
    const map: Record<
      string,
      { date: string; revenue: number; transactions: number }
    > = {};
    filtered.forEach((r) => {
      const key = new Date(r.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      if (!map[key]) map[key] = { date: key, revenue: 0, transactions: 0 };
      map[key].revenue += r.total;
      map[key].transactions += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // pie data
  const pieData = useMemo(() => {
    const counts: Record<string, number> = { cash: 0, transfer: 0, member: 0 };
    filtered.forEach((r) => counts[r.payment]++);
    return [
      { name: "Tunai", value: counts.cash },
      { name: "Transfer", value: counts.transfer },
      { name: "Member", value: counts.member },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  // cashier breakdown
  const cashierData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      map[r.cashier] = (map[r.cashier] || 0) + r.total;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  // excel export
  const handleExport = () => {
    const rows = filtered.map((r) => ({
      Tanggal: fmtDate(r.date),
      Invoice: r.invoice,
      Kasir: r.cashier,
      Pelanggan: r.customer,
      "Jumlah Item": r.items,
      Subtotal: r.subtotal,
      Diskon: r.discount,
      Total: r.total,
      "Metode Bayar": paymentLabel[r.payment],
    }));

    // summary row
    rows.push({} as any);
    rows.push({
      Tanggal: "TOTAL",
      Invoice: "",
      Kasir: "",
      Pelanggan: `${totalTransactions} transaksi`,
      "Jumlah Item": totalItems,
      Subtotal: filtered.reduce((s, r) => s + r.subtotal, 0),
      Diskon: totalDiscount,
      Total: totalRevenue,
      "Metode Bayar": "",
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 28 },
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, `laporan-penjualan-${startDate}-sd-${endDate}.xlsx`);
  };

  const SortIcon = ({ col }: { col: keyof SaleRow }) => (
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
        {/* page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Laporan Penjualan
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Ringkasan transaksi & analisis keuntungan
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

        {/* filter card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="lg:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="lg:col-span-1 space-y-1.5">
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
            <div className="lg:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Pembayaran
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="all">Semua Metode</option>
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div className="lg:col-span-1 space-y-1.5">
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
                  placeholder="Invoice / pelanggan"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300"
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
            sub={`dari ${totalTransactions} transaksi`}
            icon={HiOutlineBanknotes}
            trend={12.4}
            color="bg-blue-50 text-blue-500"
          />
          <StatCard
            label="Total Item Terjual"
            value={totalItems.toLocaleString()}
            sub={`rata-rata ${(totalItems / (totalTransactions || 1)).toFixed(1)} item/trx`}
            icon={HiOutlineShoppingCart}
            trend={8.2}
            color="bg-emerald-50 text-emerald-500"
          />
          <StatCard
            label="Total Diskon"
            value={fmt(totalDiscount)}
            sub={`${((totalDiscount / (totalRevenue + totalDiscount || 1)) * 100).toFixed(1)}% dari subtotal`}
            icon={HiOutlineReceiptPercent}
            trend={-2.1}
            color="bg-amber-50 text-amber-500"
          />
          <StatCard
            label="Rata-rata Transaksi"
            value={fmt(avgTransaction)}
            sub="per transaksi"
            icon={HiOutlineUsers}
            trend={5.7}
            color="bg-violet-50 text-violet-500"
          />
        </div>

        {/* charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Tren Pendapatan
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Harian</p>
              </div>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {fmt(totalRevenue)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#aaa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#aaa" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmtShort}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [fmt(v), "Pendapatan"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">
              Metode Pembayaran
            </p>
            <p className="text-xs text-gray-400 mb-4">Distribusi transaksi</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((d, i) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS_PIE[i] }}
                    />
                    <span className="text-gray-500">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-700">{d.value} trx</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* cashier bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-1">
            Pendapatan per Kasir
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Total penjualan masing-masing kasir
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={cashierData}
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
                tick={{ fontSize: 10, fill: "#aaa" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtShort}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#555" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => [fmt(v), "Total"]}
              />
              <Bar dataKey="total" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">
                Detail Transaksi
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} transaksi ditemukan
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
                      ["customer", "Pelanggan"],
                      ["items", "Item"],
                      ["discount", "Diskon"],
                      ["payment", "Bayar"],
                      ["total", "Total"],
                    ] as [keyof SaleRow, string][]
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 select-none whitespace-nowrap"
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
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                      {fmtDate(row.date)}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-bold text-blue-600 whitespace-nowrap">
                      {row.invoice}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-semibold text-gray-600">
                      {row.cashier}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-gray-600">
                      {row.customer}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-center text-gray-600 font-semibold">
                      {row.items}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-emerald-600 font-semibold">
                      {row.discount > 0 ? `-${fmt(row.discount)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${paymentStyle[row.payment]}`}
                      >
                        {paymentLabel[row.payment]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-black text-gray-900 text-right whitespace-nowrap">
                      {fmt(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-3.5 text-[11px] font-bold text-gray-500"
                  >
                    Total ({filtered.length} transaksi)
                  </td>
                  <td className="px-5 py-3.5 text-[11px] font-bold text-center text-gray-700">
                    {totalItems}
                  </td>
                  <td className="px-5 py-3.5 text-[11px] font-bold text-emerald-600">
                    -{fmt(totalDiscount)}
                  </td>
                  <td />
                  <td className="px-5 py-3.5 text-[13px] font-black text-gray-900 text-right">
                    {fmt(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${
                        p === page
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

export default ReportMemberPoin;
