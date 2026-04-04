"use client";

import { useRouter } from "next/navigation";
import { Modal } from "../atoms";

export function CategoriesForm() {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()} title="New Categories" onSave={() => {}}>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Image
        </label>
        <input
          type="file"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Barcode
          </label>
          <input
            type="text"
            placeholder="Enter Barcode"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter Product Name"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Category
          </label>
          <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer">
            <option value="">-- Select Category --</option>
            <option value="1">Makanan Ringan</option>
            <option value="2">Mie Cup</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Stock
          </label>
          <input
            type="number"
            placeholder="Enter Stock Product"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
