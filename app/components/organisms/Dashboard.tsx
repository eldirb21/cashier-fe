"use client";

import { useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/slices/authSlice";
import { useI18n } from "@/app/i18n";

export default function Dashboard() {
  const user = useAppSelector(selectCurrentUser);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">
          {t.dashboard?.title ?? "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.dashboard?.welcome ?? "Selamat datang kembali"}
          {user?.name ? `, ${user.name}` : ""}
        </p>
      </div>

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
