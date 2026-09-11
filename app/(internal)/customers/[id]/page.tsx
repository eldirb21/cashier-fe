"use client";

import { Headers } from "@/app/components/atoms";
import { CustomerForm } from "@/app/components/molecules";
import { useParams } from "next/navigation";

export default function EditCustomer() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <CustomerForm id={id} isModal={false} />
      </main>
    </div>
  );
}
