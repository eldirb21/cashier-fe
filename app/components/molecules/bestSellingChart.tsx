"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// 1. Data Dummy (Sesuai gambar)
const data = [
  { name: "Aqua 600 ML", value: 61.5, color: "#16a34a" }, // Hijau tua (Tailwind green-600)
  { name: "Aqua Galon", value: 30.4, color: "#dc2626" }, // Merah tua (Tailwind red-600)
  { name: "Galon Le Minerale 5 L", value: 8.1, color: "#15803d" }, // Hijau tua legend (Tailwind green-700)
];

// 2. Custom Label untuk menampilkan persentase di dalam slice
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

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-bold" // Ukuran teks persentase kecil & tebal
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// 3. Custom Legend untuk menyamai gaya di gambar
const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 px-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          {/* Lingkaran Warna Legend */}
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.payload.color }}
          />
          {/* Teks Legend */}
          <span className="text-[11px] font-semibold text-gray-600">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

export const BestSellingChart = () => {
  return (
    // Card Container
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      {/* Title */}
      <h2 className="text-[13px] font-bold text-gray-800 tracking-tight mb-2 uppercase">
        PRODUCTS BEST SELLING
      </h2>

      {/* Chart Area - ResponsiveContainer membuatnya otomatis menyesuaikan lebar */}
      <div className="flex-grow w-full h-[280px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Tooltip
              contentStyle={{
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "8px 12px",
              }}
              itemStyle={{ fontSize: "12px", color: "#333" }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />

            <Pie
              data={data}
              cx="50%" // Center X
              cy="50%" // Center Y
              labelLine={false} // Matikan garis label luar
              label={renderCustomizedLabel} // Gunakan label kustom di dalam
              outerRadius="90%" // Seberapa besar lingkaran mengisi container
              fill="#8884d8"
              dataKey="value"
              startAngle={90} // Mulai dari atas
              endAngle={450} // Putar penuh
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none" // Matikan border antar slice agar mulus seperti gambar
                />
              ))}
            </Pie>

            {/* Legend di bagian bawah */}
            <Legend
              content={renderCustomLegend}
              iconSize={10}
              wrapperStyle={{ bottom: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
