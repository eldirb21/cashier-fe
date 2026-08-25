"use client";

import { CategoriesForm } from "@/app/components/molecules";
import { useParams } from "next/navigation";

export default function EditCategoryModal() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  return <CategoriesForm id={id} />;
}
