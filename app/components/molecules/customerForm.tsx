"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../atoms";
import { useConfirm } from "./confirmationProvider";
import { customerService } from "@/app/services/customer.service";
import { customers as defaultCustomers } from "@/app/libs/data";
import { Customer, MemberLevel } from "@/app/libs/types";
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineArrowPath,
} from "react-icons/hi2";

type CustomerFormProps = {
  id?: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

const TIER_OPTIONS: {
  level: MemberLevel;
  label: string;
  badgeBg: string;
  borderActive: string;
  text: string;
  benefit: string;
}[] = [
  {
    level: "regular",
    label: "Regular",
    badgeBg: "bg-slate-100",
    borderActive: "border-slate-400 bg-slate-50 text-slate-800",
    text: "text-slate-600",
    benefit: "Akumulasi poin standar 1x",
  },
  {
    level: "silver",
    label: "Silver",
    badgeBg: "bg-sky-100",
    borderActive: "border-sky-500 bg-sky-50 text-sky-800",
    text: "text-sky-600",
    benefit: "Bonus poin 1.2x & Promo member",
  },
  {
    level: "gold",
    label: "Gold VIP",
    badgeBg: "bg-amber-100",
    borderActive: "border-amber-500 bg-amber-50 text-amber-800",
    text: "text-amber-700",
    benefit: "Bonus poin 1.5x & Diskon ulang tahun",
  },
  {
    level: "platinum",
    label: "Platinum Elite",
    badgeBg: "bg-purple-100",
    borderActive: "border-purple-600 bg-purple-50 text-purple-900",
    text: "text-purple-700",
    benefit: "Bonus poin 2x, Diskon VIP & Prioritas",
  },
];

export function CustomerForm({ id, onSuccess, onClose }: CustomerFormProps) {
  const router = useRouter();
  const { showAlert } = useConfirm();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Partial<Customer>>({
    name: "",
    member_code: "",
    phone: "",
    email: "",
    address: "",
    gender: "male",
    birth_date: "",
    member_level: "regular",
    points: 0,
    total_spending: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Generate random unique member code
  const handleGenerateCode = () => {
    const prefix = "MBR";
    const namePart = (form.name || "CST")
      .trim()
      .slice(0, 4)
      .toUpperCase()
      .replace(/[^A-Z]/g, "X");
    const numPart = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${namePart || "VIP"}-${numPart}`;
    setForm((prev) => ({ ...prev, member_code: newCode }));
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Try from API first
      customerService
        .getById(id)
        .then((res) => {
          if (res && res.id) {
            setForm({
              name: res.name || "",
              member_code: res.member_code || "",
              phone: res.phone || "",
              email: res.email || "",
              address: res.address || "",
              gender: res.gender || "male",
              birth_date: res.birth_date ? res.birth_date.split("T")[0] : "",
              member_level: res.member_level || "regular",
              points: res.points || 0,
              total_spending: res.total_spending || 0,
              is_active: res.is_active ?? true,
            });
          } else {
            fallbackFromLocal();
          }
        })
        .catch(() => {
          fallbackFromLocal();
        })
        .finally(() => setLoading(false));
    } else {
      // For new customer, auto-generate default member code
      const numPart = Math.floor(100 + Math.random() * 900);
      setForm((prev) => ({
        ...prev,
        member_code: `MBR-NEW-${numPart}`,
      }));
    }

    function fallbackFromLocal() {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("my_cashier_customers_data");
        if (stored) {
          try {
            const list: Customer[] = JSON.parse(stored);
            const found = list.find((c) => c.id === id || c.member_code === id);
            if (found) {
              setForm({
                name: found.name || "",
                member_code: found.member_code || "",
                phone: found.phone || "",
                email: found.email || "",
                address: found.address || "",
                gender: found.gender || "male",
                birth_date: found.birth_date ? found.birth_date.split("T")[0] : "",
                member_level: found.member_level || "regular",
                points: found.points || 0,
                total_spending: found.total_spending || 0,
                is_active: found.is_active ?? true,
              });
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      // Check default fallback list
      const defaultFound = defaultCustomers.find(
        (c) => c.id === id || c.member_code === id
      );
      if (defaultFound) {
        setForm({
          name: defaultFound.name || "",
          member_code: defaultFound.member_code || "",
          phone: defaultFound.phone || "",
          email: defaultFound.email || "",
          address: defaultFound.address || "",
          gender: defaultFound.gender || "male",
          birth_date: defaultFound.birth_date ? defaultFound.birth_date.split("T")[0] : "",
          member_level: defaultFound.member_level || "regular",
          points: defaultFound.points || 0,
          total_spending: defaultFound.total_spending || 0,
          is_active: defaultFound.is_active ?? true,
        });
      }
    }
  }, [id]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/customers");
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || !form.name.trim()) {
      errs.name = "Nama lengkap customer wajib diisi!";
    }
    if (!form.phone || !form.phone.trim()) {
      errs.phone = "Nomor telepon / WhatsApp wajib diisi!";
    } else if (form.phone.trim().length < 8) {
      errs.phone = "Nomor telepon minimal 8 digit!";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Format email tidak valid!";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload: Partial<Customer> = {
      ...form,
      name: form.name?.trim(),
      phone: form.phone?.trim(),
      email: form.email?.trim() || undefined,
      address: form.address?.trim() || undefined,
      member_code: form.member_code?.trim() || `MBR-${Date.now()}`,
      points: Number(form.points) || 0,
      total_spending: Number(form.total_spending) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit && id) {
        await customerService.update(id, payload);
        showAlert("Data pelanggan berhasil diperbarui!", "success");
      } else {
        payload.joined_at = new Date().toISOString();
        payload.created_at = new Date().toISOString();
        await customerService.create(payload);
        showAlert("Pelanggan baru berhasil ditambahkan!", "success");
      }
    } catch (err) {
      console.warn("Backend customer API unavailable, saved locally:", err);
      showAlert(
        isEdit
          ? "Data pelanggan diperbarui (tersimpan lokal)!"
          : "Pelanggan baru berhasil ditambahkan (tersimpan lokal)!",
        "success"
      );
    } finally {
      // Synchronize in localStorage so changes appear instantly in UI
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("my_cashier_customers_data");
          let list: Customer[] = stored ? JSON.parse(stored) : [...defaultCustomers];
          if (isEdit && id) {
            list = list.map((c) =>
              c.id === id || c.member_code === id ? ({ ...c, ...payload, id: c.id } as Customer) : c
            );
          } else {
            const newCust: Customer = {
              ...(payload as Customer),
              id: `CUST-${Date.now()}`,
              is_active: payload.is_active ?? true,
              points: payload.points || 0,
              total_spending: payload.total_spending || 0,
              joined_at: new Date().toISOString(),
            };
            list = [newCust, ...list];
          }
          localStorage.setItem("my_cashier_customers_data", JSON.stringify(list));
        } catch (e) {
          console.error("Local sync error:", e);
        }
      }

      setSaving(false);
      if (onSuccess) onSuccess();
      else handleClose();
    }
  };

  return (
    <Modal
      onClose={handleClose}
      title={isEdit ? "Edit Data Pelanggan / Member" : "Registrasi Member Pelanggan Baru"}
      onSave={handleSave}
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Memuat data pelanggan...</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* SECTION 1: Profil & Identitas Member */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
              <HiOutlineUser className="text-blue-600" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Profil & Identitas Pelanggan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={form.name || ""}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full bg-white border ${
                      errors.name ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"
                    } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-medium text-gray-800 transition-all`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
              </div>

              {/* Kode Member */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Kode Member
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                  >
                    <HiOutlineArrowPath size={12} />
                    Acak Kode
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="MBR-XXXX-001"
                    value={form.member_code || ""}
                    onChange={(e) => setForm({ ...form, member_code: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-semibold text-gray-700 tracking-wider"
                  />
                  <HiOutlineIdentification
                    size={18}
                    className="absolute right-3.5 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Gender & Tanggal Lahir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "male", label: "Laki-laki" },
                    { val: "female", label: "Perempuan" },
                    { val: "other", label: "Lainnya" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g.val as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        form.gender === g.val
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tanggal Lahir (Untuk Promo Ultah)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.birth_date || ""}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Level Member & Loyalitas */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-800">
                <HiOutlineSparkles className="text-amber-500" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tier Membership & Poin Loyalitas
                </h3>
              </div>
            </div>

            {/* Visual Tier Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {TIER_OPTIONS.map((tier) => {
                const isSelected = form.member_level === tier.level;
                return (
                  <div
                    key={tier.level}
                    onClick={() => setForm({ ...form, member_level: tier.level })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${tier.borderActive} ring-2 ring-blue-500/20 shadow-sm scale-[1.02]`
                        : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold">{tier.label}</span>
                      {isSelected && <HiOutlineCheckCircle className="text-blue-600" size={16} />}
                    </div>
                    <p className="text-[11px] leading-tight text-gray-500">{tier.benefit}</p>
                  </div>
                );
              })}
            </div>

            {/* Poin Loyalitas & Akumulasi Belanja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <HiOutlineSparkles className="text-amber-500" size={14} />
                  Poin Member
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.points !== undefined ? form.points : ""}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <HiOutlineCurrencyDollar className="text-emerald-600" size={14} />
                  Total Belanja (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={form.total_spending !== undefined ? form.total_spending : ""}
                  onChange={(e) => setForm({ ...form, total_spending: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Kontak & Komunikasi */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
              <HiOutlinePhone className="text-blue-600" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Informasi Kontak & Komunikasi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={form.phone || ""}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    className={`w-full bg-white border ${
                      errors.phone ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"
                    } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-mono text-gray-800`}
                  />
                  <HiOutlinePhone
                    size={16}
                    className="absolute right-3.5 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Alamat Email (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={form.email || ""}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full bg-white border ${
                      errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"
                    } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none text-gray-800`}
                  />
                  <HiOutlineEnvelope
                    size={16}
                    className="absolute right-3.5 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>
            </div>

            {/* Alamat Domisili */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <HiOutlineMapPin size={14} className="text-gray-400" />
                Alamat Domisili
              </label>
              <textarea
                rows={2}
                placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kota/Kabupaten"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 resize-none"
              />
            </div>
          </div>

          {/* SECTION 4: Status Keaktifan */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-bold text-gray-800">Status Akun Customer</p>
              <p className="text-xs text-gray-500">
                Customer aktif dapat memperoleh poin, menukar reward, dan menerima nota belanja
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                form.is_active ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  form.is_active ? "translate-x-6.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
