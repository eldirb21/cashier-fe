"use client";

import React from "react";
import Link from "next/link";
import { HiOutlineCube, HiCheckCircle, HiExclamationTriangle } from "react-icons/hi2";

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  min_stock?: number;
  barcode?: string;
}

interface LimitStockProps {
  items?: LowStockItem[];
  isLoading?: boolean;
}

const defaultItems: LowStockItem[] = [
  { id: "1", name: "Aqua Galon 19L", stock: 4, min_stock: 10 },
  { id: "2", name: "Minyak Bimoli 2L", stock: 6, min_stock: 15 },
  { id: "3", name: "Gula Pasir Gulaku 1kg", stock: 7, min_stock: 12 },
];

export function LimitStock({ items, isLoading = false }: LimitStockProps) {
  const displayItems = items !== undefined ? items : defaultItems;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[13px] font-bold text-gray-800 tracking-tight uppercase">
              PRODUCTS LIMIT STOCK
            </h2>
            <p className="text-[11px] text-gray-400">Peringatan stok menipis</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
            <HiExclamationTriangle className="w-3.5 h-3.5 text-amber-500" />
            {displayItems.length} Produk
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <HiCheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-gray-800">Stok Aman</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Tidak ada produk yang melewati batas minimum stok saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {displayItems.slice(0, 5).map((item) => {
              const isZero = item.stock <= 0;
              const isVeryLow = item.stock <= 5;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-gray-100/70 transition-colors rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isZero
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : isVeryLow
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      <HiOutlineCube size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Min. stok: {item.min_stock ?? 10}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isZero
                          ? "bg-red-100 text-red-700"
                          : isVeryLow
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      Sisa {item.stock}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t border-gray-100">
        <Link
          href="/products"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-all"
        >
          Kelola Inventori & Restok &rarr;
        </Link>
      </div>
    </div>
  );
}

