"use client";

import { Headers } from "@/app/components/atoms";
import React from "react";
import { HiPlus } from "react-icons/hi";
import Barcode from "react-barcode";
import Link from "next/link";
import { formatRupiah, toSlug } from "@/app/libs";
import { useConfirm } from "@/app/components/molecules";
import { products } from "@/app/libs/data";

const Products = () => {
  const { confirm, showAlert } = useConfirm();

  const handleDelete = (id: string) => {
    confirm({
      type: "danger",
      title: "Hapus Produk?",
      message: "Data ini akan hilang dari stok dan laporan.",
      onSave: () => {
        // Langkah 2: Proses hapus (API call)
        console.log("Menghapus id:", id);

        // Langkah 3: Beri tahu sukses
        showAlert("Produk berhasil dihapus!", "success");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8">
        {/* Search & Add Section */}
        <div className="flex flex-col md:flex-row shadow-sm rounded-xl overflow-hidden border border-gray-200 mb-8">
          <Link
            href="/products/new"
            className="bg-[#1e5bb8] flex items-center text-white px-6 py-3 rounded-lg font-bold text-sm"
          >
            <HiPlus size={20} />
            ADD NEW
          </Link>

          <div className="flex flex-1 bg-white">
            <input
              type="text"
              placeholder="search by product name"
              className="flex-1 px-5 py-4 text-sm border-none focus:ring-0 placeholder:text-gray-300"
            />
            <button className="bg-[#1e5bb8] hover:bg-blue-700 text-white px-8 py-4 text-sm font-bold transition-all">
              SEARCH
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Sell Price
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Barcode Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center max-w-25">
                        <div className="bg-white border p-1 rounded">
                          <Barcode
                            fontSize={12}
                            margin={0}
                            ean128
                            displayValue={true}
                            height={30}
                            width={1}
                            value={item.barcode}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center">
                          <img
                            src={item.img_url}
                            alt={item.name}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {item.category_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {formatRupiah(item.cost_price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {item.stock}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/products/${toSlug(item.name)}`} // Navigasi ke URL Edit
                          className="px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item.barcode)}
                          className="px-4 py-2 bg-[#cc4b4b] hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-5 border-t border-gray-50 flex justify-between items-center bg-white">
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <span className="text-xl font-light">‹</span>
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e5bb8] text-white text-xs font-bold shadow-md">
                1
              </button>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <span className="text-xl font-light">›</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
