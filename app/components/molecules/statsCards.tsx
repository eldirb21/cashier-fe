"use client";

import React from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

export interface TrendPoint {
  date?: string;
  val: number;
}

export interface StatsCardsProps {
  salesTodayCount?: number;
  salesTodayAmount?: number;
  profitsTodayAmount?: number;
  totalSalesPeriod?: number;
  totalProfitsPeriod?: number;
  periodLabel?: string;
  salesTrendData?: TrendPoint[];
  profitTrendData?: TrendPoint[];
  isLoading?: boolean;
}

const defaultAreaData: TrendPoint[] = [
  { val: 180000 },
  { val: 240000 },
  { val: 320000 },
  { val: 290000 },
  { val: 410000 },
  { val: 490000 },
  { val: 560000 },
];

const defaultBarData: TrendPoint[] = [
  { val: 45000 },
  { val: 62000 },
  { val: 80000 },
  { val: 74000 },
  { val: 98000 },
  { val: 115000 },
  { val: 138000 },
];

const formatRupiah = (val?: number) => {
  const num = val ?? 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  salesTodayCount,
  salesTodayAmount,
  profitsTodayAmount,
  totalSalesPeriod,
  totalProfitsPeriod,
  periodLabel = "7 hari terakhir",
  salesTrendData = defaultAreaData,
  profitTrendData = defaultBarData,
  isLoading = false,
}) => {
  const displaySalesTodayCount = salesTodayCount ?? 1;
  const displaySalesTodayAmount = salesTodayAmount ?? 22000;
  const displayProfitsTodayAmount = profitsTodayAmount ?? 3500;
  const displayTotalSalesPeriod = totalSalesPeriod ?? 47000;
  const displayTotalProfitsPeriod = totalProfitsPeriod ?? 7500;

  const effectiveAreaData =
    salesTrendData && salesTrendData.length > 0 ? salesTrendData : defaultAreaData;
  const effectiveBarData =
    profitTrendData && profitTrendData.length > 0 ? profitTrendData : defaultBarData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. SALES TODAY */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            SALES TODAY
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
            Live
          </span>
        </div>
        <div className="mt-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded my-1" />
          ) : (
            <h3 className="text-2xl font-bold text-gray-900">
              {displaySalesTodayCount}{" "}
              <span className="text-xs font-medium text-gray-500">transaksi</span>
            </h3>
          )}
        </div>
        <div className="w-full h-[1px] bg-gray-100 my-3" />
        {isLoading ? (
          <div className="h-6 w-28 bg-gray-100 animate-pulse rounded" />
        ) : (
          <p className="text-lg font-bold text-blue-600">
            {formatRupiah(displaySalesTodayAmount)}
          </p>
        )}
      </div>

      {/* 2. PROFITS TODAY */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            PROFITS TODAY
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
            Laba Bersih
          </span>
        </div>
        <div className="my-auto py-2">
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
          ) : (
            <>
              <p className="text-2xl font-bold text-emerald-600">
                {formatRupiah(displayProfitsTodayAmount)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Estimasi laba hari ini
              </p>
            </>
          )}
        </div>
      </div>

      {/* 3. SALES (With Area Chart) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col justify-between">
        <div className="p-5 pb-1 z-10">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              TOTAL SALES
            </p>
            <span className="text-[10px] font-medium text-gray-400 capitalize">
              {periodLabel}
            </span>
          </div>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatRupiah(displayTotalSalesPeriod)}
            </p>
          )}
        </div>
        {/* Grafik Area di bagian bawah */}
        <div className="h-16 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={effectiveAreaData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Tooltip
                formatter={(value: any) => [formatRupiah(Number(value)), "Penjualan"]}
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "4px 8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. PROFITS (With Bar Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              TOTAL PROFITS
            </p>
            <span className="text-[10px] font-medium text-gray-400 capitalize">
              {periodLabel}
            </span>
          </div>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600">
              {formatRupiah(displayTotalProfitsPeriod)}
            </p>
          )}
        </div>

        {/* Grafik Bar Mini */}
        <div className="h-12 w-full mt-3 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={effectiveBarData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip
                formatter={(value: any) => [formatRupiah(Number(value)), "Laba"]}
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "4px 8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="val" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
