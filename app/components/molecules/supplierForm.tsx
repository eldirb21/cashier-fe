"use client";

import { useRouter } from "next/navigation";
import { Modal } from "../atoms";

export function SupplierForm() {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()} title="Supplier Form" onSave={() => {}}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Supplier Name
          </label>
          <input
            type="text"
            placeholder="Enter Supplier Name"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="Enter Phone Number"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
