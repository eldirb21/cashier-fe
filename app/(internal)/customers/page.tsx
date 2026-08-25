"use client";

import React from "react";
import { HiPlus, HiSearch } from "react-icons/hi";
import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { useRouter } from "next/navigation";
import { toSlug } from "@/app/libs";

const Customers = () => {
  const router = useRouter();
  const { confirm, showAlert } = useConfirm();

  const users = [
    { name: "Maulayya", email: "maul@gmail.com" },
    { name: "admin", email: "admin@gmail.com" },
  ];

  const handleDelete = (id: string) => {
    confirm({
      type: "danger",
      title: "Hapus Customer?",
      message: "Data ini akan hilang dari stok dan laporan.",
      onSave: () => {
        // Langkah 3: Beri tahu sukses
        showAlert("Customer berhasil dihapus!", "success");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8">
        {/* Action Bar: Search & Add New */}
        <div className="flex flex-col md:flex-row gap-2 gap-0 mb-6 shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => router.push(`/customers/new`)}
            className="flex items-center justify-center gap-2 bg-[#1e5bb8] hover:bg-blue-700 text-white px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap"
          >
            <HiPlus size={20} />
            ADD CUSTOMER
          </button>

          <div className="flex flex-1 bg-white">
            <input
              type="text"
              placeholder="search by customer name"
              className="flex-1 px-4 py-3 text-sm border-none focus:ring-0 placeholder:text-gray-400 text-gray-600"
            />
            <button className="bg-[#1e5bb8] hover:bg-blue-700 text-white px-8 py-3 text-sm font-bold transition-colors">
              SEARCH
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right md:text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end md:justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/customers/${toSlug(user.email)}`)
                          }
                          className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.email)}
                          className="px-4 py-1.5 bg-[#cc4b4b] hover:bg-red-700 text-white rounded-md text-xs font-bold transition-all shadow-sm"
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center">
            <button className="text-gray-300 hover:text-gray-600">
              <span className="text-lg">‹</span>
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1e5bb8] text-white text-xs font-bold shadow-md">
                1
              </button>
            </div>
            <button className="text-gray-300 hover:text-gray-600">
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customers;
