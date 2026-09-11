"use client";

import { ProductForm } from "@/app/components/molecules";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  return <ProductForm id={id} />;
}
