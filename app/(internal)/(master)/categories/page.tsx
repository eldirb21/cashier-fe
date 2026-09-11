"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { toSlug } from "@/app/libs";
import { categories as initialCategories, products as initialProducts } from "@/app/libs/data";
import { Category, Product } from "@/app/libs/types";
import { categoryService } from "@/app/services/category.service";
import { productService } from "@/app/services/product.service";
import {
  HiOutlineSquares2X2,
  HiOutlineTableCells,
  HiOutlineFolder,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineTag,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArchiveBox,
  HiOutlineShoppingBag,
  HiOutlineFunnel,
  HiOutlineSparkles,
  HiOutlineChartPie,
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
  Legend,
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

export default function CategoriesPage() {
  const { confirm, showAlert } = useConfirm();

  // State Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Controls
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "products_desc" | "newest">("name_asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === "grid" ? 9 : 10;

  // Modal State for Products under Category
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<Category | null>(null);
  const [categoryProductSearch, setCategoryProductSearch] = useState("");

  // Fetch Categories and Products
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.allSettled([
        categoryService.getAll(),
        productService.getAll({ page: 1, size: 100 }),
      ]);

      let loadedCats: Category[] = [];
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        loadedCats = catRes.value;
      }

      if (loadedCats.length === 0) {
        setCategories(initialCategories);
      } else {
        // Merge with initial fallback if needed
        const existingIds = new Set(loadedCats.map((c) => String(c.id)));
        const merged = [
          ...loadedCats,
          ...initialCategories.filter((c) => !existingIds.has(String(c.id))),
        ];
        setCategories(merged);
      }

      let loadedProds: Product[] = [];
      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        loadedProds = prodRes.value.data;
      }

      if (loadedProds.length === 0) {
        setProducts(initialProducts);
      } else {
        setProducts(loadedProds);
      }
    } catch (err) {
      console.error("Failed to load category data:", err);
      setCategories(initialCategories);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper map of categoryId -> products list
  const categoryProductsMap = useMemo(() => {
    const map = new Map<string, Product[]>();

    categories.forEach((cat) => {
      map.set(String(cat.id), []);
    });

    products.forEach((prod) => {
      // Find matching category by id, slug, or name
      const targetCat = categories.find(
        (c) =>
          String(c.id) === String(prod.category_id) ||
          (c.slug && prod.category_id && c.slug.toLowerCase() === prod.category_id.toLowerCase()) ||
          (c.name && prod.category_id && c.name.toLowerCase() === prod.category_id.toLowerCase())
      );

      if (targetCat) {
        const list = map.get(String(targetCat.id)) || [];
        list.push(prod);
        map.set(String(targetCat.id), list);
      }
    });

    return map;
  }, [categories, products]);

  // Executive KPI Summary Metrics
  const kpi = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.is_active !== false).length;
    const activeRatio = Math.round((activeCategories / (totalCategories || 1)) * 100);

    const totalProductsCount = products.length;
    const avgProductsPerCat = totalCategories > 0 ? (totalProductsCount / totalCategories).toFixed(1) : "0";

    // Top Category by product count
    let topCatName = "-";
    let topCatCount = 0;
    categories.forEach((cat) => {
      const count = (categoryProductsMap.get(String(cat.id)) || []).length;
      if (count > topCatCount) {
        topCatCount = count;
        topCatName = cat.name;
      }
    });

    return {
      totalCategories,
      activeCategories,
      activeRatio,
      totalProductsCount,
      avgProductsPerCat,
      topCatName,
      topCatCount,
    };
  }, [categories, products, categoryProductsMap]);

  // Visual Analytics: Distribution of products per category
  const productDistributionData = useMemo(() => {
    return categories
      .map((cat, idx) => {
        const count = (categoryProductsMap.get(String(cat.id)) || []).length;
        return {
          name: cat.name,
          count: count,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        };
      })
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [categories, categoryProductsMap]);

  // Top Categories Bar Data
  const topCategoriesBarData = useMemo(() => {
    return categories
      .map((cat) => {
        const catProds = categoryProductsMap.get(String(cat.id)) || [];
        const totalValuation = catProds.reduce(
          (sum, p) => sum + (p.price || 0) * (p.stock || 0),
          0
        );
        return {
          name: cat.name.length > 14 ? `${cat.name.slice(0, 12)}...` : cat.name,
          productsCount: catProds.length,
          valuation: totalValuation,
        };
      })
      .sort((a, b) => b.productsCount - a.productsCount)
      .slice(0, 6);
  }, [categories, categoryProductsMap]);

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    let list = categories.filter((cat) => {
      const matchSearch =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q)) ||
        (cat.slug && cat.slug.toLowerCase().includes(q)) ||
        String(cat.id).includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? cat.is_active !== false : cat.is_active === false);

      return matchSearch && matchStatus;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "products_desc") {
        const countA = (categoryProductsMap.get(String(a.id)) || []).length;
        const countB = (categoryProductsMap.get(String(b.id)) || []).length;
        return countB - countA;
      }
      if (sortBy === "newest") {
        return (
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        );
      }
      return 0;
    });

    return list;
  }, [categories, debouncedSearch, statusFilter, sortBy, categoryProductsMap]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortBy, viewMode]);

  // Delete Category Action
  const handleDelete = (id: string, name: string) => {
    confirm({
      type: "danger",
      title: "Hapus Kategori?",
      message: `Kategori "${name}" akan dihapus dari sistem. Pastikan produk terkait telah dialihkan.`,
      onSave: async () => {
        try {
          await categoryService.deleteCategory(id);
          setCategories((prev) => prev.filter((item) => String(item.id) !== String(id)));
          showAlert("Kategori berhasil dihapus!", "success");
        } catch (err) {
          console.error("Failed to delete category:", err);
          // Fallback local delete
          setCategories((prev) => prev.filter((item) => String(item.id) !== String(id)));
          showAlert("Kategori dihapus dari tampilan lokal", "success");
        }
      },
    });
  };

  // Fast Toggle Active Status
  const handleToggleStatus = async (cat: Category) => {
    const newStatus = cat.is_active === false ? true : false;
    try {
      await categoryService.updateCategory(String(cat.id), {
        ...cat,
        is_active: newStatus,
      });
      setCategories((prev) =>
        prev.map((c) => (String(c.id) === String(cat.id) ? { ...c, is_active: newStatus } : c))
      );
      showAlert(`Status kategori "${cat.name}" diubah ke ${newStatus ? "Aktif" : "Non-Aktif"}.`, "success");
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      setCategories((prev) =>
        prev.map((c) => (String(c.id) === String(cat.id) ? { ...c, is_active: newStatus } : c))
      );
      showAlert(`Status kategori "${cat.name}" diubah lokal.`, "success");
    }
  };

  // Export Categories & Products to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Master Kategori
    const categoryRows = filteredCategories.map((c, idx) => {
      const prods = categoryProductsMap.get(String(c.id)) || [];
      return {
        No: idx + 1,
        "ID Kategori": c.id,
        "Nama Kategori": c.name,
        Slug: c.slug || toSlug(c.name),
        "Jumlah Produk Terhubung": prods.length,
        Deskripsi: c.description || "-",
        Status: c.is_active !== false ? "Aktif" : "Non-Aktif",
      };
    });
    const wsCategories = XLSX.utils.json_to_sheet(categoryRows);
    XLSX.utils.book_append_sheet(wb, wsCategories, "Daftar Kategori");

    // Sheet 2: Produk Terkait per Kategori
    const productRows: any[] = [];
    filteredCategories.forEach((c) => {
      const prods = categoryProductsMap.get(String(c.id)) || [];
      prods.forEach((p, pIdx) => {
        productRows.push({
          "Kategori": c.name,
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
    XLSX.utils.book_append_sheet(wb, wsProducts, "Rincian Produk Kategori");

    XLSX.writeFile(wb, `Laporan_Master_Kategori_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Products under selected category modal
  const modalCategoryProducts = useMemo(() => {
    if (!selectedCategoryForProducts) return [];
    const rawList = categoryProductsMap.get(String(selectedCategoryForProducts.id)) || [];
    if (!categoryProductSearch.trim()) return rawList;

    const q = categoryProductSearch.toLowerCase();
    return rawList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        String(p.id).includes(q)
    );
  }, [selectedCategoryForProducts, categoryProductsMap, categoryProductSearch]);

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
              <span className="text-slate-500">Kategori Produk</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <HiOutlineFolder className="w-6 h-6" />
              </span>
              Master Kategori Produk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola struktur pengelompokan produk, visualisasi katalog kasir, serta integrasi stok per kategori.
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
              href="/categories/new"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all shadow-md shadow-blue-600/25"
            >
              <HiOutlinePlus className="w-4 h-4 stroke-[3]" />
              TAMBAH KATEGORI
            </Link>
          </div>
        </div>

        {/* 4 Executive KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Kategori */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Kategori
              </span>
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <HiOutlineFolder className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalCategories}
              </span>
              <span className="text-xs font-semibold text-slate-400">grup terdaftar</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Pengelompokan menu kasir aktif
            </div>
          </div>

          {/* Card 2: Kategori Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kategori Aktif
              </span>
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <HiOutlineCheckCircle className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.activeCategories}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpi.activeRatio}% Aktif
              </span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-slate-400">
              {kpi.totalCategories - kpi.activeCategories} kategori sedang dinonaktifkan
            </div>
          </div>

          {/* Card 3: Total Produk Terhubung */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Produk Terhubung
              </span>
              <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                <HiOutlineShoppingBag className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalProductsCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">SKU dalam katalog</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-violet-600">
              Rata-rata ~{kpi.avgProductsPerCat} item per kategori
            </div>
          </div>

          {/* Card 4: Kategori Terpopuler */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kategori Terbanyak
              </span>
              <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <HiOutlineArchiveBox className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 truncate">
              <span className="text-xl sm:text-2xl font-black text-slate-900 block truncate" title={kpi.topCatName}>
                {kpi.topCatName}
              </span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-amber-600 flex items-center gap-1">
              <span className="font-bold">{kpi.topCatCount} produk</span> terhubung dalam kategori ini
            </div>
          </div>
        </div>

        {/* Visual Analytics Chart Section (Collapsible) */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donut Chart: Distribusi Produk per Kategori */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineChartPie className="w-4 h-4 text-blue-600" />
                    Distribusi Produk Kategori
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">SKU per grup</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Proporsi jumlah produk yang terdistribusi di setiap kategori.
                </p>
              </div>

              <div className="h-56 w-full relative">
                {productDistributionData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Belum ada data produk terhubung
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistributionData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {productDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} Produk`, `${name}`]}
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
                )}
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 justify-center">
                {productDistributionData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[100px]">{item.name}</span>
                    <span className="text-slate-400">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Top 5 Kategori dengan Produk Terbanyak */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineArchiveBox className="w-4 h-4 text-indigo-600" />
                    Top Kategori dengan Portofolio Produk Terbesar
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">SKU Portfolio</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Kategori dengan ragam SKU terbanyak dan estimasi total valuasi stok barang di toko.
                </p>
              </div>

              <div className="h-56 w-full">
                {topCategoriesBarData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Belum ada data kategori
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategoriesBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          name === "productsCount" ? `${val} Produk` : formatRupiah(val),
                          name === "productsCount" ? "Jumlah SKU" : "Valuasi Stok",
                        ]}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="productsCount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="productsCount" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Grafik diperbarui secara otomatis berdasarkan data master produk</span>
                <span className="font-semibold text-blue-600">Terbanyak: {kpi.topCatName} ({kpi.topCatCount} SKU)</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search & View Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori berdasarkan nama, slug, deskripsi, atau ID..."
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
                    statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({categories.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === "active" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Aktif ({kpi.activeCategories})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === "inactive" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Nonaktif ({kpi.totalCategories - kpi.activeCategories})
                </button>
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="products_desc">Produk Terbanyak</option>
                <option value="newest">Kategori Terkini</option>
              </select>

              {/* View Mode Toggle: Grid Cards vs Table */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <HiOutlineSquares2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Tabel Rinci"
                >
                  <HiOutlineTableCells className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content View: Grid vs Table */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-28" />
                    <div className="h-3 bg-slate-200 rounded w-16" />
                  </div>
                </div>
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <HiOutlineFolder className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada kategori ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tidak ada data yang cocok dengan kriteria pencarian atau filter Anda saat ini.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* =========================================================================
             GRID CARD VIEW (Tampilan Kartu Modern & Menarik)
             ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCategories.map((cat) => {
              const catProds = categoryProductsMap.get(String(cat.id)) || [];
              const isActive = cat.is_active !== false;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header & Icon */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                          <img
                            src={cat.img || cat.img_url || "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2553/2553642.png";
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              ID: #{cat.id}
                            </span>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              /{cat.slug || toSlug(cat.name)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        title={isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        {isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 mt-3.5 line-clamp-2 min-h-[32px] font-normal leading-relaxed">
                      {cat.description || "Tidak ada deskripsi rinci untuk kategori produk ini."}
                    </p>

                    {/* Meta Stats Badge */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <HiOutlineShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>{catProds.length} Produk Terhubung</span>
                      </div>

                      <button
                        onClick={() => setSelectedCategoryForProducts(cat)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" />
                        Lihat Item
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Actions Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Kelola Kategori
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/categories/${cat.id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Edit Kategori"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(String(cat.id), cat.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hapus Kategori"
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
             TABLE VIEW (Tabel Rinci Berfitur Lengkap)
             ========================================================================= */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kategori & ID
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Slug URL
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Produk Terkait
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
                  {paginatedCategories.map((cat) => {
                    const catProds = categoryProductsMap.get(String(cat.id)) || [];
                    const isActive = cat.is_active !== false;

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Name & Icon */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-blue-50/70 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                              <img
                                src={cat.img || cat.img_url || "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"}
                                alt={cat.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2553/2553642.png";
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                                {cat.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: #{cat.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg">
                            /{cat.slug || toSlug(cat.name)}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 max-w-xs">
                          <span className="text-xs font-medium text-slate-500 line-clamp-2">
                            {cat.description || "-"}
                          </span>
                        </td>

                        {/* Products Count */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedCategoryForProducts(cat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                            <span>{catProds.length} Produk</span>
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            title="Klik untuk ubah status"
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedCategoryForProducts(cat)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Produk Terkait"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/categories/${cat.id}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Kategori"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(String(cat.id), cat.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Kategori"
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
              {filteredCategories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredCategories.length)}
            </span>{" "}
            dari <span className="font-bold text-slate-800">{filteredCategories.length}</span> kategori
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
            MODAL: Koleksi Produk dalam Kategori Terpilih
            ========================================================================= */}
        {selectedCategoryForProducts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/60 p-2 flex items-center justify-center">
                    <img
                      src={
                        selectedCategoryForProducts.img ||
                        selectedCategoryForProducts.img_url ||
                        "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"
                      }
                      alt={selectedCategoryForProducts.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Produk Kategori: {selectedCategoryForProducts.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total {(categoryProductsMap.get(String(selectedCategoryForProducts.id)) || []).length} produk terdaftar dalam kategori ini
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategoryForProducts(null);
                    setCategoryProductSearch("");
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search Filter */}
              <div className="p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={categoryProductSearch}
                    onChange={(e) => setCategoryProductSearch(e.target.value)}
                    placeholder="Cari produk dalam kategori ini (nama / barcode)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Modal Products List Table */}
              <div className="flex-1 overflow-y-auto p-4">
                {modalCategoryProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    Tidak ada produk yang terhubung dengan kategori ini.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">Produk</th>
                        <th className="pb-3 text-right">Harga Jual</th>
                        <th className="pb-3 text-right">Harga Modal</th>
                        <th className="pb-3 text-center">Stok</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {modalCategoryProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50">
                          <td className="py-3">
                            <span className="font-bold text-slate-800 block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Barcode: {prod.barcode || "-"}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-slate-900">
                            {formatRupiah(prod.price || 0)}
                          </td>
                          <td className="py-3 text-right text-slate-500 font-medium">
                            {formatRupiah(prod.cost_price || 0)}
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
                  {modalCategoryProducts.length} item ditampilkan
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
