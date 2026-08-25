"use client";

import React from "react";
import { HiOutlineBell } from "react-icons/hi";

export const Headers = () => {
  return (
    <>
      <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-1" />

        {/* Right Info Badge & Profile */}
        <div className="flex items-center gap-5 text-xs">
          <span className="text-gray-500 font-medium hidden sm:inline">
            Central Store
          </span>
          <div className="flex items-center gap-2 bg-emerald-50 text-gray-700 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-gray-800">
              Shift open · Rina
            </span>
          </div>
          <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <HiOutlineBell size={18} />
          </button>
        </div>
      </header>
    </>
  );
};
