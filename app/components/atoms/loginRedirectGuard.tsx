"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LoginRedirectGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split(";")
      .find((c) => c.startsWith("token="));
    if (token) {
      // Sudah login → ganti history ke dashboard
      router.replace("/dashboard");
    } else {
      // Hapus history lama dengan mengganti state
      window.history.replaceState({}, "", "/auth/login");
    }
  }, [router]);

  return <>{children}</>;
}
