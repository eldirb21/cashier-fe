"use client";

import { useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/slices/authSlice";
import { useI18n } from "@/app/i18n";
import { Headers } from "../atoms";
import { HiOutlineBell, HiChat } from "react-icons/hi";
import { BestSellingChart, LimitStock, StatsCards } from "../molecules";

export default function Dashboard() {
  const user = useAppSelector(selectCurrentUser);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-2xl font-bold text-brand-ink">
          {t.dashboard?.title ?? "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.dashboard?.welcome ?? "Selamat datang kembali"}
          {user?.name ? `, ${user.name}` : ""}
        </p>
      </div> */}
      {/* ── TOP NAVBAR ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-1">
          <span className="text-base font-black text-gray-900 tracking-tight">
            {t.dashboard?.title ?? "Dashboard"}
          </span>
        </div>

        {/* Right Info Badge & Profile */}
        <div className="flex items-center gap-5 text-xs">
          <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <HiChat size={18} />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <HiOutlineBell size={18} />
          </button>
        </div>
      </header>

      {/* Summary cards — sesuaikan dengan data asli nanti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label={t.dashboard?.todaySales ?? "Penjualan Hari Ini"}
          value="Rp 0"
        />
        <SummaryCard
          label={t.dashboard?.totalTransactions ?? "Total Transaksi"}
          value="0"
        />
        <SummaryCard
          label={t.dashboard?.totalProducts ?? "Total Produk"}
          value="0"
        />
        <SummaryCard
          label={t.dashboard?.totalCustomers ?? "Total Pelanggan"}
          value="0"
        />
      </div>
      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BestSellingChart />
          </div>

          <LimitStock />
        </div>
      </main>

      {/* Placeholder area untuk chart/table selanjutnya */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-400">
          Konten dashboard lainnya (grafik penjualan, transaksi terbaru, dll)
          bisa ditambahkan di sini.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-brand-ink mt-1">{value}</p>
    </div>
  );
}
