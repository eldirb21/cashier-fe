"use client";

import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { toSlug } from "@/app/libs";
import { categories } from "@/app/libs/data";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiPlus, HiOutlineSearch } from "react-icons/hi";

const Categories = () => {
  const { confirm, showAlert } = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);

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

  const filtered = useMemo(() => {
    return categories.filter((item) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch, categories]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8">
        {/* Action Bar: Add & Search */}
        <div className="flex flex-col md:flex-row shadow-sm rounded-xl overflow-hidden border border-gray-200 mb-8">
          <Link
            href="/categories/new"
            className="bg-[#1e5bb8] flex items-center text-white px-6 py-3 rounded-lg font-bold text-sm"
          >
            <HiPlus size={20} />
            ADD NEW
          </Link>

          <div className="flex flex-1 bg-white">
            <div className="flex items-center px-4 text-gray-300">
              <HiOutlineSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="search by category name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-4 text-sm border-none focus:ring-0 placeholder:text-gray-300 text-gray-600"
            />
            <button
              onClick={() => {}}
              className="bg-[#1e5bb8] hover:bg-blue-700 text-white px-8 py-4 text-sm font-bold uppercase"
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right md:text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-gray-400 text-sm"
                    >
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img
                              src={cat.img}
                              alt={cat.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500">
                          {cat.description}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end md:justify-center gap-2">
                          <Link
                            href={`/categories/${toSlug(cat.name)}`} // Navigasi ke URL Edit
                            className="px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-5 py-2 bg-[#cc4b4b] hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-5 border-t border-gray-50 flex justify-between items-center bg-white">
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <span className="text-2xl">‹</span>
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e5bb8] text-white text-xs font-bold shadow-md">
                1
              </button>
            </div>
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <span className="text-2xl">›</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;
