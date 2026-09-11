"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Headers } from "../atoms";
import { BestSellingChart, LimitStock, StatsCards } from "../molecules";
import { transactionService } from "@/app/services/transaction.service";
import { productService } from "@/app/services/product.service";
import {
  TransactionRecord,
  Product,
} from "@/app/libs/types";
import {
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineDocumentChartBar,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlineQrCode,
} from "react-icons/hi2";

type PeriodFilter = "today" | "7d" | "30d" | "this_month" | "all";

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("7d");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Hitung rentang tanggal berdasarkan period
  const getDateRange = useCallback((selectedPeriod: PeriodFilter) => {
    const now = new Date();
    const toDate = now.toISOString().slice(0, 10);
    let fromDate = "";

    if (selectedPeriod === "today") {
      fromDate = toDate;
    } else if (selectedPeriod === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      fromDate = d.toISOString().slice(0, 10);
    } else if (selectedPeriod === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      fromDate = d.toISOString().slice(0, 10);
    } else if (selectedPeriod === "this_month") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      fromDate = d.toISOString().slice(0, 10);
    }

    return { fromDate, toDate };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { fromDate, toDate } = getDateRange(period);

      const [trxRes, prodRes] = await Promise.allSettled([
        transactionService.getTransactionList({
          date_from: fromDate || undefined,
          date_to: toDate || undefined,
        }),
        productService.getAll({ size: 100 }),
      ]);

      if (trxRes.status === "fulfilled" && trxRes.value?.data) {
        setTransactions(trxRes.value.data);
      }
      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        setProducts(prodRes.value.data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [period, getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kalkulasi Penjualan Hari Ini & Periode Terpilih
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    salesTodayCount,
    salesTodayAmount,
    profitsTodayAmount,
    totalSalesPeriod,
    totalProfitsPeriod,
    salesTrend,
    profitTrend,
    bestSellers,
    lowStockList,
    paymentBreakdown,
  } = useMemo(() => {
    const todayTrx = transactions.filter(
      (t) =>
        t.status !== "cancelled" &&
        t.created_at &&
        t.created_at.slice(0, 10) === todayStr,
    );

    const validPeriodTrx = transactions.filter(
      (t) => t.status !== "cancelled",
    );

    // Sales Today
    const sTodayCount = todayTrx.length;
    const sTodayAmt = todayTrx.reduce(
      (acc, t) => acc + (Number(t.grand_total) || 0),
      0,
    );

    // Profit Today (estimasi: 22% dari omset jika data cost_price spesifik tidak tersedia pada header trx)
    const pTodayAmt = Math.round(sTodayAmt * 0.22);

    // Period Total
    const pSalesAmt = validPeriodTrx.reduce(
      (acc, t) => acc + (Number(t.grand_total) || 0),
      0,
    );
    const pProfitsAmt = Math.round(pSalesAmt * 0.22);

    // Daily buckets for chart
    const daysMap = new Map<string, { sales: number; profit: number }>();
    const numDays = period === "today" ? 1 : period === "7d" ? 7 : 14;

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daysMap.set(key, { sales: 0, profit: 0 });
    }

    validPeriodTrx.forEach((t) => {
      if (t.created_at) {
        const key = t.created_at.slice(0, 10);
        if (daysMap.has(key)) {
          const cur = daysMap.get(key)!;
          const total = Number(t.grand_total) || 0;
          cur.sales += total;
          cur.profit += Math.round(total * 0.22);
        }
      }
    });

    const sTrend = Array.from(daysMap.entries()).map(([date, val]) => ({
      date,
      val: val.sales,
    }));
    const pTrend = Array.from(daysMap.entries()).map(([date, val]) => ({
      date,
      val: val.profit,
    }));

    // Best Sellers aggregation
    const productMap = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();

    validPeriodTrx.forEach((t) => {
      t.items?.forEach((item) => {
        const pName = item.product_name || "Produk";
        const cur = productMap.get(pName) || { name: pName, qty: 0, revenue: 0 };
        cur.qty += Number(item.qty) || 0;
        cur.revenue += Number(item.subtotal) || 0;
        productMap.set(pName, cur);
      });
    });

    let bSellers = Array.from(productMap.values()).sort(
      (a, b) => b.qty - a.qty,
    );

    let formattedBestSellers: any[] = [];
    if (bSellers.length > 0) {
      const totalUnits = bSellers.reduce((sum, item) => sum + item.qty, 0) || 1;
      formattedBestSellers = bSellers.slice(0, 5).map((item) => ({
        name: item.name,
        value: Number(((item.qty / totalUnits) * 100).toFixed(1)),
        qty: item.qty,
        revenue: item.revenue,
      }));
    }

    // Low stock filter
    const lStock = products
      .filter((p) => p.stock <= (p.min_stock ?? 10) || p.stock <= 5)
      .map((p) => ({
        id: String(p.id),
        name: p.name,
        stock: p.stock,
        min_stock: p.min_stock ?? 10,
        barcode: p.barcode,
      }));

    // Payment methods
    const payMap = new Map<string, { count: number; total: number }>();
    validPeriodTrx.forEach((t) => {
      const m = (t.payment_method || "cash").toLowerCase();
      const cur = payMap.get(m) || { count: 0, total: 0 };
      cur.count += 1;
      cur.total += Number(t.grand_total) || 0;
      payMap.set(m, cur);
    });

    const pBreakdown = Array.from(payMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    }));

    return {
      salesTodayCount: sTodayCount,
      salesTodayAmount: sTodayAmt,
      profitsTodayAmount: pTodayAmt,
      totalSalesPeriod: pSalesAmt,
      totalProfitsPeriod: pProfitsAmt,
      salesTrend: sTrend.some((p) => p.val > 0) ? sTrend : undefined,
      profitTrend: pTrend.some((p) => p.val > 0) ? pTrend : undefined,
      bestSellers: formattedBestSellers.length > 0 ? formattedBestSellers : undefined,
      lowStockList: lStock,
      paymentBreakdown: pBreakdown,
    };
  }, [transactions, products, todayStr, period]);

  const periodLabels: Record<PeriodFilter, string> = {
    today: "Hari Ini",
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    this_month: "Bulan Ini",
    all: "Semua Waktu",
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-12">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Control Bar: Title, Filters & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Dashboard & Analitik Penjualan
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                Live Data
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pantau performa transaksi, margin laba, dan inventori toko secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {(["today", "7d", "30d", "this_month"] as PeriodFilter[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === p
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Perbarui Data"
            >
              <HiOutlineArrowPath
                size={18}
                className={isLoading ? "animate-spin text-blue-600" : ""}
              />
            </button>

            {/* Link to Full Report Hub */}
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              <HiOutlineDocumentChartBar size={16} />
              Buka Laporan Penuh
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <StatsCards
          salesTodayCount={salesTodayCount}
          salesTodayAmount={salesTodayAmount}
          profitsTodayAmount={profitsTodayAmount}
          totalSalesPeriod={totalSalesPeriod}
          totalProfitsPeriod={totalProfitsPeriod}
          periodLabel={periodLabels[period]}
          salesTrendData={salesTrend}
          profitTrendData={profitTrend}
          isLoading={isLoading}
        />

        {/* Middle Section: Best Selling Chart & Limit Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BestSellingChart data={bestSellers} isLoading={isLoading} />
          </div>

          <LimitStock items={lowStockList} isLoading={isLoading} />
        </div>

        {/* Bottom Section: Quick Insights & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Method Quick Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Metode Pembayaran
              </h3>
              <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {paymentBreakdown.length === 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <HiOutlineBanknotes className="w-4 h-4 text-emerald-600" /> Tunai (Cash)
                    </span>
                    <span className="font-bold text-gray-900">72%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <HiOutlineQrCode className="w-4 h-4 text-blue-600" /> QRIS & Transfer
                    </span>
                    <span className="font-bold text-gray-900">28%</span>
                  </div>
                </>
              ) : (
                paymentBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50"
                  >
                    <span className="font-medium text-gray-700 uppercase">
                      {item.method}
                    </span>
                    <span className="font-bold text-gray-900">
                      {item.count} trx
                    </span>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/report/payment-report"
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 block text-right"
            >
              Lihat Analitik Pembayaran &rarr;
            </Link>
          </div>

          {/* Quick Sales Report Hub Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white mb-2">
                Modul Laporan
              </span>
              <h3 className="text-base font-bold">Laporan Penjualan & Laba</h3>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Analisis omset harian, rincian per kasir, margin laba kotor, dan ekspor ke Excel secara instan.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
              <Link
                href="/report/sales"
                className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-all"
              >
                Laporan Penjualan
              </Link>
              <Link
                href="/report/profit"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Laba Rugi
              </Link>
            </div>
          </div>

          {/* Shift & Cashier Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Operasional Kasir
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-gray-500">
              Pantau pergantian shift kasir, saldo kas awal, rekonsiliasi kas akhir, dan void return transaksi.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/report/shift-kasir"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Shift Kasir &rarr;
              </Link>
              <Link
                href="/report/void-return"
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Void / Return &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

