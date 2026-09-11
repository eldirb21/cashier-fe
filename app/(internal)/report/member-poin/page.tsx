"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Headers } from "@/app/components/atoms";
import { customerService } from "@/app/services/customer.service";
import { transactionService } from "@/app/services/transaction.service";
import { Customer, MemberLevel, TransactionRecord } from "@/app/libs/types";
import {
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineGift,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronRight,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTag,
} from "react-icons/hi2";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

export type PointActivityType = "EARN" | "REDEEM" | "BONUS" | "ADJUST";

export interface PointMovementItem {
  id: string;
  date: string;
  refNo: string;
  customerName: string;
  memberCode: string;
  type: PointActivityType;
  pointsChange: number;
  spendingAmount?: number;
  remainingPoints: number;
  description: string;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (isoStr: string) => {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (isoStr: string) => {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "CUST-001",
    name: "Budi Santoso",
    phone: "081298765401",
    email: "budi.santoso@gmail.com",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    gender: "male",
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
    member_code: "MBR-RINA-006",
    member_level: "gold",
    points: 780,
    total_spending: 7800000,
    is_active: true,
    joined_at: "2026-02-14T08:00:00.000Z",
  },
];

const DEFAULT_MOVEMENTS: PointMovementItem[] = [
  {
    id: "MOV-001",
    date: "2026-08-20T10:15:00.000Z",
    refNo: "TRX-20260820-10001",
    customerName: "Budi Santoso",
    memberCode: "MBR-BUDI-001",
    type: "EARN",
    pointsChange: 20,
    spendingAmount: 200000,
    remainingPoints: 620,
    description: "Perolehan Poin Belanja Faktur #TRX-10001",
  },
  {
    id: "MOV-002",
    date: "2026-08-21T13:40:00.000Z",
    refNo: "RDM-20260821-0042",
    customerName: "Hendra Gunawan",
    memberCode: "MBR-HNDR-003",
    type: "REDEEM",
    pointsChange: -100,
    remainingPoints: 1250,
    description: "Penukaran 100 Poin untuk Diskon Belanja Rp 10.000",
  },
  {
    id: "MOV-003",
    date: "2026-08-22T09:00:00.000Z",
    refNo: "BNS-20260822-0018",
    customerName: "Siti Nurhaliza",
    memberCode: "MBR-SITI-002",
    type: "BONUS",
    pointsChange: 50,
    remainingPoints: 280,
    description: "Bonus Reward Poin Spesial Member Day",
  },
  {
    id: "MOV-004",
    date: "2026-08-23T15:30:00.000Z",
    refNo: "TRX-20260823-10045",
    customerName: "Rina Wijayanti",
    memberCode: "MBR-RINA-006",
    type: "EARN",
    pointsChange: 35,
    spendingAmount: 350000,
    remainingPoints: 780,
    description: "Perolehan Poin Belanja Faktur #TRX-10045",
  },
  {
    id: "MOV-005",
    date: "2026-08-24T11:20:00.000Z",
    refNo: "RDM-20260824-0089",
    customerName: "Ahmad Fauzi",
    memberCode: "MBR-FAUZ-005",
    type: "REDEEM",
    pointsChange: -50,
    remainingPoints: 340,
    description: "Penukaran 50 Poin untuk Voucher Gratis Aqua Galon",
  },
];

export default function MemberAndPointsPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "movements">("directory");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customMovements, setCustomMovements] = useState<PointMovementItem[]>([]);

  // Filters for Directory
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<"all" | MemberLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"points_desc" | "spending_desc" | "name_asc" | "joined_desc">("points_desc");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Filters for Movements
  const [movementSearch, setMovementSearch] = useState<string>("");
  const [movementTypeFilter, setMovementTypeFilter] = useState<"all" | PointActivityType>("all");
  const [movementPage, setMovementPage] = useState<number>(1);

  // Modal State for Points Adjustment
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCustomerForPoints, setSelectedCustomerForPoints] = useState<Customer | null>(null);
  const [pointAction, setPointAction] = useState<"add" | "redeem">("add");
  const [pointQty, setPointQty] = useState<number>(50);
  const [pointNote, setPointNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load backend customers & transactions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [custRes, trxRes] = await Promise.allSettled([
        customerService.getAll(),
        transactionService.getTransactionList(),
      ]);

      let loadedCust: Customer[] = [];
      if (custRes.status === "fulfilled" && Array.isArray(custRes.value)) {
        loadedCust = custRes.value;
      }

      if (loadedCust.length === 0) {
        setCustomers(DEFAULT_CUSTOMERS);
      } else {
        const existingIds = new Set(loadedCust.map((c) => c.id));
        const merged = [
          ...loadedCust,
          ...DEFAULT_CUSTOMERS.filter((c) => !existingIds.has(c.id)),
        ];
        setCustomers(merged);
      }

      if (trxRes.status === "fulfilled" && trxRes.value?.data) {
        setTransactions(trxRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load customer report data:", err);
      setCustomers(DEFAULT_CUSTOMERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Executive KPI summary calculations
  const kpi = useMemo(() => {
    const totalCount = customers.length;
    const activeCount = customers.filter((c) => c.is_active !== false).length;
    const totalCirculatingPoints = customers.reduce(
      (sum, c) => sum + (Number(c.points) || 0),
      0
    );
    const totalLifetimeSpending = customers.reduce(
      (sum, c) => sum + (Number(c.total_spending) || 0),
      0
    );

    const vipCount = customers.filter(
      (c) => c.member_level === "gold" || c.member_level === "platinum"
    ).length;
    const vipRatio = Math.round((vipCount / (totalCount || 1)) * 100);

    return {
      totalCount,
      activeCount,
      totalCirculatingPoints,
      totalLifetimeSpending,
      vipRatio,
    };
  }, [customers]);

  // Tier Donut Distribution Data
  const tierDistributionData = useMemo(() => {
    const counts = {
      regular: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    customers.forEach((c) => {
      const lvl = (c.member_level || "regular").toLowerCase() as MemberLevel;
      if (counts[lvl] !== undefined) {
        counts[lvl]++;
      } else {
        counts.regular++;
      }
    });

    return [
      { name: "Regular", value: counts.regular, color: "#3b82f6" },
      { name: "Silver", value: counts.silver, color: "#94a3b8" },
      { name: "Gold", value: counts.gold, color: "#f59e0b" },
      { name: "Platinum", value: counts.platinum, color: "#8b5cf6" },
    ].filter((d) => d.value > 0);
  }, [customers]);

  // Top Spender Bar Chart
  const topSpendersBarData = useMemo(() => {
    return [...customers]
      .sort(
        (a, b) =>
          (Number(b.total_spending) || 0) - (Number(a.total_spending) || 0)
      )
      .slice(0, 5)
      .map((c) => ({
        name: c.name.length > 15 ? `${c.name.slice(0, 13)}...` : c.name,
        spending: Number(c.total_spending) || 0,
        points: Number(c.points) || 0,
      }));
  }, [customers]);

  // All Point Movements Log
  const allMovements = useMemo(() => {
    const list: PointMovementItem[] = [...customMovements];

    // Combine from transactions if customer is linked
    transactions.forEach((trx) => {
      if (trx.customer_id) {
        const cust = customers.find((c) => c.id === trx.customer_id);
        const amt = Number(trx.grand_total) || 0;
        const earned = Math.floor(amt / 10000); // 1 poin per Rp 10.000

        if (earned > 0) {
          list.push({
            id: `MOV-TRX-${trx.id}`,
            date: trx.created_at,
            refNo: trx.invoice_number,
            customerName: cust?.name || trx.customer_name || "Pelanggan Member",
            memberCode: cust?.member_code || "MBR-VIP",
            type: "EARN",
            pointsChange: earned,
            spendingAmount: amt,
            remainingPoints: cust?.points || 100,
            description: `Perolehan Poin Transaksi Kasir (${formatRupiah(amt)})`,
          });
        }
      }
    });

    if (list.length < 5) {
      list.push(...DEFAULT_MOVEMENTS);
    }

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [customMovements, transactions, customers]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.member_code && c.member_code.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

      const matchLevel =
        levelFilter === "all" || (c.member_level || "regular") === levelFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? c.is_active !== false : c.is_active === false);

      return matchSearch && matchLevel && matchStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "points_desc")
        return (Number(b.points) || 0) - (Number(a.points) || 0);
      if (sortBy === "spending_desc")
        return (Number(b.total_spending) || 0) - (Number(a.total_spending) || 0);
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "joined_desc")
        return (
          new Date(b.joined_at || b.created_at || "").getTime() -
          new Date(a.joined_at || a.created_at || "").getTime()
        );
      return 0;
    });

    return result;
  }, [customers, search, levelFilter, statusFilter, sortBy]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return allMovements.filter((m) => {
      const matchSearch =
        !movementSearch ||
        m.customerName.toLowerCase().includes(movementSearch.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(movementSearch.toLowerCase()) ||
        m.refNo.toLowerCase().includes(movementSearch.toLowerCase());

      const matchType =
        movementTypeFilter === "all" || m.type === movementTypeFilter;

      return matchSearch && matchType;
    });
  }, [allMovements, movementSearch, movementTypeFilter]);

  // Pagination slice
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;

  const paginatedMovements = useMemo(() => {
    const start = (movementPage - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, movementPage]);

  const totalMovementPages = Math.ceil(filteredMovements.length / pageSize) || 1;

  // Open Manage Points Modal
  const handleOpenPointsModal = (customer: Customer) => {
    setSelectedCustomerForPoints(customer);
    setPointAction("add");
    setPointQty(50);
    setPointNote("");
    setIsModalOpen(true);
  };

  // Submit Point Change to Backend API
  const handleSubmitPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPoints) return;

    setIsSubmitting(true);
    try {
      const currentPts = Number(selectedCustomerForPoints.points) || 0;
      let newPts = currentPts;

      if (pointAction === "add") {
        newPts = currentPts + Number(pointQty);
        await customerService.addPoints(selectedCustomerForPoints.id, {
          points: Number(pointQty),
        });
      } else {
        if (Number(pointQty) > currentPts) {
          alert("Poin member tidak mencukupi untuk penukaran ini.");
          setIsSubmitting(false);
          return;
        }
        newPts = Math.max(0, currentPts - Number(pointQty));
        await customerService.redeemPoints(selectedCustomerForPoints.id, {
          points: Number(pointQty),
        });
      }

      // Append to movement log
      const newMov: PointMovementItem = {
        id: `MOV-${Date.now()}`,
        date: new Date().toISOString(),
        refNo:
          pointAction === "add"
            ? `BNS-${Date.now().toString().slice(-6)}`
            : `RDM-${Date.now().toString().slice(-6)}`,
        customerName: selectedCustomerForPoints.name,
        memberCode: selectedCustomerForPoints.member_code || "-",
        type: pointAction === "add" ? "BONUS" : "REDEEM",
        pointsChange: pointAction === "add" ? Number(pointQty) : -Number(pointQty),
        remainingPoints: newPts,
        description:
          pointNote ||
          (pointAction === "add"
            ? "Penambahan Poin Manual dari Kasir"
            : "Penukaran Poin Hadiah / Diskon"),
      };

      setCustomMovements((prev) => [newMov, ...prev]);

      // Update local state and reload
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomerForPoints.id ? { ...c, points: newPts } : c
        )
      );

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to update points:", err);
      // Fallback local update if network issue
      const currentPts = Number(selectedCustomerForPoints.points) || 0;
      const newPts =
        pointAction === "add"
          ? currentPts + Number(pointQty)
          : Math.max(0, currentPts - Number(pointQty));
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomerForPoints.id ? { ...c, points: newPts } : c
        )
      );
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Direktori Member
    const memberRows = filteredCustomers.map((c, idx) => ({
      No: idx + 1,
      "No. Member": c.member_code || "-",
      "Nama Lengkap": c.name,
      Level: (c.member_level || "regular").toUpperCase(),
      "Saldo Poin": c.points || 0,
      "Total Akumulasi Belanja": c.total_spending || 0,
      "No. Telepon": c.phone || "-",
      Email: c.email || "-",
      Alamat: c.address || "-",
      "Tanggal Bergabung": formatDate(c.joined_at || c.created_at || ""),
      Status: c.is_active !== false ? "Aktif" : "Non-Aktif",
    }));
    const wsMembers = XLSX.utils.json_to_sheet(memberRows);
    XLSX.utils.book_append_sheet(wb, wsMembers, "Katalog Member & Loyalitas");

    // Sheet 2: Riwayat Mutasi Poin
    const movementRows = filteredMovements.map((m, idx) => ({
      No: idx + 1,
      Tanggal: formatDateTime(m.date),
      "No. Referensi": m.refNo,
      "Nama Member": m.customerName,
      "Kode Member": m.memberCode,
      Aktivitas:
        m.type === "EARN"
          ? "Perolehan (+)"
          : m.type === "REDEEM"
          ? "Penukaran (-)"
          : "Bonus (+)",
      "Perubahan Poin": m.pointsChange,
      "Saldo Poin Akhir": m.remainingPoints,
      "Nominal Belanja": m.spendingAmount || "-",
      Keterangan: m.description,
    }));
    const wsMovements = XLSX.utils.json_to_sheet(movementRows);
    XLSX.utils.book_append_sheet(wb, wsMovements, "Histori Mutasi Poin");

    XLSX.writeFile(
      wb,
      `Laporan_Member_dan_Poin_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Breadcrumb & Main Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
              <Link href="/dashboard" className="hover:text-gray-700">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/report" className="hover:text-blue-600">
                Laporan & Analitik
              </Link>
              <span>/</span>
              <span className="text-blue-600">Member & Poin</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <HiOutlineSparkles className="text-amber-500 w-7 h-7" />
              Laporan Loyalitas Member & Poin
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Monitoring pelanggan setia, sebaran tier loyalitas, akumulasi belanja member, dan histori perputaran poin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Refresh */}
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Perbarui Data"
            >
              <HiOutlineArrowPath
                size={18}
                className={isLoading ? "animate-spin text-blue-600" : ""}
              />
            </button>

            {/* Master Customers Link */}
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs transition-all"
            >
              <HiOutlineUsers size={16} />
              Kelola Master Pelanggan
            </Link>

            {/* Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <HiOutlineArrowDownTray size={16} />
              Ekspor Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Member */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Anggota Terdaftar
              </p>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <HiOutlineUsers size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {kpi.totalCount}{" "}
              <span className="text-xs font-medium text-gray-400">member</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {kpi.activeCount} Anggota aktif bertransaksi
            </p>
          </div>

          {/* 2. Total Poin Beredar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Poin Beredar
              </p>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <HiOutlineSparkles size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">
              {kpi.totalCirculatingPoints.toLocaleString("id-ID")}{" "}
              <span className="text-xs font-medium text-amber-400">pts</span>
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Siap ditukar voucher belanja
            </p>
          </div>

          {/* 3. Total Omset Dari Member */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Kontribusi Omset Member
              </p>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <HiOutlineBanknotes size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              {formatRupiah(kpi.totalLifetimeSpending)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Akumulasi nilai transaksi pelanggan setia
            </p>
          </div>

          {/* 4. Rasio Member Prioritas */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Member VIP (Gold & Plat.)
              </p>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <HiOutlineGift size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {kpi.vipRatio}%
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              Tingkat retensi pelanggan bernilai tinggi
            </p>
          </div>
        </div>

        {/* Charts: Tier Distribution & Top Member Spenders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Donut Level Tier */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                Sebaran Level Keanggotaan
              </h2>
              <p className="text-xs text-gray-400">
                Proporsi member Regular, Silver, Gold, dan Platinum
              </p>
            </div>

            <div className="h-[240px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} Anggota (${(
                        (Number(val) / (kpi.totalCount || 1)) *
                        100
                      ).toFixed(1)}%)`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Pie
                    data={tierDistributionData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Program Loyalitas</span>
              <span className="font-bold text-amber-600">4 Level Bertingkat</span>
            </div>
          </div>

          {/* Chart 2: Top 5 Spender Member */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                  Top 5 Member Paling Loyal (Lifetime Spending)
                </h2>
                <p className="text-xs text-gray-400">
                  Pelanggan dengan akumulasi nominal belanja tertinggi di toko
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                Top Spender
              </span>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSpendersBarData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    interval={0}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), "Total Belanja"]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="spending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 px-6 pt-4 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "directory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <HiOutlineUsers size={18} />
              Direktori Member ({filteredCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("movements")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "movements"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <HiOutlineSparkles size={18} />
              Riwayat Mutasi Poin ({filteredMovements.length})
            </button>
          </div>

          {/* TAB 1: DIREKTORI MEMBER */}
          {activeTab === "directory" && (
            <div className="p-6 space-y-6">
              {/* Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama member, no. kartu, telepon, email..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HiXMark size={14} />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={levelFilter}
                    onChange={(e) => {
                      setLevelFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">Semua Level Tier</option>
                    <option value="regular">Regular</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Member Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="points_desc">Poin: Terbanyak &rarr; Sedikit</option>
                    <option value="spending_desc">Belanja: Terbesar &rarr; Terkecil</option>
                    <option value="name_asc">Nama: A - Z</option>
                    <option value="joined_desc">Bergabung: Terbaru</option>
                  </select>
                </div>
              </div>

              {/* Table Members */}
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Nama & No. Kartu</th>
                      <th className="py-3.5 px-4">Kontak</th>
                      <th className="py-3.5 px-4 text-center">Level Tier</th>
                      <th className="py-3.5 px-4 text-center">Saldo Poin</th>
                      <th className="py-3.5 px-4 text-right">Akumulasi Belanja</th>
                      <th className="py-3.5 px-4">Tgl Bergabung</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                          <p>Memuat data pelanggan member...</p>
                        </td>
                      </tr>
                    ) : paginatedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <HiOutlineUsers className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="font-semibold text-gray-600">Tidak ada member ditemukan</p>
                          <p className="text-[11px] mt-0.5">Coba ubah kata kunci atau filter pencarian Anda.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((c) => {
                        const level = (c.member_level || "regular").toLowerCase();
                        const isGold = level === "gold";
                        const isPlat = level === "platinum";
                        const isSilver = level === "silver";

                        return (
                          <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-gray-900">{c.name}</p>
                              <span className="font-mono text-[10px] text-amber-600 font-semibold">
                                {c.member_code || c.id}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="text-gray-800 font-medium">{c.phone || "-"}</p>
                              <p className="text-[10px] text-gray-400">{c.email || "-"}</p>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isPlat ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  PLATINUM
                                </span>
                              ) : isGold ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  GOLD
                                </span>
                              ) : isSilver ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                  SILVER
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  REGULAR
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-sm font-black text-amber-600">
                                {(Number(c.points) || 0).toLocaleString("id-ID")}
                              </span>
                              <span className="text-[10px] text-gray-400 block font-medium">pts</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                              {formatRupiah(Number(c.total_spending) || 0)}
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 font-medium">
                              {formatDate(c.joined_at || c.created_at || "")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {c.is_active !== false ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <HiOutlineCheckCircle className="w-3 h-3" /> Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                                  Non-Aktif
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenPointsModal(c)}
                                className="px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 rounded-lg transition-all cursor-pointer"
                              >
                                Kelola Poin
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-800">
                    {filteredCustomers.length === 0
                      ? 0
                      : (page - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-gray-800">
                    {Math.min(page * pageSize, filteredCustomers.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-gray-800">
                    {filteredCustomers.length}
                  </span>{" "}
                  member
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <HiChevronLeft size={16} />
                  </button>
                  <span className="text-xs px-3 font-semibold text-gray-700">
                    Hal. {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <HiChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT MUTASI POIN */}
          {activeTab === "movements" && (
            <div className="p-6 space-y-6">
              {/* Filter Controls for Movements */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={movementSearch}
                    onChange={(e) => {
                      setMovementSearch(e.target.value);
                      setMovementPage(1);
                    }}
                    placeholder="Cari member, no. kartu, atau no. referensi..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {movementSearch && (
                    <button
                      type="button"
                      onClick={() => setMovementSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HiXMark size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={movementTypeFilter}
                    onChange={(e) => {
                      setMovementTypeFilter(e.target.value as any);
                      setMovementPage(1);
                    }}
                    className="text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">Semua Jenis Aktivitas</option>
                    <option value="EARN">Perolehan Poin Belanja (EARN)</option>
                    <option value="REDEEM">Penukaran Diskon (REDEEM)</option>
                    <option value="BONUS">Bonus Reward (BONUS)</option>
                  </select>
                </div>
              </div>

              {/* Table Movements */}
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Waktu & Dokumen</th>
                      <th className="py-3.5 px-4">Nama Member</th>
                      <th className="py-3.5 px-4 text-center">Jenis Aktivitas</th>
                      <th className="py-3.5 px-4 text-center">Perubahan Poin</th>
                      <th className="py-3.5 px-4 text-right">Nilai Belanja</th>
                      <th className="py-3.5 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          <HiOutlineSparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="font-semibold text-gray-600">Belum ada riwayat mutasi poin</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedMovements.map((m) => {
                        const isPlus = m.pointsChange >= 0;

                        return (
                          <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-gray-900">{formatDateTime(m.date)}</p>
                              <span className="font-mono text-[10px] text-blue-600 font-semibold">
                                {m.refNo}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-gray-900">{m.customerName}</p>
                              <span className="text-[10px] text-amber-600 font-mono font-medium">
                                {m.memberCode}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {m.type === "EARN" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <HiOutlinePlus className="w-3 h-3" /> PEROLEHAN
                                </span>
                              ) : m.type === "REDEEM" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <HiOutlineMinus className="w-3 h-3" /> PENUKARAN
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <HiOutlineGift className="w-3 h-3" /> BONUS
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`text-sm font-black ${
                                  isPlus ? "text-emerald-600" : "text-purple-600"
                                }`}
                              >
                                {isPlus ? `+${m.pointsChange}` : m.pointsChange} pts
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-gray-800">
                              {m.spendingAmount ? formatRupiah(m.spendingAmount) : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 font-medium">
                              {m.description}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Movement Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-800">
                    {filteredMovements.length === 0
                      ? 0
                      : (movementPage - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-gray-800">
                    {Math.min(movementPage * pageSize, filteredMovements.length)}
                  </span>{" "}
                  dari <span className="font-bold text-gray-800">{filteredMovements.length}</span> catatan
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                    disabled={movementPage <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <HiChevronLeft size={16} />
                  </button>
                  <span className="text-xs px-3 font-semibold text-gray-700">
                    Hal. {movementPage} / {totalMovementPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setMovementPage((p) => Math.min(totalMovementPages, p + 1))
                    }
                    disabled={movementPage >= totalMovementPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <HiChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QUICK POINTS ADJUSTMENT / REDEMPTION MODAL */}
      {isModalOpen && selectedCustomerForPoints && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Kelola Poin Loyalitas Member
                </h3>
                <p className="text-xs text-gray-500">
                  Tukar diskon voucher atau beri poin bonus kepada pelanggan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <HiXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPoints} className="p-6 space-y-5">
              {/* Member Info Card */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedCustomerForPoints.name}
                  </p>
                  <p className="font-mono text-amber-700 font-semibold mt-0.5">
                    {selectedCustomerForPoints.member_code || selectedCustomerForPoints.id} &bull;{" "}
                    <span className="uppercase font-bold">
                      {selectedCustomerForPoints.member_level || "REGULAR"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Saldo Poin</span>
                  <p className="text-xl font-black text-amber-700">
                    {(Number(selectedCustomerForPoints.points) || 0).toLocaleString("id-ID")}{" "}
                    <span className="text-xs font-normal">pts</span>
                  </p>
                </div>
              </div>

              {/* Action Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pilih Tindakan Poin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPointAction("add")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      pointAction === "add"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    + Tambah Poin (Bonus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointAction("redeem")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      pointAction === "redeem"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    - Tukar Poin (Redeem Diskon)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Jumlah Poin
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={pointQty}
                  onChange={(e) => setPointQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-base font-black bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {pointAction === "add"
                    ? `Saldo poin akan menjadi: ${
                        (Number(selectedCustomerForPoints.points) || 0) + Number(pointQty)
                      } pts`
                    : `Saldo poin akan menjadi: ${Math.max(
                        0,
                        (Number(selectedCustomerForPoints.points) || 0) - Number(pointQty)
                      )} pts (Senilai potongan: ${formatRupiah(Number(pointQty) * 100)})`}
                </p>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Keterangan / Alasan Penukaran
                </label>
                <textarea
                  rows={2}
                  value={pointNote}
                  onChange={(e) => setPointNote(e.target.value)}
                  placeholder="Contoh: Penukaran voucher potongan belanja Rp 10.000 / bonus ulang tahun..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Transaksi Poin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
