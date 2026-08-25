"use client";

import { SupplierForm } from "@/app/components/molecules";
import { useParams, useRouter } from "next/navigation";

export default function EditSupplier() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  return <SupplierForm />;
}
