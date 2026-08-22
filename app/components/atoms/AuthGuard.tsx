// app/components/atoms/AuthGuard.tsx
"use client";

import { useAppSelector } from "@/app/store/hooks";
import {
  selectCurrentUser,
  selectIsInitialized,
} from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  const isInitialized = useAppSelector(selectIsInitialized);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  if (!user) return null;
  return <>{children}</>;
}
