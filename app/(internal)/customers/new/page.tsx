"use client";

import { Headers } from "@/app/components/atoms";
import { CustomerForm } from "@/app/components/molecules";

export default function NewCustomer() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <CustomerForm isModal={false} />
      </main>
    </div>
  );
}
