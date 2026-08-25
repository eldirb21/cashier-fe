import React from "react";

export default function CategoriesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <section>
      {/* Menampilkan isi dari page.tsx (Tabel Kategori) */}
      {children}

      {/* Slot untuk modal intersep (new / edit kategori) */}
      {modal}
    </section>
  );
}