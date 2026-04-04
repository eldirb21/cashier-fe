"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/app/libs/auth";

type Props = { children: React.ReactNode };

export function ProtectedRoute({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth/login");
    }
  }, [router]);

  if (!isLoggedIn()) return null;

  return <>{children}</>;
}
