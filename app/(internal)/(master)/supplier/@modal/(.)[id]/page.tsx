"use client";

import { SupplierForm } from "@/app/components/molecules";
import { useParams, useRouter } from "next/navigation";

export default function EditSupplier() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  return <SupplierForm id={id} />;
}
