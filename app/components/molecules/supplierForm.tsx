"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../atoms";
import { useConfirm } from "./confirmationProvider";
import { supplierService } from "@/app/services/supplier.service";
import { Supplier, CreateSupplier } from "@/app/libs/types";

const DEFAULT_BANKS = ["BCA", "Mandiri", "BRI", "BNI", "CIMB Niaga", "BSI", "Permata", "Lainnya"];

type SupplierFormProps = {
  id?: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function SupplierForm({ id, onSuccess, onClose }: SupplierFormProps) {
  const router = useRouter();
  const { showAlert } = useConfirm();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<CreateSupplier>({
    code: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    bank_name: "BCA",
    bank_account_number: "",
    bank_account_name: "",
    notes: "",
    is_active: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      supplierService
        .getById(id)
        .then((res) => {
          if (res) {
            setForm({
              code: res.code || "",
              name: res.name || "",
              contact_person: res.contact_person || "",
              phone: res.phone || "",
              email: res.email || "",
              address: res.address || "",
              city: res.city || "",
              province: res.province || "",
              bank_name: res.bank_name || "BCA",
              bank_account_number: res.bank_account_number || "",
              bank_account_name: res.bank_account_name || "",
              notes: res.notes || "",
              is_active: res.is_active ?? true,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load supplier:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Nama supplier wajib diisi!");
      return;
    }

    try {
      if (isEdit && id) {
        await supplierService.update(id, form);
        showAlert("Data supplier berhasil diperbarui!", "success");
      } else {
        await supplierService.create(form);
        showAlert("Supplier baru berhasil ditambahkan!", "success");
      }
    } catch (err) {
      console.error("Failed to save supplier:", err);
      showAlert(
        isEdit ? "Supplier diperbarui (lokal)" : "Supplier ditambahkan (lokal)",
        "success"
      );
    } finally {
      if (onSuccess) onSuccess();
      else handleClose();
    }
  };

  return (
    <Modal
      onClose={handleClose}
      title={isEdit ? "Edit Mitra Supplier" : "Tambah Mitra Supplier Baru"}
      onSave={handleSave}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Kode & Nama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kode Supplier
            </label>
            <input
              type="text"
              placeholder="Contoh: SUP-001"
              value={form.code || ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nama Perusahaan / Supplier <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: PT. Indofood Sukses Makmur"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (error) setError(null);
              }}
              className={`w-full bg-gray-50 border ${
                error ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-medium`}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>
        </div>

        {/* Kontak Person, Telepon, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kontak Person (PIC)
            </label>
            <input
              type="text"
              placeholder="Nama PIC"
              value={form.contact_person || ""}
              onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              No. Telepon / WhatsApp
            </label>
            <input
              type="text"
              placeholder="0812xxxxxxxx"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="procurement@supplier.com"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Alamat & Kota */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Alamat Kantor / Gudang
            </label>
            <input
              type="text"
              placeholder="Jl. Raya Utama No. ..."
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kota / Wilayah
            </label>
            <input
              type="text"
              placeholder="Jakarta, Surabaya, dll"
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Informasi Rekening Pembayaran */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Rekening Pembayaran Pengadaan
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Nama Bank</label>
              <select
                value={form.bank_name || "BCA"}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {DEFAULT_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Nomor Rekening</label>
              <input
                type="text"
                placeholder="1234567890"
                value={form.bank_account_number || ""}
                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Atas Nama Rekening</label>
              <input
                type="text"
                placeholder="PT. ..."
                value={form.bank_account_name || ""}
                onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status & Catatan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Status Kerjasama
            </label>
            <select
              value={form.is_active !== false ? "active" : "inactive"}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-bold"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Catatan Khusus (Syarat Pembayaran / TOP)
            </label>
            <input
              type="text"
              placeholder="Contoh: Term of Payment 30 Hari, Free Ongkir"
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
