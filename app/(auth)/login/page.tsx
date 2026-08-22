import Login from "@/app/components/organisms/Login";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke sistem kasir",
};

export default function LoginPage() {
  return <Login />;
}
