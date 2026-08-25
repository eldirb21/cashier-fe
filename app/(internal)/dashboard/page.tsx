import Dashboard from "@/app/components/organisms/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan aktivitas toko",
};

export default function DashboardPage() {
  return <Dashboard />;
}
