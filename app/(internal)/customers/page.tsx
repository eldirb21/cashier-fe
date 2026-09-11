"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Headers } from "@/app/components/atoms";
import { CustomerForm, useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { customerService } from "@/app/services/customer.service";
import { customers as defaultCustomers } from "@/app/libs/data";
import { Customer, MemberLevel } from "@/app/libs/types";
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineSquares2X2,
  HiOutlineTableCells,
  HiOutlineIdentification,
  HiOutlineChevronRight,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiOutlineShieldCheck,
  HiOutlineGift,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocument,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import * as XLSX from "xlsx";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (isoStr?: string) => {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
};

const TIER_CONFIG: Record<
  MemberLevel,
  {
    label: string;
    badge: string;
    border: string;
    text: string;
    bgSoft: string;
    gradient: string;
    desc: string;
  }
> = {
  platinum: {
    label: "Platinum",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    border: "border-purple-400",
    text: "text-purple-700",
    bgSoft: "bg-purple-50",
    gradient: "from-purple-600 to-indigo-700",
    desc: "Member VIP Tertinggi",
  },
  gold: {
    label: "Gold",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    border: "border-amber-400",
    text: "text-amber-700",
    bgSoft: "bg-amber-50",
    gradient: "from-amber-500 to-amber-600",
    desc: "Member Prioritas",
  },
  silver: {
    label: "Silver",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    border: "border-sky-300",
    text: "text-sky-700",
    bgSoft: "bg-sky-50",
    gradient: "from-sky-500 to-blue-600",
    desc: "Member Aktif",
  },
  regular: {
    label: "Regular",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    border: "border-slate-300",
    text: "text-slate-600",
    bgSoft: "bg-slate-50",
    gradient: "from-slate-500 to-slate-600",
    desc: "Member Standar",
  },
};

export default function CustomersPage() {
  const router = useRouter();
  const { confirm, showAlert } = useConfirm();

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter controls
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [tierFilter, setTierFilter] = useState<"all" | MemberLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "points_desc" | "spending_desc" | "newest"
  >("name_asc");

  // View mode & Pagination
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === "grid" ? 9 : 10;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | undefined>(undefined);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  // Quick Points Adjustment Modal State
  const [pointModalCustomer, setPointModalCustomer] = useState<Customer | null>(null);
  const [pointAction, setPointAction] = useState<"add" | "redeem">("add");
  const [pointAmount, setPointAmount] = useState<number>(50);
  const [pointSpending, setPointSpending] = useState<number>(0);
  const [pointNote, setPointNote] = useState<string>("");
  const [pointSaving, setPointSaving] = useState<boolean>(false);

  // Load Customers
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    try {
      // 1. Try to fetch from backend API
      const res = await customerService.getAll();
      if (Array.isArray(res) && res.length > 0) {
        setCustomers(res);
        if (typeof window !== "undefined") {
          localStorage.setItem("my_cashier_customers_data", JSON.stringify(res));
        }
      } else {
        // Fallback to localStorage or default data
        loadFromStorageOrDefault();
      }
    } catch {
      // Network or API error -> Fallback gracefully
      loadFromStorageOrDefault();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    function loadFromStorageOrDefault() {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("my_cashier_customers_data");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomers(parsed);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setCustomers(defaultCustomers);
      if (typeof window !== "undefined") {
        localStorage.setItem("my_cashier_customers_data", JSON.stringify(defaultCustomers));
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync state changes with localStorage
  const syncCustomersToStorage = (updatedList: Customer[]) => {
    setCustomers(updatedList);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("my_cashier_customers_data", JSON.stringify(updatedList));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // KPIs / Summary Statistics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.is_active !== false).length;
    const inactive = total - active;
    const goldCount = customers.filter((c) => c.member_level === "gold").length;
    const platinumCount = customers.filter((c) => c.member_level === "platinum").length;
    const vipCount = goldCount + platinumCount;
    const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);
    const totalSpending = customers.reduce((sum, c) => sum + (c.total_spending || 0), 0);

    return { total, active, inactive, vipCount, totalPoints, totalSpending };
  }, [customers]);

  // Filtering & Sorting
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Search filter
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase().trim();
          const matchName = c.name?.toLowerCase().includes(q);
          const matchPhone = c.phone?.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchCode = c.member_code?.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail && !matchCode) return false;
        }

        // Tier filter
        if (tierFilter !== "all" && c.member_level !== tierFilter) {
          return false;
        }

        // Status filter
        if (statusFilter === "active" && c.is_active === false) return false;
        if (statusFilter === "inactive" && c.is_active !== false) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
        if (sortBy === "points_desc") return (b.points || 0) - (a.points || 0);
        if (sortBy === "spending_desc") return (b.total_spending || 0) - (a.total_spending || 0);
        if (sortBy === "newest") {
          const tA = a.joined_at ? new Date(a.joined_at).getTime() : 0;
          const tB = b.joined_at ? new Date(b.joined_at).getTime() : 0;
          return tB - tA;
        }
        return 0;
      });
  }, [customers, debouncedSearch, tierFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Handle Delete with Confirmation
  const handleDelete = (customer: Customer) => {
    confirm({
      type: "danger",
      title: "Hapus Customer?",
      message: `Apakah Anda yakin ingin menghapus data customer "${customer.name}" (${customer.member_code || "Tanpa Kode"})? Riwayat poin dan data membership akan dihapus.`,
      onSave: async () => {
        try {
          await customerService.delete(customer.id);
        } catch (err) {
          console.warn("Backend delete error, removing locally:", err);
        }
        const updated = customers.filter((c) => c.id !== customer.id);
        syncCustomersToStorage(updated);
        showAlert(`Customer "${customer.name}" berhasil dihapus!`, "success");
      },
    });
  };

  // Handle Copy Member Code
  const handleCopyCode = (code?: string) => {
    if (!code) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      showAlert(`Kode member ${code} disalin ke clipboard!`, "success");
    }
  };

  // Quick Points Modal Submit
  const handlePointSubmit = async () => {
    if (!pointModalCustomer) return;
    if (pointAmount <= 0) {
      showAlert("Jumlah poin harus lebih dari 0!", "error");
      return;
    }

    if (pointAction === "redeem" && (pointModalCustomer.points || 0) < pointAmount) {
      showAlert("Poin customer tidak mencukupi untuk penukaran ini!", "error");
      return;
    }

    setPointSaving(true);
    const custId = pointModalCustomer.id;
    const currentPoints = pointModalCustomer.points || 0;
    const newPoints =
      pointAction === "add" ? currentPoints + pointAmount : currentPoints - pointAmount;

    try {
      if (pointAction === "add") {
        await customerService.addPoints(custId, {
          points: pointAmount,
          spending: pointSpending > 0 ? pointSpending : undefined,
        });
      } else {
        await customerService.redeemPoints(custId, { points: pointAmount });
      }
      showAlert(
        pointAction === "add"
          ? `Berhasil menambahkan +${pointAmount} poin untuk ${pointModalCustomer.name}!`
          : `Berhasil menukarkan -${pointAmount} poin untuk ${pointModalCustomer.name}!`,
        "success"
      );
    } catch {
      showAlert(
        pointAction === "add"
          ? `+${pointAmount} poin berhasil dicatat (lokal)!`
          : `-${pointAmount} poin berhasil ditukar (lokal)!`,
        "success"
      );
    } finally {
      // Local sync
      const updated = customers.map((c) =>
        c.id === custId
          ? {
              ...c,
              points: newPoints,
              total_spending:
                pointAction === "add" && pointSpending > 0
                  ? (c.total_spending || 0) + pointSpending
                  : c.total_spending,
            }
          : c
      );
      syncCustomersToStorage(updated);
      setPointSaving(false);
      setPointModalCustomer(null);
    }
  };

  // Export Customer List to Excel
  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      showAlert("Tidak ada data customer untuk diekspor!", "info");
      return;
    }

    const dataToExport = filteredCustomers.map((c, index) => ({
      No: index + 1,
      "Kode Member": c.member_code || "-",
      "Nama Lengkap": c.name,
      "Tier Member": (c.member_level || "regular").toUpperCase(),
      "No. WhatsApp / HP": c.phone || "-",
      Email: c.email || "-",
      Alamat: c.address || "-",
      "Jenis Kelamin":
        c.gender === "male" ? "Laki-laki" : c.gender === "female" ? "Perempuan" : "Lainnya",
      "Tanggal Lahir": formatDate(c.birth_date),
      "Poin Loyalitas": c.points || 0,
      "Total Belanja (IDR)": c.total_spending || 0,
      Status: c.is_active !== false ? "Aktif" : "Nonaktif",
      "Tanggal Bergabung": formatDate(c.joined_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Customer");
    XLSX.writeFile(
      workbook,
      `Daftar_Customer_Member_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showAlert("Data customer berhasil diekspor ke Excel!", "success");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* TOP BAR: Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
              <HiOutlineUserGroup size={26} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                Manajemen Pelanggan & Member
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Kelola direktori pelanggan, tier membership loyalitas, poin dan akumulasi belanja.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Refresh Button */}
            <button
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
              title="Perbarui Data"
            >
              <HiOutlineArrowPath
                size={16}
                className={refreshing ? "animate-spin text-blue-600" : "text-gray-500"}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-xs"
              title="Download Excel"
            >
              <HiOutlineArrowDownTray size={16} className="text-emerald-700" />
              <span>Export Excel</span>
            </button>

            {/* Add Customer Primary Button */}
            <button
              onClick={() => {
                setEditingCustomerId(undefined);
                setFormModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5bb8] hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
            >
              <HiOutlinePlus size={18} />
              <span>Tambah Customer</span>
            </button>
          </div>
        </div>

        {/* METRICS & KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Pelanggan */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total Pelanggan
              </span>
              <div className="text-2xl font-black text-gray-900">{stats.total}</div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span className="text-emerald-600 font-semibold">{stats.active} Aktif</span>
                <span>•</span>
                <span className="text-slate-400">{stats.inactive} Nonaktif</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HiOutlineUserGroup size={22} />
            </div>
          </div>

          {/* Card 2: Member VIP (Gold & Platinum) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Member VIP
              </span>
              <div className="text-2xl font-black text-amber-600">{stats.vipCount}</div>
              <p className="text-[11px] text-gray-500">Gold & Platinum Tier</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HiOutlineShieldCheck size={22} />
            </div>
          </div>

          {/* Card 3: Total Poin Member */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Poin Beredar
              </span>
              <div className="text-2xl font-black text-purple-700">
                {stats.totalPoints.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-gray-500">Poin Aktif Pelanggan</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HiOutlineSparkles size={22} />
            </div>
          </div>

          {/* Card 4: Akumulasi Belanja */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Total Belanja Member
              </span>
              <div className="text-lg font-black text-emerald-700 truncate">
                {formatRupiah(stats.totalSpending)}
              </div>
              <p className="text-[11px] text-gray-500">Lifetime Spending</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HiOutlineCurrencyDollar size={22} />
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: Search, Tier Filters, Status, Sort & View Mode */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <HiOutlineMagnifyingGlass
                size={18}
                className="absolute left-3.5 top-3 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari berdasarkan nama, kode member, no. hp / whatsapp, email..."
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <HiXMark size={16} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-auto px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="points_desc">Poin Tertinggi</option>
                <option value="spending_desc">Belanja Tertinggi</option>
                <option value="newest">Terdaftar Terbaru</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif Saja</option>
                <option value="inactive">Nonaktif Saja</option>
              </select>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  title="Tampilan Grid Card"
                >
                  <HiOutlineSquares2X2 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  title="Tampilan Tabel"
                >
                  <HiOutlineTableCells size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tier Pills Filter */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Tier:
            </span>
            {[
              { val: "all", label: "Semua Tier", count: customers.length },
              {
                val: "regular",
                label: "Regular",
                count: customers.filter((c) => c.member_level === "regular").length,
              },
              {
                val: "silver",
                label: "Silver",
                count: customers.filter((c) => c.member_level === "silver").length,
              },
              {
                val: "gold",
                label: "Gold",
                count: customers.filter((c) => c.member_level === "gold").length,
              },
              {
                val: "platinum",
                label: "Platinum",
                count: customers.filter((c) => c.member_level === "platinum").length,
              },
            ].map((t) => {
              const active = tierFilter === t.val;
              return (
                <button
                  key={t.val}
                  onClick={() => {
                    setTierFilter(t.val as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING SPINNER */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Memuat direktori customer...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100">
              <HiOutlineUserGroup size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Tidak Ada Customer Ditemukan
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              {search || tierFilter !== "all" || statusFilter !== "all"
                ? "Coba ubah kata kunci pencarian atau sesuaikan filter tier/status customer Anda."
                : "Belum ada customer terdaftar. Mulai registrasi member pelanggan pertama Anda!"}
            </p>
            {(search || tierFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setTierFilter("all");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ========================================================== */
          /* GRID CARDS VIEW                                            */
          /* ========================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCustomers.map((cust) => {
              const level = cust.member_level || "regular";
              const tierInfo = TIER_CONFIG[level] || TIER_CONFIG.regular;
              const isActive = cust.is_active !== false;

              // Generate initials
              const initials = cust.name
                ? cust.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "CU";

              return (
                <div
                  key={cust.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header Top Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${tierInfo.gradient}`} />

                  <div className="p-5 space-y-4 flex-1">
                    {/* Customer Profile Head */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tierInfo.gradient} text-white flex items-center justify-center font-black text-sm shadow-xs`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {cust.name}
                            </h3>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                              title={isActive ? "Member Aktif" : "Member Nonaktif"}
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Gabung: {formatDate(cust.joined_at)}
                          </p>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${tierInfo.badge}`}
                      >
                        {tierInfo.label}
                      </span>
                    </div>

                    {/* Member Code with Copy Button */}
                    <div className="flex items-center justify-between bg-gray-50/80 border border-gray-200/70 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <HiOutlineIdentification className="text-blue-600" size={16} />
                        <span className="text-xs font-mono font-bold tracking-wider">
                          {cust.member_code || "TANPA KODE"}
                        </span>
                      </div>
                      {cust.member_code && (
                        <button
                          onClick={() => handleCopyCode(cust.member_code)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Salin Kode Member"
                        >
                          <HiOutlineClipboardDocument size={15} />
                        </button>
                      )}
                    </div>

                    {/* Contact details */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {cust.phone && (
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                        >
                          <HiOutlinePhone className="text-emerald-500" size={14} />
                          <span className="font-mono font-medium">{cust.phone}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-bold">
                            WA
                          </span>
                        </a>
                      )}
                      {cust.email && (
                        <div className="flex items-center gap-2 truncate text-gray-500">
                          <HiOutlineEnvelope className="text-gray-400" size={14} />
                          <span className="truncate">{cust.email}</span>
                        </div>
                      )}
                      {cust.address && (
                        <div className="flex items-start gap-2 text-[11px] text-gray-500 line-clamp-1">
                          <HiOutlineMapPin className="text-gray-400 shrink-0 mt-0.5" size={14} />
                          <span className="truncate">{cust.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights: Poin & Total Belanja */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                        <div className="flex items-center gap-1 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          <HiOutlineSparkles size={12} />
                          <span>Poin Member</span>
                        </div>
                        <span className="text-sm font-black text-purple-900">
                          {(cust.points || 0).toLocaleString("id-ID")}{" "}
                          <span className="text-[10px] font-normal text-purple-600">Pts</span>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <div className="flex items-center gap-1 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          <HiOutlineCurrencyDollar size={12} />
                          <span>Total Belanja</span>
                        </div>
                        <span className="text-xs font-black text-emerald-900 truncate block">
                          {formatRupiah(cust.total_spending || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Detail Button */}
                      <button
                        onClick={() => setDetailCustomer(cust)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Lihat Detail"
                      >
                        <HiOutlineEye size={14} />
                        <span>Detail</span>
                      </button>

                      {/* Quick Adjust Poin */}
                      <button
                        onClick={() => {
                          setPointModalCustomer(cust);
                          setPointAction("add");
                          setPointAmount(50);
                          setPointSpending(0);
                          setPointNote("");
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Tambah/Tukar Poin"
                      >
                        <HiOutlineGift size={14} />
                        <span>Poin</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingCustomerId(cust.id);
                          setFormModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-all"
                        title="Edit Data Customer"
                      >
                        <HiOutlinePencilSquare size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(cust)}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                        title="Hapus Customer"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================== */
          /* TABLE VIEW                                                 */
          /* ========================================================== */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Tier & Status</th>
                    <th className="px-5 py-4">Kontak</th>
                    <th className="px-5 py-4 text-center">Poin Loyalitas</th>
                    <th className="px-5 py-4 text-right">Total Belanja</th>
                    <th className="px-5 py-4">Bergabung</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedCustomers.map((cust) => {
                    const level = cust.member_level || "regular";
                    const tierInfo = TIER_CONFIG[level] || TIER_CONFIG.regular;
                    const isActive = cust.is_active !== false;

                    const initials = cust.name
                      ? cust.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "CU";

                    return (
                      <tr key={cust.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* Customer Column */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${tierInfo.gradient} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{cust.name}</p>
                              <p className="font-mono text-[11px] text-gray-500">
                                {cust.member_code || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tier & Status */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${tierInfo.badge}`}
                            >
                              {tierInfo.label}
                            </span>
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                  isActive ? "text-emerald-600" : "text-gray-400"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isActive ? "bg-emerald-500" : "bg-gray-300"
                                  }`}
                                />
                                {isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kontak */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {cust.phone ? (
                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-gray-700 hover:text-emerald-600 flex items-center gap-1"
                              >
                                <HiOutlinePhone className="text-emerald-500" size={13} />
                                {cust.phone}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                            {cust.email && (
                              <p className="text-gray-400 text-[11px] truncate max-w-[150px]">
                                {cust.email}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Poin Loyalitas */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 font-extrabold border border-purple-200">
                            <HiOutlineSparkles className="text-purple-600" size={13} />
                            {(cust.points || 0).toLocaleString("id-ID")}
                          </span>
                        </td>

                        {/* Total Belanja */}
                        <td className="px-5 py-4 text-right font-bold text-emerald-700">
                          {formatRupiah(cust.total_spending || 0)}
                        </td>

                        {/* Bergabung */}
                        <td className="px-5 py-4 text-gray-500 text-[11px]">
                          {formatDate(cust.joined_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setDetailCustomer(cust)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                              title="Detail"
                            >
                              <HiOutlineEye size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setPointModalCustomer(cust);
                                setPointAction("add");
                                setPointAmount(50);
                                setPointSpending(0);
                                setPointNote("");
                              }}
                              className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                              title="Tambah/Tukar Poin"
                            >
                              <HiOutlineGift size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCustomerId(cust.id);
                                setFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
                              title="Edit"
                            >
                              <HiOutlinePencilSquare size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(cust)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Hapus"
                            >
                              <HiOutlineTrash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && filteredCustomers.length > pageSize && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">
              Menampilkan <span className="font-bold text-gray-800">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-bold text-gray-800">
                {Math.min(currentPage * pageSize, filteredCustomers.length)}
              </span>{" "}
              dari <span className="font-bold text-gray-800">{filteredCustomers.length}</span> customer
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
              >
                <HiChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prevP && p - prevP > 1 && (
                          <span className="px-1 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-xl font-bold transition-all text-xs ${
                            currentPage === p
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
              >
                <HiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================== */}
      {/* INLINE MODAL: ADD / EDIT CUSTOMER                          */}
      {/* ========================================================== */}
      {formModalOpen && (
        <CustomerForm
          id={editingCustomerId}
          onClose={() => {
            setFormModalOpen(false);
            setEditingCustomerId(undefined);
          }}
          onSuccess={() => {
            setFormModalOpen(false);
            setEditingCustomerId(undefined);
            loadData();
          }}
        />
      )}

      {/* ========================================================== */}
      {/* MODAL: CUSTOMER DETAIL OVERVIEW                            */}
      {/* ========================================================== */}
      {detailCustomer && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            {(() => {
              const lvl = detailCustomer.member_level || "regular";
              const tInfo = TIER_CONFIG[lvl] || TIER_CONFIG.regular;
              const initials = detailCustomer.name
                ? detailCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "CU";

              return (
                <div>
                  <div className={`p-6 bg-gradient-to-r ${tInfo.gradient} text-white relative`}>
                    <button
                      onClick={() => setDetailCustomer(null)}
                      className="absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
                    >
                      <HiXMark size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center font-black text-xl shadow-md">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black">{detailCustomer.name}</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/25 text-white border border-white/40">
                            {tInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 font-mono mt-1">
                          {detailCustomer.member_code || "Member Tanpa Kode"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                          Poin Loyalitas
                        </span>
                        <div className="text-xl font-black text-purple-900">
                          {(detailCustomer.points || 0).toLocaleString("id-ID")}{" "}
                          <span className="text-xs font-normal text-purple-600">Poin</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                          Total Belanja
                        </span>
                        <div className="text-lg font-black text-emerald-900 truncate">
                          {formatRupiah(detailCustomer.total_spending || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Detail Information Fields */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Nomor WhatsApp / HP</span>
                        <span className="font-mono font-bold text-gray-800">
                          {detailCustomer.phone || "-"}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Alamat Email</span>
                        <span className="font-semibold text-gray-800">
                          {detailCustomer.email || "-"}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Jenis Kelamin</span>
                        <span className="font-semibold text-gray-800">
                          {detailCustomer.gender === "male"
                            ? "Laki-laki"
                            : detailCustomer.gender === "female"
                            ? "Perempuan"
                            : "Lainnya"}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Tanggal Lahir</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(detailCustomer.birth_date)}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Status Akun</span>
                        <span
                          className={`font-bold ${
                            detailCustomer.is_active !== false
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {detailCustomer.is_active !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Tanggal Bergabung</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(detailCustomer.joined_at)}
                        </span>
                      </div>

                      <div className="py-1">
                        <span className="text-gray-500 font-medium block mb-1">Alamat Lengkap</span>
                        <p className="text-gray-700 font-medium leading-relaxed">
                          {detailCustomer.address || "Belum ada catatan alamat."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-2">
                    {detailCustomer.phone ? (
                      <a
                        href={`https://wa.me/${detailCustomer.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <HiOutlineChatBubbleLeftRight size={16} />
                        Chat WhatsApp
                      </a>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const cust = detailCustomer;
                          setDetailCustomer(null);
                          setPointModalCustomer(cust);
                          setPointAction("add");
                        }}
                        className="px-4 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <HiOutlineSparkles size={15} />
                        Sesuaikan Poin
                      </button>

                      <button
                        onClick={() => {
                          const id = detailCustomer.id;
                          setDetailCustomer(null);
                          setEditingCustomerId(id);
                          setFormModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <HiOutlinePencilSquare size={15} />
                        Edit Data
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: QUICK POINT ADJUSTMENT (ADD / REDEEM)               */}
      {/* ========================================================== */}
      {pointModalCustomer && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <HiOutlineGift size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Penyesuaian Poin Loyalitas
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    Customer: {pointModalCustomer.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPointModalCustomer(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <HiXMark size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Current Points Pill */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700">Saldo Poin Sekarang</span>
                <span className="text-base font-black text-purple-900 font-mono">
                  {(pointModalCustomer.points || 0).toLocaleString("id-ID")} Pts
                </span>
              </div>

              {/* Action Tabs: Add vs Redeem */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPointAction("add")}
                  className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                    pointAction === "add"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  + Tambah Poin
                </button>
                <button
                  type="button"
                  onClick={() => setPointAction("redeem")}
                  className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                    pointAction === "redeem"
                      ? "bg-white text-purple-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  - Tukar Poin (Redeem)
                </button>
              </div>

              {/* Amount of Points */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Jumlah Poin {pointAction === "add" ? "Ditambahkan" : "Dipotong / Ditukar"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Optional spending when adding points */}
              {pointAction === "add" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nominal Transaksi Belanja (Opsional IDR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="0"
                    value={pointSpending || ""}
                    onChange={(e) => setPointSpending(Number(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Keterangan / Alasan
                </label>
                <input
                  type="text"
                  placeholder={
                    pointAction === "add"
                      ? "Contoh: Bonus promo akhir pekan / kompensasi"
                      : "Contoh: Penukaran voucher diskon Rp 25.000"
                  }
                  value={pointNote}
                  onChange={(e) => setPointNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Projected Points Calculation */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Estimasi Saldo Baru:</span>
                <span className="font-extrabold text-purple-900 font-mono">
                  {Math.max(
                    0,
                    pointAction === "add"
                      ? (pointModalCustomer.points || 0) + pointAmount
                      : (pointModalCustomer.points || 0) - pointAmount
                  ).toLocaleString("id-ID")}{" "}
                  Poin
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPointModalCustomer(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pointSaving}
                onClick={handlePointSubmit}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {pointSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <HiOutlineCheckCircle size={16} />
                    <span>Konfirmasi {pointAction === "add" ? "Tambah" : "Tukar"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
