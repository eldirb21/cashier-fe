"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export interface BestSellingProduct {
  name: string;
  value: number; // percentage or quantity
  qty?: number;
  revenue?: number;
  color?: string;
}

const PALETTE = [
  "#16a34a", // emerald-600
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
];

// Fallback data default
const defaultData: BestSellingProduct[] = [
  { name: "Aqua 600 ML", value: 61.5, qty: 124, revenue: 372000, color: "#16a34a" },
  { name: "Aqua Galon", value: 30.4, qty: 62, revenue: 1240000, color: "#dc2626" },
  { name: "Galon Le Minerale 5 L", value: 8.1, qty: 16, revenue: 240000, color: "#15803d" },
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-bold drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4 px-2">
      {payload?.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.payload.color }}
          />
          <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[140px]">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

interface BestSellingChartProps {
  data?: BestSellingProduct[];
  isLoading?: boolean;
}

export const BestSellingChart: React.FC<BestSellingChartProps> = ({
  data,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");

  const rawList = data && data.length > 0 ? data : defaultData;
  const chartData = rawList.map((item, i) => ({
    ...item,
    color: item.color || PALETTE[i % PALETTE.length],
  }));

  const formatRp = (val?: number) =>
    val
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(val)
      : "-";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[13px] font-bold text-gray-800 tracking-tight uppercase">
            PRODUCTS BEST SELLING
          </h2>
          <p className="text-[11px] text-gray-400">Kontribusi produk terlaris</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("chart")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
              viewMode === "chart"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Chart
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Rank List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[280px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : viewMode === "chart" ? (
        <div className="flex-grow w-full h-[280px] lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${Number(value).toFixed(1)}% ${
                    item.payload.qty ? `(${item.payload.qty} terjual)` : ""
                  }`,
                  name,
                ]}
                contentStyle={{
                  border: "none",
                  borderRadius: "10px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                itemStyle={{ fontSize: "12px", color: "#1f2937", fontWeight: 600 }}
              />

              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="88%"
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>

              <Legend
                content={renderCustomLegend}
                iconSize={10}
                wrapperStyle={{ bottom: 0 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-center divide-y divide-gray-100 overflow-y-auto max-h-[320px]">
          {chartData.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {item.qty ? `${item.qty} unit terjual` : `Porsi: ${item.value.toFixed(1)}%`}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-gray-900">
                  {item.revenue ? formatRp(item.revenue) : `${item.value.toFixed(1)}%`}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {item.value.toFixed(1)}% share
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

