"use client";

import { CustomerForm } from "@/app/components/molecules";
import { useParams } from "next/navigation";

export default function EditCustomerModal() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  return <CustomerForm id={id} isModal={true} />;
}
