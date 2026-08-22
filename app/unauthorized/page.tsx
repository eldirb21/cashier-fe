"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  logoutUser,
  selectCurrentUser,
  selectUserRole,
} from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { HiOutlineLockClosed, HiOutlineLogout } from "react-icons/hi";

export default function UnauthorizedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
          <HiOutlineLockClosed size={40} />
        </div>

        {/* Title & Desc */}
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100/80 text-amber-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            403 - Akses Ditolak
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Tidak Memiliki Izin Akses
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Akun Anda saat ini tidak memiliki izin untuk mengakses modul internal kasir.
          </p>
        </div>

        {/* Account Info Box */}
        <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Pengguna:</span>
            <span className="font-semibold text-gray-800">
              {user?.name || "Tidak diketahui"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Email / ID:</span>
            <span className="font-semibold text-gray-800">
              {user?.identifier || "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Role:</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-md">
              {role || "CUSTOMER"}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Silakan hubungi Administrator atau login menggunakan akun staf (Admin / Cashier / SPV / Manager / Owner).
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-[#0e5444] text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:shadow-xl transition-all cursor-pointer"
          >
            <HiOutlineLogout size={18} />
            <span>Keluar & Ganti Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
