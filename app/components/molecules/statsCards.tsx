"use client";

import React from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";

// Data dummy untuk grafik kecil
const areaData = [
  { val: 400 },
  { val: 300 },
  { val: 500 },
  { val: 200 },
  { val: 100 },
  { val: 50 },
];

const barData = [{ val: 10 }, { val: 15 }, { val: 8 }, { val: 12 }];

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. SALES TODAY */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          SALES TODAY
        </p>
        <h3 className="text-2xl font-bold text-gray-800">1</h3>
        <div className="w-full h-[1px] bg-gray-100 my-3"></div>
        <p className="text-xl font-bold text-gray-800">Rp 22.000,00</p>
      </div>

      {/* 2. PROFITS TODAY */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          PROFITS TODAY
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-1">Rp 3.500,00</p>
      </div>

      {/* 3. SALES (With Area Chart) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-5 pb-0 z-10">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              SALES
            </p>
            <p className="text-[10px] font-medium text-gray-400">Last 7 days</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">Rp 47.000,00</p>
        </div>
        {/* Grafik Area di bagian bawah */}
        <div className="h-16 w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            PROFITS
          </p>
          <p className="text-[10px] font-medium text-gray-400">Last 7 days</p>
        </div>
        <p className="text-2xl font-bold text-gray-800">Rp 7.500,00</p>

        {/* Grafik Bar Mini */}
        <div className="h-12 w-full mt-4 flex justify-center">
          <ResponsiveContainer width="60%" height="100%">
            <BarChart data={barData}>
              <Bar dataKey="val" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
