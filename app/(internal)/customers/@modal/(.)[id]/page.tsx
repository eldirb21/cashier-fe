"use client";

import { CustomerForm } from "@/app/components/molecules";
 import { useParams, useRouter } from "next/navigation";

export default function EditCustomer() {
  const params = useParams(); // Untuk mengambil ID dari URL
  const router = useRouter();
  const id = params.id;
  return <CustomerForm />;
}
