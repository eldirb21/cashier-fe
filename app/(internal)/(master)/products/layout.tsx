import React from "react";

export default function ProductLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <section>
      {/* Menampilkan isi dari page.tsx (Tabel Produk) */}
      {children}
      
      {/* Slot untuk menampilkan isi dari folder @modal */}
      {modal}
    </section>
  );
}