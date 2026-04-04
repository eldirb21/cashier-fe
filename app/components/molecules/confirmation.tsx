"use client";

import { HiPlus, HiExclamation, HiCheck, HiX, HiTrash } from "react-icons/hi";

type Props = {
  type?: "info" | "danger" | "error" | "confirm";
  onClose?: () => void;
  onSave?: () => void;
  visible?: boolean;
  title?: string;
  message?: string;
};

export function Confirmation({
  type = "confirm",
  visible,
  onSave,
  onClose,
  title,
  message,
}: Props) {
  if (!visible) return null;

  const config = {
    info: {
      icon: <HiCheck className="text-blue-500" size={40} />,
      btnColor: "bg-blue-600 hover:bg-blue-700",
      label: "Understand",
    },
    danger: {
      icon: <HiTrash className="text-red-500" size={40} />,
      btnColor: "bg-red-600 hover:bg-red-700",
      label: "Delete",
    },
    error: {
      icon: <HiX className="text-orange-500" size={40} />,
      btnColor: "bg-orange-600 hover:bg-orange-700",
      label: "Close",
    },
    confirm: {
      icon: <HiExclamation className="text-yellow-500" size={40} />,
      btnColor: "bg-[#1e5bb8] hover:bg-blue-700",
      label: "Confirm",
    },
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Kontainer Modal Utama */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100">
        {/* Konten Atas (Ikon & Teks) */}
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full">{current.icon}</div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-tight">
              {title || "Are you sure?"}
            </h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {message ||
                "This action cannot be undone. Please double check before proceeding."}
            </p>
          </div>
        </div>

        {/* Footer / Tombol Aksi */}
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={`flex-1 px-6 py-3 ${current.btnColor} text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 transition-all active:scale-95`}
          >
            {type === "danger" ? <HiTrash size={18} /> : <HiPlus size={18} />}
            {current.label}
          </button>
        </div>
      </div>
    </div>
  );
}
