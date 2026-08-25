// app/dashboard/layout.tsx  (atau app/(dashboard)/layout.tsx kalau kamu pakai route group)
"use client";

import { AuthGuard } from "@/app/components/atoms/AuthGuard";
import Sidebar from "@/app/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
