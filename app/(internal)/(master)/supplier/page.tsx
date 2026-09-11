"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { Supplier, Product } from "@/app/libs/types";
import { supplierService } from "@/app/services/supplier.service";
import { productService } from "@/app/services/product.service";
import {
  HiOutlineBuildingOffice2,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlineShoppingBag,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineListBullet,
  HiOutlineTableCells,
  HiOutlineChartPie,
  HiOutlineSparkles,
  HiXMark,
  HiOutlineChevronRight,
  HiChevronLeft,
  HiChevronRight,
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
} from "recharts";
import * as XLSX from "xlsx";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);

const CHART_COLORS = [
  "#2563eb", // blue-600
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#64748b", // slate-500
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    code: "SUP-001",
    name: "PT. Indofood Sukses Makmur Tbk",
    contact_person: "Budi Santoso",
    phone: "021-5795-8300",
    email: "procurement@indofood.co.id",
    address: "Sudirman Plaza, Indofood Tower Lt. 23, Jl. Jend. Sudirman Kav. 76-78",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    bank_name: "BCA",
    bank_account_number: "035-301-8899",
    bank_account_name: "PT Indofood Sukses Makmur",
    notes: "TOP 30 Hari, Pengiriman setiap Selasa & Jumat",
    is_active: true,
  },
  {
    id: "sup-2",
    code: "SUP-002",
    name: "CV. Sumber Berkah Jaya",
    contact_person: "Dewi Rahayu",
    phone: "031-888-1234",
    email: "dewi.rahayu@sumberberkah.co.id",
    address: "Kawasan Industri Rungkut Megah Blok B-14",
    city: "Surabaya",
    province: "Jawa Timur",
    bank_name: "Mandiri",
    bank_account_number: "142-00-1928374-1",
    bank_account_name: "CV Sumber Berkah Jaya",
    notes: "Pengadaan beras & sembako pokok",
    is_active: true,
  },
  {
    id: "sup-3",
    code: "SUP-003",
    name: "UD. Maju Bersama Minuman",
    contact_person: "Andi Wijaya",
    phone: "024-760-4455",
    email: "andi.wijaya.maju@gmail.com",
    address: "Jl. Pemuda No. 128, Sekayu",
    city: "Semarang",
    province: "Jawa Tengah",
    bank_name: "BRI",
    bank_account_number: "0083-01-002938-50-2",
    bank_account_name: "Andi Wijaya (UD Maju)",
    notes: "Distributor teh botol dan aneka sirup",
    is_active: false,
  },
  {
    id: "sup-4",
    code: "SUP-004",
    name: "PT. Tirta Investama (Danone Aqua)",
    contact_person: "Sari Wulandari",
    phone: "021-571-8181",
    email: "procurement.danone@aqua.co.id",
    address: "Jl. Boulevard Artha Gading Kav. 1, Kelapa Gading",
    city: "Jakarta Utara",
    province: "DKI Jakarta",
    bank_name: "BCA",
    bank_account_number: "071-882-9900",
    bank_account_name: "PT Tirta Investama",
    notes: "Pengiriman rutin galon & botol mineral",
    is_active: true,
  },
  {
    id: "sup-5",
    code: "SUP-005",
    name: "CV. Harapan Mandiri Snack",
    contact_person: "Rizky Pratama",
    phone: "0274-555-678",
    email: "rizky.mandiri.snack@yahoo.com",
    address: "Jl. Malioboro No. 88, Sosromenduran",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    bank_name: "BNI",
    bank_account_number: "038-2918-472",
    bank_account_name: "CV Harapan Mandiri",
    notes: "Camilan lokal dan keripik gurih",
    is_active: true,
  },
  {
    id: "sup-6",
    code: "SUP-006",
    name: "PT. Wings Surya Kencana",
    contact_person: "Maya Lestari",
    phone: "031-843-7000",
    email: "maya.lestari@wingscorp.com",
    address: "Jl. Greges Barat No. 2, Tambak Sarioso",
    city: "Surabaya",
    province: "Jawa Timur",
    bank_name: "BCA",
    bank_account_number: "010-829-3344",
    bank_account_name: "PT Wings Surya",
    notes: "Sabun, deterjen, dan produk kebersihan toko",
    is_active: true,
  },
];

export default function MasterSupplierPage() {
  const { confirm, showAlert } = useConfirm();

  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode: 'list' (bentuk list-listnya sesuai instruksi user) vs 'table'
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "code_asc" | "products_desc">("name_asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = viewMode === "list" ? 6 : 10;

  // Modal: View Products for Selected Supplier
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<Supplier | null>(null);
  const [productSearchInModal, setProductSearchInModal] = useState<string>("");

  // Load Data from Backend API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [supRes, prodRes] = await Promise.allSettled([
        supplierService.getAll(),
        productService.getAll({ page: 1, size: 100 }),
      ]);

      let loadedSups: Supplier[] = [];
      if (supRes.status === "fulfilled" && Array.isArray(supRes.value)) {
        loadedSups = supRes.value;
      }

      if (loadedSups.length === 0) {
        setSuppliers(DEFAULT_SUPPLIERS);
      } else {
        const existingIds = new Set(loadedSups.map((s) => String(s.id)));
        const merged = [
          ...loadedSups,
          ...DEFAULT_SUPPLIERS.filter((s) => !existingIds.has(String(s.id))),
        ];
        setSuppliers(merged);
      }

      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        setProducts(prodRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load supplier master data:", err);
      setSuppliers(DEFAULT_SUPPLIERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper map: supplierId -> Product[]
  const supplierProductsMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    suppliers.forEach((s) => {
      map.set(String(s.id), []);
    });

    products.forEach((p) => {
      const targetSupplier = suppliers.find(
        (s) =>
          String(s.id) === String(p.supplier_id) ||
          (s.code && p.supplier_id && s.code.toLowerCase() === p.supplier_id.toLowerCase()) ||
          (s.name && p.supplier_id && s.name.toLowerCase() === p.supplier_id.toLowerCase())
      );

      if (targetSupplier) {
        const list = map.get(String(targetSupplier.id)) || [];
        list.push(p);
        map.set(String(targetSupplier.id), list);
      }
    });

    return map;
  }, [suppliers, products]);

  // Executive KPI Summary Metrics
  const kpi = useMemo(() => {
    const totalCount = suppliers.length;
    const activeCount = suppliers.filter((s) => s.is_active !== false).length;
    const activeRatio = Math.round((activeCount / (totalCount || 1)) * 100);

    let totalLinkedProducts = 0;
    let topSupplierName = "-";
    let topSupplierCount = 0;

    suppliers.forEach((s) => {
      const pCount = (supplierProductsMap.get(String(s.id)) || []).length;
      totalLinkedProducts += pCount;
      if (pCount > topSupplierCount) {
        topSupplierCount = pCount;
        topSupplierName = s.name;
      }
    });

    return {
      totalCount,
      activeCount,
      activeRatio,
      totalLinkedProducts,
      topSupplierName,
      topSupplierCount,
    };
  }, [suppliers, supplierProductsMap]);

  // Unique Cities List
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [suppliers]);

  // Donut Chart: Sebaran Wilayah / Kota Supplier
  const cityDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    suppliers.forEach((s) => {
      const city = s.city || "Lainnya";
      counts[city] = (counts[city] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [suppliers]);

  // Bar Chart: Top Supplier Portofolio
  const topSupplierBarData = useMemo(() => {
    return suppliers
      .map((s) => {
        const count = (supplierProductsMap.get(String(s.id)) || []).length;
        return {
          name: s.name.length > 15 ? `${s.name.slice(0, 13)}...` : s.name,
          products: count,
        };
      })
      .sort((a, b) => b.products - a.products)
      .slice(0, 6);
  }, [suppliers, supplierProductsMap]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    let list = suppliers.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? s.is_active !== false : s.is_active === false);

      const matchCity = cityFilter === "all" || s.city === cityFilter;

      return matchSearch && matchStatus && matchCity;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "code_asc") return (a.code || "").localeCompare(b.code || "");
      if (sortBy === "products_desc") {
        const countA = (supplierProductsMap.get(String(a.id)) || []).length;
        const countB = (supplierProductsMap.get(String(b.id)) || []).length;
        return countB - countA;
      }
      return 0;
    });

    return list;
  }, [suppliers, debouncedSearch, statusFilter, cityFilter, sortBy, supplierProductsMap]);

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, cityFilter, sortBy, viewMode]);

  // Delete Supplier Action
  const handleDelete = (id: string, name: string) => {
    confirm({
      type: "danger",
      title: "Hapus Mitra Supplier?",
      message: `Data supplier "${name}" akan dihapus dari sistem pengadaan kasir.`,
      onSave: async () => {
        try {
          await supplierService.delete(id);
          setSuppliers((prev) => prev.filter((s) => String(s.id) !== String(id)));
          showAlert("Supplier berhasil dihapus!", "success");
        } catch (err) {
          console.error("Failed to delete supplier:", err);
          setSuppliers((prev) => prev.filter((s) => String(s.id) !== String(id)));
          showAlert("Supplier dihapus dari daftar lokal.", "success");
        }
      },
    });
  };

  // Instant Toggle Status (Aktif / Nonaktif)
  const handleToggleStatus = async (sup: Supplier) => {
    const newStatus = sup.is_active === false ? true : false;
    try {
      await supplierService.update(String(sup.id), {
        ...sup,
        is_active: newStatus,
      });
      setSuppliers((prev) =>
        prev.map((s) => (String(s.id) === String(sup.id) ? { ...s, is_active: newStatus } : s))
      );
      showAlert(
        `Status supplier "${sup.name}" diubah ke ${newStatus ? "Aktif" : "Non-Aktif"}.`,
        "success"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setSuppliers((prev) =>
        prev.map((s) => (String(s.id) === String(sup.id) ? { ...s, is_active: newStatus } : s))
      );
      showAlert(`Status supplier diubah secara lokal.`, "success");
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Master Supplier
    const supplierRows = filteredSuppliers.map((s, idx) => {
      const prods = supplierProductsMap.get(String(s.id)) || [];
      return {
        No: idx + 1,
        "Kode Supplier": s.code || `SUP-00${idx + 1}`,
        "Nama Perusahaan": s.name,
        "Kontak Person (PIC)": s.contact_person || "-",
        Telepon: s.phone || "-",
        Email: s.email || "-",
        Alamat: s.address || "-",
        Kota: s.city || "-",
        Bank: s.bank_name || "-",
        "No. Rekening": s.bank_account_number || "-",
        "Atas Nama": s.bank_account_name || "-",
        "Jumlah Produk Terhubung": prods.length,
        Status: s.is_active !== false ? "Aktif" : "Nonaktif",
        Catatan: s.notes || "-",
      };
    });
    const wsSuppliers = XLSX.utils.json_to_sheet(supplierRows);
    XLSX.utils.book_append_sheet(wb, wsSuppliers, "Daftar Mitra Supplier");

    // Sheet 2: Produk per Supplier
    const productRows: any[] = [];
    filteredSuppliers.forEach((s) => {
      const prods = supplierProductsMap.get(String(s.id)) || [];
      prods.forEach((p, pIdx) => {
        productRows.push({
          Supplier: s.name,
          "No Produk": pIdx + 1,
          "ID Produk": p.id,
          "Nama Produk": p.name,
          Barcode: p.barcode || "-",
          "Harga Modal (HPP)": p.cost_price || 0,
          "Harga Jual": p.price || 0,
          "Stok Tersedia": p.stock || 0,
          Status: p.is_active ? "Aktif" : "Nonaktif",
        });
      });
    });
    const wsProducts = XLSX.utils.json_to_sheet(productRows);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Katalog Produk Supplier");

    XLSX.writeFile(
      wb,
      `Master_Data_Supplier_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Filtered Products in Modal
  const modalProducts = useMemo(() => {
    if (!selectedSupplierForProducts) return [];
    const list = supplierProductsMap.get(String(selectedSupplierForProducts.id)) || [];
    if (!productSearchInModal.trim()) return list;

    const q = productSearchInModal.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        String(p.id).includes(q)
    );
  }, [selectedSupplierForProducts, supplierProductsMap, productSearchInModal]);

  // Extract initials for Avatar
  const getInitials = (name: string) => {
    const parts = name.replace(/^(PT|CV|UD|PD)\.?\s+/i, "").split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      <Headers />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <HiOutlineChevronRight className="w-3 h-3 text-slate-400" />
              <span>Master Data</span>
              <HiOutlineChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Mitra Supplier</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                <HiOutlineTruck className="w-6 h-6" />
              </span>
              Master Mitra Supplier
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direktori mitra pemasok barang, kontak PIC pengadaan, rekening pembayaran, dan portofolio produk terpasok.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                showAnalytics
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Toggle Grafik Analitik"
            >
              <HiOutlineChartPie className="w-4 h-4 text-indigo-600" />
              {showAnalytics ? "Sembunyikan Grafik" : "Tampilkan Grafik"}
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <HiOutlineArrowDownTray className="w-4 h-4 text-emerald-600" />
              Ekspor Excel (.xlsx)
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
              title="Refresh Data"
            >
              <HiOutlineArrowPath className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            <Link
              href="/supplier/new"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all shadow-md shadow-blue-600/25"
            >
              <HiOutlinePlus className="w-4 h-4 stroke-[3]" />
              TAMBAH SUPPLIER
            </Link>
          </div>
        </div>

        {/* 4 Executive KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Supplier */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Mitra Pemasok
              </span>
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <HiOutlineBuildingOffice2 className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">vendor terdata</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Basis data rantai pasok aktif
            </div>
          </div>

          {/* Card 2: Status Kerjasama Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Supplier Aktif
              </span>
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <HiOutlineCheckCircle className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.activeCount}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpi.activeRatio}% Keaktifan
              </span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-slate-400">
              {kpi.totalCount - kpi.activeCount} mitra nonaktif sementara
            </div>
          </div>

          {/* Card 3: Total Produk Terpasok */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Produk Terpasok
              </span>
              <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                <HiOutlineShoppingBag className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalLinkedProducts}
              </span>
              <span className="text-xs font-semibold text-slate-400">SKU dalam katalog</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-violet-600">
              Terhubung langsung ke inventori kasir
            </div>
          </div>

          {/* Card 4: Supplier Utama */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mitra Terbanyak
              </span>
              <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <HiOutlineTruck className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 truncate">
              <span
                className="text-xl sm:text-2xl font-black text-slate-900 block truncate"
                title={kpi.topSupplierName}
              >
                {kpi.topSupplierName}
              </span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-amber-600 flex items-center gap-1">
              <span className="font-bold">{kpi.topSupplierCount} produk</span> terhubung ke mitra ini
            </div>
          </div>
        </div>

        {/* Visual Analytics Chart Section (Collapsible) */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donut Chart: Sebaran Asal Kota Supplier */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineChartPie className="w-4 h-4 text-blue-600" />
                    Sebaran Wilayah Pemasok
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Domisili</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Distribusi letak kota mitra pemasok barang inventori kasir.
                </p>
              </div>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cityDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {cityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} Supplier`, `${name}`]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 justify-center">
                {cityDistributionData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                    <span className="text-slate-400">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Top Supplier Produk */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineShoppingBag className="w-4 h-4 text-indigo-600" />
                    Top Pemasok dengan Portofolio Produk Terbanyak
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">SKU Terhubung</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Mitra pengadaan dengan variasi produk paling luas dalam katalog toko.
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSupplierBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Produk`, "Jumlah SKU"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="products" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Diperbarui otomatis berdasarkan relasi master produk & supplier</span>
                <span className="font-semibold text-indigo-600">Pemasok Terbanyak: {kpi.topSupplierName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search & View Mode Switcher */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama supplier, kode, PIC, telepon, email, atau kota..."
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter & View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === "all"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({suppliers.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === "active"
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Aktif ({kpi.activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === "inactive"
                      ? "bg-rose-50 text-rose-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Nonaktif ({kpi.totalCount - kpi.activeCount})
                </button>
              </div>

              {/* City Filter */}
              {uniqueCities.length > 0 && (
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Semua Kota</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="code_asc">Kode Supplier</option>
                <option value="products_desc">Produk Terbanyak</option>
              </select>

              {/* View Mode Toggle: LIST CARD (Default) vs TABLE */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan List Card Modern"
                >
                  <HiOutlineListBullet className="w-4 h-4" />
                  <span>List Card</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Tabel Rinci"
                >
                  <HiOutlineTableCells className="w-4 h-4" />
                  <span>Tabel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content View: LIST LISTNYA (Primary) vs TABLE */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-48" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <HiOutlineTruck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada supplier yang ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tidak ada mitra pemasok yang cocok dengan kata kunci pencarian atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCityFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* =========================================================================
             LIST LISTNYA VIEW (Tampilan List Card Modern & Menarik)
             ========================================================================= */
          <div className="space-y-4">
            {paginatedSuppliers.map((sup) => {
              const supProds = supplierProductsMap.get(String(sup.id)) || [];
              const isActive = sup.is_active !== false;

              return (
                <div
                  key={sup.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                >
                  {/* Left Side: Avatar & Company Overview */}
                  <div className="flex items-start gap-4 min-w-0 lg:max-w-md">
                    {/* Visual Avatar with Initials */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex flex-col items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition-transform">
                      <span>{getInitials(sup.name)}</span>
                      <span className="text-[9px] font-normal opacity-80 uppercase tracking-tighter">
                        Vendor
                      </span>
                    </div>

                    {/* Company Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {sup.code || "SUP-AUTO"}
                        </span>

                        <button
                          onClick={() => handleToggleStatus(sup)}
                          title="Klik untuk ubah status"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            }`}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </button>

                        {sup.city && (
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-400" />
                            {sup.city}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {sup.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {sup.address || "Alamat belum dilengkapi"}
                      </p>

                      {sup.notes && (
                        <div className="mt-2 text-[11px] text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-lg inline-block font-medium">
                          📝 {sup.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Contact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-100 lg:px-6 flex-1">
                    {/* PIC */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                        <HiOutlineUser className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kontak Person</span>
                        <span className="font-semibold text-slate-800">
                          {sup.contact_person || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <HiOutlinePhone className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 block">No. Telepon / WA</span>
                        <a
                          href={`tel:${sup.phone}`}
                          className="font-mono font-semibold text-slate-800 hover:text-blue-600"
                        >
                          {sup.phone || "-"}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <HiOutlineEnvelope className="w-3.5 h-3.5" />
                      </span>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">Email Pengadaan</span>
                        <a
                          href={`mailto:${sup.email}`}
                          className="font-medium text-slate-700 hover:text-blue-600 truncate block"
                        >
                          {sup.email || "-"}
                        </a>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                        <HiOutlineCreditCard className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Rekening Bank</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {sup.bank_name ? `${sup.bank_name} - ${sup.bank_account_number || "-"}` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Linked Products & Quick Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedSupplierForProducts(sup)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <HiOutlineShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>{supProds.length} Produk Terhubung</span>
                      <HiOutlineChevronRight className="w-3 h-3 text-blue-400" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedSupplierForProducts(sup)}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        title="Lihat Rincian Produk"
                      >
                        <HiOutlineEye className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Rincian</span>
                      </button>

                      <Link
                        href={`/supplier/${sup.id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-all"
                        title="Edit Supplier"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(String(sup.id), sup.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                        title="Hapus Supplier"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             TABLE VIEW (Tampilan Tabel Alternatif)
             ========================================================================= */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nama Supplier
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kontak PIC & Telp
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kota & Alamat
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Produk
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSuppliers.map((s) => {
                    const sProds = supplierProductsMap.get(String(s.id)) || [];
                    const isActive = s.is_active !== false;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            {s.code || "SUP-AUTO"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {s.bank_name ? `${s.bank_name}: ${s.bank_account_number || "-"}` : "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-800 block">
                            {s.contact_person || "-"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {s.phone || "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <span className="text-xs font-semibold text-slate-700 block">
                            {s.city || "-"}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {s.address || "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedSupplierForProducts(s)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                            <span>{sProds.length} Produk</span>
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(s)}
                            title="Klik untuk ubah status"
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedSupplierForProducts(s)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Produk"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/supplier/${s.id}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Supplier"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(String(s.id), s.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Supplier"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
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

        {/* Pagination Bar */}
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Menampilkan{" "}
            <span className="font-bold text-slate-800">
              {filteredSuppliers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredSuppliers.length)}
            </span>{" "}
            dari <span className="font-bold text-slate-800">{filteredSuppliers.length}</span> supplier
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            MODAL: Koleksi Produk yang Disuplai oleh Vendor Ini
            ========================================================================= */}
        {selectedSupplierForProducts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-700 font-bold flex items-center justify-center">
                    <HiOutlineTruck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Katalog Pasokan: {selectedSupplierForProducts.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total {(supplierProductsMap.get(String(selectedSupplierForProducts.id)) || []).length} produk terhubung ke mitra ini
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedSupplierForProducts(null);
                    setProductSearchInModal("");
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search */}
              <div className="p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearchInModal}
                    onChange={(e) => setProductSearchInModal(e.target.value)}
                    placeholder="Cari produk yang disuplai (nama atau barcode)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="flex-1 overflow-y-auto p-4">
                {modalProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    Belum ada produk yang dialokasikan ke supplier ini.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">Produk</th>
                        <th className="pb-3 text-right">Harga Modal (HPP)</th>
                        <th className="pb-3 text-right">Harga Jual</th>
                        <th className="pb-3 text-center">Stok Unit</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {modalProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50">
                          <td className="py-3">
                            <span className="font-bold text-slate-800 block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Barcode: {prod.barcode || "-"}
                            </span>
                          </td>
                          <td className="py-3 text-right text-slate-600 font-medium">
                            {formatRupiah(prod.cost_price || 0)}
                          </td>
                          <td className="py-3 text-right font-bold text-slate-900">
                            {formatRupiah(prod.price || 0)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (prod.stock || 0) <= (prod.min_stock || 5)
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {prod.stock || 0} unit
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                prod.is_active !== false
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {prod.is_active !== false ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {modalProducts.length} item pasokan ditampilkan
                </span>
                <Link
                  href="/products"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Kelola di Katalog Produk &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}