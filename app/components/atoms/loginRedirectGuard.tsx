// app/components/atoms/LoginRedirectGuard.tsx
"use client";

import { useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginRedirectGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) return null; // hindari flash halaman login
  return <>{children}</>;
}
