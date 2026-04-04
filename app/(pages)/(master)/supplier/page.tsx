"use client";

import { Headers } from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { toSlug } from "@/app/libs";
import Link from "next/link";
import { useState } from "react";
import { HiPlus, HiOutlineSearch } from "react-icons/hi";

const initialSuppliers = [
  {
    id: 1,
    code: "SUP-001",
    name: "PT. Indofood Sukses Makmur",
    contact: "Budi Santoso",
    phone: "021-5795-8300",
    email: "procurement@indofood.com",
    address: "Jl. Jend. Sudirman Kav. 76-78, Jakarta",
    category: "Makanan & Minuman",
    status: "Aktif",
  },
  {
    id: 2,
    code: "SUP-002",
    name: "CV. Sumber Berkah Jaya",
    contact: "Dewi Rahayu",
    phone: "031-888-1234",
    email: "dewi@sumberberkah.co.id",
    address: "Jl. Raya Darmo No. 54, Surabaya",
    category: "Sembako",
    status: "Aktif",
  },
  {
    id: 3,
    code: "SUP-003",
    name: "UD. Maju Bersama",
    contact: "Andi Wijaya",
    phone: "024-760-4455",
    email: "andi.maju@gmail.com",
    address: "Jl. Pemuda No. 12, Semarang",
    category: "Minuman",
    status: "Nonaktif",
  },
  {
    id: 4,
    code: "SUP-004",
    name: "PT. Tirta Investama",
    contact: "Sari Wulandari",
    phone: "021-571-8181",
    email: "sari@aqua.co.id",
    address: "Jl. Boulevard Artha Gading No. 1, Jakarta",
    category: "Air Mineral",
    status: "Aktif",
  },
  {
    id: 5,
    code: "SUP-005",
    name: "CV. Harapan Mandiri",
    contact: "Rizky Pratama",
    phone: "0274-555-678",
    email: "rizky.harapan@yahoo.com",
    address: "Jl. Malioboro No. 88, Yogyakarta",
    category: "Snack & Camilan",
    status: "Aktif",
  },
  {
    id: 6,
    code: "SUP-006",
    name: "PT. Wings Surya",
    contact: "Maya Lestari",
    phone: "031-843-7000",
    email: "maya@wingscorp.com",
    address: "Jl. Greges Barat No. 2, Surabaya",
    category: "Produk Rumah Tangga",
    status: "Nonaktif",
  },
];

const Supplier = () => {
  const { confirm, showAlert } = useConfirm();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    code: "", name: "", contact: "", phone: "",
    email: "", address: "", category: "Sembako", status: "Aktif",
  });

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.contact.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      code: `SUP-00${suppliers.length + 1}`,
      name: "", contact: "", phone: "",
      email: "", address: "", category: "Sembako", status: "Aktif",
    });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditTarget(s.id);
    setForm({ ...s });
    setShowModal(true);
  };

  const saveForm = () => {
    if (!form.name.trim()) return;
    if (editTarget) {
      setSuppliers(suppliers.map((s) => (s.id === editTarget ? { ...s, ...form } : s)));
      showAlert("Supplier berhasil diupdate!", "success");
    } else {
      setSuppliers([...suppliers, { ...form, id: Date.now() }]);
      showAlert("Supplier berhasil ditambahkan!", "success");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    confirm({
      type: "danger",
      title: "Hapus Supplier?",
      message: "Data supplier ini akan hilang secara permanen.",
      onSave: () => {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        showAlert("Supplier berhasil dihapus!", "success");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8">

        {/* Action Bar: Add & Search */}
        <div className="flex flex-col md:flex-row shadow-sm rounded-xl overflow-hidden border border-gray-200 mb-8">
          <button
            onClick={openAdd}
            className="bg-[#1e5bb8] flex items-center gap-1 text-white px-6 py-3 font-bold text-sm"
          >
            <HiPlus size={20} />
            ADD NEW
          </button>

          <div className="flex flex-1 bg-white">
            <div className="flex items-center px-4 text-gray-300">
              <HiOutlineSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="search by supplier name or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-4 text-sm border-none focus:ring-0 placeholder:text-gray-300 text-gray-600"
            />
            <button className="bg-[#1e5bb8] hover:bg-blue-700 text-white px-8 py-4 text-sm font-bold transition-all uppercase">
              Search
            </button>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Nama Supplier
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kontak Person
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-300 font-semibold">
                      Tidak ada supplier yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">

                      {/* Kode */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-[#1e5bb8] font-mono">
                          {s.code}
                        </span>
                      </td>

                      {/* Nama Supplier */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-700">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>
                      </td>

                      {/* Kontak Person */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-gray-700">{s.contact}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{s.phone}</p>
                      </td>

                      {/* Kategori */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1e5bb8] text-[11px] font-bold">
                          {s.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {s.status === "Aktif" ? (
                          <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[11px] font-bold">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="px-4 py-2 bg-[#cc4b4b] hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-5 border-t border-gray-50 flex justify-between items-center bg-white">
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <span className="text-2xl">‹</span>
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e5bb8] text-white text-xs font-bold shadow-md">
                1
              </button>
            </div>
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <span className="text-2xl">›</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── Modal Form ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="bg-[#1e5bb8] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white font-bold text-base">
                {editTarget ? "Edit Supplier" : "Tambah Supplier Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Kode Supplier
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SUP-001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nama Perusahaan / Supplier *
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="PT. Contoh Jaya"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Kontak Person
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="Nama PIC"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  No. Telepon
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="021-xxxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@supplier.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Makanan & Minuman</option>
                  <option>Sembako</option>
                  <option>Minuman</option>
                  <option>Air Mineral</option>
                  <option>Snack & Camilan</option>
                  <option>Produk Rumah Tangga</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Alamat
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Jl. ..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveForm}
                className="px-5 py-2.5 bg-[#1e5bb8] hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md"
              >
                {editTarget ? "Simpan Perubahan" : "Tambah Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplier;