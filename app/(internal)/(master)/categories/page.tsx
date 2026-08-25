"use client";

import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useDebounce } from "@/app/hooks";
import { toSlug } from "@/app/libs";
import { categories as initialCategories } from "@/app/libs/data";
import { Category } from "@/app/libs/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiPlus, HiOutlineSearch } from "react-icons/hi";

const Categories = () => {
  const { confirm, showAlert } = useConfirm();
  const [categoryData, setCategoryData] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string, name: string) => {
    confirm({
      type: "danger",
      title: "Hapus Kategori?",
      message: `Kategori "${name}" akan dihapus dari sistem.`,
      onSave: () => {
        setCategoryData((prev) => prev.filter((item) => item.id !== id));
        showAlert("Kategori berhasil dihapus!", "success");
      },
    });
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return categoryData;
    return categoryData.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.slug && item.slug.toLowerCase().includes(q))
    );
  }, [debouncedSearch, categoryData]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8">
        {/* Action Bar: Add & Search */}
        <div className="flex flex-col md:flex-row shadow-sm rounded-xl overflow-hidden border border-gray-200 mb-8">
          <Link
            href="/categories/new"
            className="bg-[#1e5bb8] hover:bg-blue-700 transition-colors flex items-center gap-2 text-white px-6 py-3 font-bold text-sm"
          >
            <HiPlus size={20} />
            TAMBAH KATEGORI
          </Link>

          <div className="flex flex-1 bg-white">
            <div className="flex items-center px-4 text-gray-300">
              <HiOutlineSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau deskripsi kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-4 text-sm border-none focus:ring-0 placeholder:text-gray-300 text-gray-600 outline-none"
            />
            <button
              onClick={() => {}}
              className="bg-[#1e5bb8] hover:bg-blue-700 text-white px-8 py-4 text-sm font-bold uppercase transition-colors"
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
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-5 bg-gray-200 rounded-full w-14 mx-auto animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-8 bg-gray-200 rounded-lg w-28 mx-auto animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-gray-400 text-sm font-medium"
                    >
                      Tidak ada kategori yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat, index) => (
                    <tr
                      key={cat.id || index}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Name & Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-blue-50/50 border border-gray-100 p-2 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <img
                              src={cat.img || cat.img_url || "https://cdn-icons-png.flaticon.com/512/2553/2553642.png"}
                              alt={cat.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-800 block">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              ID: #{cat.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-[#1e5bb8] bg-blue-50/80 px-2.5 py-1 rounded-lg">
                          /{cat.slug || toSlug(cat.name)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-xs font-medium text-gray-500 line-clamp-2">
                          {cat.description || "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {cat.is_active !== false ? (
                          <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[11px] font-bold inline-block">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold inline-block">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/categories/${cat.id}`}
                            className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="px-3.5 py-1.5 bg-[#cc4b4b] hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
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
          <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center bg-white">
            <span className="text-xs text-gray-400 font-medium">
              Menampilkan {filtered.length} kategori
            </span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-50">
                <span className="text-lg">‹</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e5bb8] text-white text-xs font-bold shadow-md">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-50">
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;
