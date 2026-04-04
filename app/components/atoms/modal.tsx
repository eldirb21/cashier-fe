import React from "react";
import { HiX, HiPlus } from "react-icons/hi";

type Props = {
  onClose?: () => void;
  onSave?: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ onClose, onSave, title = "Modal", children }: Props) {
  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      {/* Backdrop: Klik untuk kembali ke halaman sebelumnya */}
      <div
        className="absolute inset-0 bg-white/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <HiX size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">{children}</div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-8 py-2.5 bg-[#1e5bb8] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-blue-700"
          >
            <HiPlus size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
