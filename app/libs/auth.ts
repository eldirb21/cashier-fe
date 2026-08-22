// "use client"
// import { cookies } from "next/headers";
// import { RoleType } from "./roles";

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!document.cookie.split("; ").find((c) => c.startsWith("token="));
}

// export async function getSession() {
//   // ganti dengan logic auth kamu (NextAuth, JWT decode, dsb)
//   const cookieStore = cookies();
//   const token = cookieStore.get("session_token")?.value;
//   if (!token) return null;

//   // contoh dummy decode
//   return { role: "ADMIN" as RoleType, name: "John Doe" };
// }
