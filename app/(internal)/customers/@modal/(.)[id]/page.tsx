"use client";

import { CustomerForm } from "@/app/components/molecules";
import { useParams } from "next/navigation";

export default function EditCustomerModal() {
  const params = useParams();
  const id = params?.id as string;
  return <CustomerForm id={id} />;
}
