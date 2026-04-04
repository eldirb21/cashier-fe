import React from "react";
import { HiOutlineCube } from "react-icons/hi";

type Props = {};

export function LimitStock({}: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      <h2 className="text-[13px] font-bold text-gray-800 tracking-tight mb-5 uppercase">
        PRODUCTS LIMIT STOCK
      </h2>

      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
          <HiOutlineCube size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Aqua Galon</p>
          <p className="text-xs font-medium text-red-600">Stock: 4</p>
        </div>
      </div>
    </div>
  );
}
