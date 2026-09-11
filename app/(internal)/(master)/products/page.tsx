"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Barcode from "react-barcode";
import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { toSlug } from "@/app/libs";
import { products as initialProducts, categories as initialCategories, suppliers as initialSuppliers } from "@/app/libs/data";
import { Product, Category, Supplier } from "@/app/libs/types";
import { productService } from "@/app/services/product.service";
import { categoryService } from "@/app/services/category.service";
import { supplierService } from "@/app/services/supplier.service";
import {
  HiOutlineShoppingBag,
  HiOutlineSquares2X2,
  HiOutlineTableCells,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBanknotes,
  HiOutlineArchiveBox,
  HiOutlineChartPie,
  HiOutlineSparkles,
  HiXMark,
  HiOutlineChevronRight,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowTrendingUp,
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

export default function MasterProductsPage() {
  const { confirm, showAlert } = useConfirm();

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode: 'grid' vs 'table'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "safe" | "low" | "out">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "price_desc" | "price_asc" | "stock_desc" | "stock_asc" | "margin_desc"
  >("name_asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = viewMode === "grid" ? 9 : 10;

  // Quick Stock Adjustment Modal State
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "reduce" | "set">("add");
  const [adjustmentQty, setAdjustmentQty] = useState<number>(10);
  const [adjustmentNote, setAdjustmentNote] = useState<string>("");
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, supRes] = await Promise.allSettled([
        productService.getAll({ page: 1, size: 150 }),
        categoryService.getAll(),
        supplierService.getAll(),
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value?.data && prodRes.value.data.length > 0) {
        setProducts(prodRes.value.data);
      } else {
        setProducts(initialProducts);
      }

      if (catRes.status === "fulfilled" && Array.isArray(catRes.value) && catRes.value.length > 0) {
        setCategories(catRes.value);
      } else {
        setCategories(initialCategories);
      }

      if (supRes.status === "fulfilled" && Array.isArray(supRes.value) && supRes.value.length > 0) {
        setSuppliers(supRes.value);
      } else {
        setSuppliers(initialSuppliers);
      }
    } catch (err) {
      console.error("Failed to load products master data:", err);
      setProducts(initialProducts);
      setCategories(initialCategories);
      setSuppliers(initialSuppliers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lookup maps
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(String(c.id), c.name);
      if (c.slug) map.set(c.slug.toLowerCase(), c.name);
    });
    return map;
  }, [categories]);

  const supplierMap = useMemo(() => {
    const map = new Map<string, string>();
    suppliers.forEach((s) => {
      map.set(String(s.id), s.name);
      if (s.code) map.set(s.code.toLowerCase(), s.name);
    });
    return map;
  }, [suppliers]);

  // Executive KPI Summary
  const kpi = useMemo(() => {
    const totalSKU = products.length;
    let totalPhysicalStock = 0;
    let totalCostValuation = 0;
    let totalSalesValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const cost = Number(p.cost_price) || 0;
      const price = Number(p.price) || 0;
      const minStock = Number(p.min_stock) || 5;

      totalPhysicalStock += stock;
      totalCostValuation += stock * cost;
      totalSalesValuation += stock * price;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= minStock) {
        lowStockCount++;
      }
    });

    const potentialGrossProfit = Math.max(0, totalSalesValuation - totalCostValuation);

    return {
      totalSKU,
      totalPhysicalStock,
      totalCostValuation,
      totalSalesValuation,
      potentialGrossProfit,
      lowStockCount,
      outOfStockCount,
      alertCount: lowStockCount + outOfStockCount,
    };
  }, [products]);

  // Donut Chart: Products distribution per category
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const catName = categoryMap.get(String(p.category_id)) || p.category_id || "Lainnya";
      counts[catName] = (counts[catName] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [products, categoryMap]);

  // Bar Chart: Top 6 Valuation Products
  const valuationBarData = useMemo(() => {
    return [...products]
      .map((p) => ({
        name: p.name.length > 14 ? `${p.name.slice(0, 12)}...` : p.name,
        valuation: (Number(p.cost_price) || 0) * (Number(p.stock) || 0),
        stock: Number(p.stock) || 0,
      }))
      .sort((a, b) => b.valuation - a.valuation)
      .slice(0, 6);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    let list = products.filter((p) => {
      const catName = categoryMap.get(String(p.category_id)) || "";
      const supName = supplierMap.get(String(p.supplier_id)) || "";

      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        catName.toLowerCase().includes(q) ||
        supName.toLowerCase().includes(q) ||
        String(p.id).includes(q);

      const matchCategory =
        categoryFilter === "all" ||
        String(p.category_id) === categoryFilter ||
        catName === categoryFilter;

      const stock = Number(p.stock) || 0;
      const minStock = Number(p.min_stock) || 5;

      let matchStock = true;
      if (stockStatusFilter === "safe") matchStock = stock > minStock;
      else if (stockStatusFilter === "low") matchStock = stock > 0 && stock <= minStock;
      else if (stockStatusFilter === "out") matchStock = stock === 0;

      const matchActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? p.is_active !== false : p.is_active === false);

      return matchSearch && matchCategory && matchStock && matchActive;
    });

    // Sorting
    list.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const stockA = Number(a.stock) || 0;
      const stockB = Number(b.stock) || 0;
      const marginA = priceA - (Number(a.cost_price) || 0);
      const marginB = priceB - (Number(b.cost_price) || 0);

      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "stock_desc") return stockB - stockA;
      if (sortBy === "stock_asc") return stockA - stockB;
      if (sortBy === "margin_desc") return marginB - marginA;
      return 0;
    });

    return list;
  }, [products, debouncedSearch, categoryFilter, stockStatusFilter, activeFilter, sortBy, categoryMap, supplierMap]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, stockStatusFilter, activeFilter, sortBy, viewMode]);

  // Delete Product
  const handleDelete = (id: string, name: string) => {
    confirm({
      type: "danger",
      title: "Hapus Produk?",
      message: `Produk "${name}" akan dihapus secara permanen dari katalog dan inventori kasir.`,
      onSave: async () => {
        try {
          await productService.delete(id);
          setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
          showAlert("Produk berhasil dihapus!", "success");
        } catch (err) {
          console.error("Failed to delete product:", err);
          setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
          showAlert("Produk dihapus dari daftar lokal.", "success");
        }
      },
    });
  };

  // Instant Toggle Status
  const handleToggleStatus = async (prod: Product) => {
    const newStatus = prod.is_active === false ? true : false;
    try {
      await productService.update(String(prod.id), {
        ...prod,
        is_active: newStatus,
      });
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(prod.id) ? { ...p, is_active: newStatus } : p))
      );
      showAlert(`Status produk "${prod.name}" diubah ke ${newStatus ? "Aktif" : "Non-Aktif"}.`, "success");
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(prod.id) ? { ...p, is_active: newStatus } : p))
      );
      showAlert(`Status produk diubah secara lokal.`, "success");
    }
  };

  // Open Quick Stock Modal
  const handleOpenStockModal = (prod: Product) => {
    setStockModalProduct(prod);
    setAdjustmentType("add");
    setAdjustmentQty(10);
    setAdjustmentNote("");
  };

  // Submit Quick Stock Adjustment
  const handleSubmitStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;

    setIsAdjusting(true);
    try {
      const currentStock = Number(stockModalProduct.stock) || 0;
      let newStock = currentStock;

      if (adjustmentType === "add") newStock = currentStock + Number(adjustmentQty);
      else if (adjustmentType === "reduce") newStock = Math.max(0, currentStock - Number(adjustmentQty));
      else if (adjustmentType === "set") newStock = Math.max(0, Number(adjustmentQty));

      await productService.update(String(stockModalProduct.id), {
        ...stockModalProduct,
        stock: newStock,
      });

      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(stockModalProduct.id) ? { ...p, stock: newStock } : p))
      );

      showAlert(
        `Stok "${stockModalProduct.name}" berhasil disesuaikan menjadi ${newStock} unit!`,
        "success"
      );
      setStockModalProduct(null);
    } catch (err) {
      console.error("Failed to update stock:", err);
      const currentStock = Number(stockModalProduct.stock) || 0;
      let newStock = currentStock;
      if (adjustmentType === "add") newStock = currentStock + Number(adjustmentQty);
      else if (adjustmentType === "reduce") newStock = Math.max(0, currentStock - Number(adjustmentQty));
      else if (adjustmentType === "set") newStock = Math.max(0, Number(adjustmentQty));

      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(stockModalProduct.id) ? { ...p, stock: newStock } : p))
      );
      showAlert(`Stok diperbarui lokal menjadi ${newStock} unit.`, "success");
      setStockModalProduct(null);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const rows = filteredProducts.map((p, idx) => {
      const catName = categoryMap.get(String(p.category_id)) || p.category_id || "-";
      const supName = supplierMap.get(String(p.supplier_id)) || p.supplier_id || "-";
      const cost = Number(p.cost_price) || 0;
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.min_stock) || 5;
      const margin = price - cost;
      const marginPct = cost > 0 ? `${Math.round((margin / cost) * 100)}%` : "0%";

      return {
        No: idx + 1,
        "ID Produk": p.id,
        Barcode: p.barcode || "-",
        "Nama Produk": p.name,
        Kategori: catName,
        Supplier: supName,
        "Harga Modal (HPP)": cost,
        "Harga Jual": price,
        "Margin (Rp)": margin,
        "Margin (%)": marginPct,
        "Stok Tersedia": stock,
        "Batas Min. Stok": minStock,
        "Total Valuasi Modal": stock * cost,
        "Potensi Omset": stock * price,
        Status: p.is_active !== false ? "Aktif" : "Nonaktif",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Katalog Produk & Valuasi");

    XLSX.writeFile(wb, `Master_Data_Produk_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              <span className="text-slate-500">Katalog Produk</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <HiOutlineShoppingBag className="w-6 h-6" />
              </span>
              Master Katalog Produk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pusat pengelolaan inventori barang, penetapan harga jual/HPP, barcode produk, serta kontrol batas stok toko.
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
              href="/products/new"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all shadow-md shadow-blue-600/25"
            >
              <HiOutlinePlus className="w-4 h-4 stroke-[3]" />
              TAMBAH PRODUK
            </Link>
          </div>
        </div>

        {/* 4 Executive KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total SKU */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Varian (SKU)
              </span>
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <HiOutlineShoppingBag className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalSKU}
              </span>
              <span className="text-xs font-semibold text-slate-400">item terdaftar</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Tersebar di {categories.length} kategori produk
            </div>
          </div>

          {/* Card 2: Total Unit Stok */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Fisik Stok
              </span>
              <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <HiOutlineArchiveBox className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {kpi.totalPhysicalStock.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-semibold text-slate-400">unit barang</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-indigo-600">
              Tersedia di etalase dan rak toko
            </div>
          </div>

          {/* Card 3: Valuasi Modal (HPP) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Valuasi Modal (HPP)
              </span>
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <HiOutlineBanknotes className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-slate-900 block truncate" title={formatRupiah(kpi.totalCostValuation)}>
                {formatRupiah(kpi.totalCostValuation)}
              </span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-slate-400">
              Potensi omset: <span className="font-bold text-emerald-600">{formatRupiah(kpi.totalSalesValuation)}</span>
            </div>
          </div>

          {/* Card 4: Peringatan Stok */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status Perhatian Stok
              </span>
              <span className={`p-2.5 rounded-xl ${kpi.alertCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                <HiOutlineExclamationTriangle className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black ${kpi.alertCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
                {kpi.alertCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">SKU perlu restok</span>
            </div>
            <div className="mt-2 text-[11px] font-medium text-rose-500">
              {kpi.outOfStockCount} habis &bull; {kpi.lowStockCount} menipis
            </div>
          </div>
        </div>

        {/* Visual Analytics Chart Section (Collapsible) */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donut Chart: Kategori Produk */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineChartPie className="w-4 h-4 text-blue-600" />
                    Distribusi SKU per Kategori
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Kategori</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Sebaran jumlah varian produk menurut grup kategori toko.
                </p>
              </div>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} SKU`, `${name}`]}
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
                {categoryChartData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                    <span className="text-slate-400">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Top 6 Valuasi Modal Inventori */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiOutlineBanknotes className="w-4 h-4 text-emerald-600" />
                    Top Produk Berdasarkan Valuasi Modal (HPP x Stok)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Aset Stok</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Nilai kapital inventori terbesar yang tersimpan pada unit stok produk saat ini.
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valuationBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(val), "Total Valuasi Modal"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="valuation" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Dihitung dari (Harga Beli Modal HPP &times; Stok Tersedia)</span>
                <span className="font-semibold text-emerald-600">Total Modal: {formatRupiah(kpi.totalCostValuation)}</span>
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
                placeholder="Cari nama produk, barcode/SKU, kategori, atau supplier..."
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

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Semua Kategori ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Semua Kondisi Stok</option>
                <option value="safe">Stok Aman</option>
                <option value="low">Stok Menipis ({kpi.lowStockCount})</option>
                <option value="out">Stok Habis ({kpi.outOfStockCount})</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="stock_desc">Stok Terbanyak</option>
                <option value="stock_asc">Stok Paling Sedikit</option>
                <option value="price_desc">Harga Jual Tertinggi</option>
                <option value="price_asc">Harga Jual Termurah</option>
                <option value="margin_desc">Keuntungan / Margin Terbesar</option>
              </select>

              {/* View Mode Toggle: Grid Card vs Table */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Kartu Visual"
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

        {/* Content View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
                <div className="w-full h-36 bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <HiOutlineShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tidak ada produk yang cocok dengan kata kunci pencarian atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStockStatusFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* =========================================================================
             GRID CARD VIEW (Visual Modern Kartu Produk)
             ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProducts.map((prod) => {
              const catName = categoryMap.get(String(prod.category_id)) || prod.category_id || "Umum";
              const supName = supplierMap.get(String(prod.supplier_id)) || prod.supplier_id || "-";
              const stock = Number(prod.stock) || 0;
              const minStock = Number(prod.min_stock) || 5;
              const cost = Number(prod.cost_price) || 0;
              const price = Number(prod.price) || 0;
              const profit = price - cost;
              const marginPct = cost > 0 ? Math.round((profit / cost) * 100) : 0;
              const isActive = prod.is_active !== false;

              // Stock health color
              let stockBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
              let stockLabel = "Stok Aman";
              if (stock === 0) {
                stockBadgeClass = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
                stockLabel = "Habis (Kosong)";
              } else if (stock <= minStock) {
                stockBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                stockLabel = "Stok Menipis";
              }

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Image, Badges & Barcode Preview */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg truncate max-w-[150px]">
                        {catName}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockBadgeClass}`}>
                          {stockLabel}
                        </span>

                        <button
                          onClick={() => handleToggleStatus(prod)}
                          title="Klik untuk ubah status"
                          className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                      </div>
                    </div>

                    {/* Product Image & Barcode */}
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-100 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                        <img
                          src={prod.img_url || "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2553/2553642.png";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {prod.name}
                        </h3>

                        {/* Barcode Snippet */}
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <span>SKU: {prod.barcode || "-"}</span>
                        </div>

                        {supName !== "-" && (
                          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                            Mitra: {supName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Margin Highlight */}
                    <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Harga Jual Kasir</span>
                        <span className="text-base font-black text-slate-900">
                          {formatRupiah(price)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Modal (HPP)</span>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs font-semibold text-slate-600">
                            {formatRupiah(cost)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            +{marginPct}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Quantity Progress Bar */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Stok Fisik Tersedia</span>
                        <span className="font-black text-slate-800">
                          {stock} unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stock === 0
                              ? "bg-rose-500 w-0"
                              : stock <= minStock
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(10, (stock / Math.max(stock, minStock * 3)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenStockModal(prod)}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                    >
                      <HiOutlineAdjustmentsHorizontal className="w-3.5 h-3.5" />
                      <span>Sesuaikan Stok</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/products/${toSlug(prod.name)}`}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Edit Produk"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(String(prod.id), prod.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hapus Produk"
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
             TABLE VIEW (Tampilan Tabel Rinci Berfitur Lengkap)
             ========================================================================= */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nama Produk & Varian
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Harga Modal (HPP)
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Harga Jual
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Stok Fisik
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedProducts.map((p) => {
                    const catName = categoryMap.get(String(p.category_id)) || p.category_id || "Umum";
                    const stock = Number(p.stock) || 0;
                    const minStock = Number(p.min_stock) || 5;
                    const cost = Number(p.cost_price) || 0;
                    const price = Number(p.price) || 0;
                    const isActive = p.is_active !== false;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Barcode Visual */}
                        <td className="px-6 py-3.5">
                          <div className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg inline-block">
                            <Barcode
                              value={p.barcode || "00000000"}
                              width={1}
                              height={24}
                              fontSize={10}
                              margin={0}
                              displayValue={true}
                            />
                          </div>
                        </td>

                        {/* Name & Avatar */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={p.img_url || "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2553/2553642.png";
                                }}
                              />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: #{p.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px]">
                            {catName}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="px-6 py-3.5 text-right font-semibold text-slate-500">
                          {formatRupiah(cost)}
                        </td>

                        {/* Sell Price */}
                        <td className="px-6 py-3.5 text-right font-black text-slate-900">
                          {formatRupiah(price)}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                              stock === 0
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : stock <= minStock
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                            title="Klik untuk sesuaikan stok"
                          >
                            <span>{stock} unit</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenStockModal(p)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sesuaikan Stok Cepat"
                            >
                              <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/products/${toSlug(p.name)}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(String(p.id), p.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Produk"
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
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span>{" "}
            dari <span className="font-bold text-slate-800">{filteredProducts.length}</span> produk
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
            MODAL: Penyesuaian Stok Cepat (Quick Stock Adjustment)
            ========================================================================= */}
        {stockModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black">Penyesuaian Stok Cepat</h3>
                  <p className="text-xs text-blue-100 truncate max-w-[280px]">
                    {stockModalProduct.name}
                  </p>
                </div>
                <button
                  onClick={() => setStockModalProduct(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl transition-colors"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitStockAdjustment} className="p-6 space-y-4">
                {/* Current Stock Preview */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Stok Saat Ini:</span>
                    <span className="text-2xl font-black text-slate-900">
                      {stockModalProduct.stock || 0} unit
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Batas Minimum:</span>
                    <span className="text-sm font-bold text-slate-700">
                      {stockModalProduct.min_stock || 5} unit
                    </span>
                  </div>
                </div>

                {/* Adjustment Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Jenis Penyesuaian
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentType("add")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        adjustmentType === "add"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      + Tambah
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType("reduce")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        adjustmentType === "reduce"
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      - Kurangi
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType("set")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        adjustmentType === "set"
                          ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      = Set Baru
                    </button>
                  </div>
                </div>

                {/* Adjustment Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Resulting Stock Preview */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Hasil Akhir Stok:</span>
                  <span className="font-black text-blue-700 text-sm">
                    {adjustmentType === "add"
                      ? (Number(stockModalProduct.stock) || 0) + Number(adjustmentQty)
                      : adjustmentType === "reduce"
                      ? Math.max(0, (Number(stockModalProduct.stock) || 0) - Number(adjustmentQty))
                      : Number(adjustmentQty)}{" "}
                    unit
                  </span>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Keterangan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Restok dari vendor / Barang rusak"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStockModalProduct(null)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAdjusting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isAdjusting ? "Menyimpan..." : "Simpan Stok Baru"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
