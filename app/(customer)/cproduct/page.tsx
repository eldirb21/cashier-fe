import { CProductList } from "@/app/components/organisms/customer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beraku-Product",
  description: "Product List Beraku",
};

export default function ProductPage() {
  return <CProductList />;
}
