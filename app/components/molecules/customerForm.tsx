"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Barcode from "react-barcode";
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
  HiOutlineCreditCard,
  HiXMark,
  HiOutlineWifi,
  HiOutlineDocumentText,
} from "react-icons/hi2";

type CustomerFormProps = {
  id?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
};

const TIER_OPTIONS: {
  level: MemberLevel;
  label: string;
  badgeBg: string;
  borderActive: string;
  cardGradient: string;
  cardText: string;
  benefit: string;
}[] = [
  {
    level: "regular",
    label: "Regular",
    badgeBg: "bg-slate-100",
    borderActive: "border-slate-500 bg-slate-50 text-slate-900",
    cardGradient: "from-slate-700 via-slate-800 to-slate-900",
    cardText: "text-slate-100",
    benefit: "Akumulasi poin standar 1x",
  },
  {
    level: "silver",
    label: "Silver",
    badgeBg: "bg-sky-100",
    borderActive: "border-sky-500 bg-sky-50 text-sky-900",
    cardGradient: "from-sky-700 via-blue-800 to-slate-900",
    cardText: "text-sky-100",
    benefit: "Bonus poin 1.2x & Promo member",
  },
  {
    level: "gold",
    label: "Gold VIP",
    badgeBg: "bg-amber-100",
    borderActive: "border-amber-500 bg-amber-50 text-amber-900",
    cardGradient: "from-amber-600 via-amber-700 to-yellow-800",
    cardText: "text-amber-50",
    benefit: "Bonus poin 1.5x & Diskon ulang tahun",
  },
  {
    level: "platinum",
    label: "Platinum Elite",
    badgeBg: "bg-purple-100",
    borderActive: "border-purple-600 bg-purple-50 text-purple-950",
    cardGradient: "from-purple-900 via-indigo-950 to-slate-950",
    cardText: "text-purple-100",
    benefit: "Bonus poin 2x, Diskon VIP & Prioritas",
  },
];

export function CustomerForm({ id, onSuccess, onClose, isModal = true }: CustomerFormProps) {
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

  const selectedTier =
    TIER_OPTIONS.find((t) => t.level === form.member_level) || TIER_OPTIONS[0];

  // The inner content of the form
  const formContent = (
    <div className="space-y-6">
      {/* ── TOP SECTION: LIVE VIRTUAL MEMBER CARD PREVIEW ── */}
      <div className="relative rounded-2xl overflow-hidden p-6 shadow-lg border border-white/20 bg-gradient-to-br transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedTier.cardGradient} -z-10`} />
        
        {/* Background Decorative Circles */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/20 rounded-full blur-xl pointer-events-none -z-10" />

        <div className="flex flex-col justify-between min-h-[190px] text-white">
          {/* Card Top Row: Brand & Wireless chip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-black text-xs">
                EC
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-white/90">
                ELDIR CASHIER • VIP MEMBER
              </span>
            </div>

            <div className="flex items-center gap-2">
              <HiOutlineWifi size={20} className="rotate-90 text-white/80" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 backdrop-blur-md">
                {selectedTier.label}
              </span>
            </div>
          </div>

          {/* Card Middle: Metallic Smart Chip */}
          <div className="my-2 flex items-center gap-3">
            <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 border border-amber-500/50 shadow-inner flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-[1px] bg-amber-700/30 absolute" />
              <div className="h-full w-[1px] bg-amber-700/30 absolute" />
              <div className="w-4 h-4 rounded-full border border-amber-700/30" />
            </div>
            <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
              SMART LOYALTY CARD
            </span>
          </div>

          {/* Card Bottom Row: Customer Name, Code & Live Barcode */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">
                Nama Pelanggan
              </p>
              <h4 className="text-base font-black tracking-tight text-white line-clamp-1">
                {form.name?.trim() || "NAMA CUSTOMER"}
              </h4>
              <p className="text-xs font-mono font-bold text-white/80 tracking-widest mt-0.5">
                {form.member_code || "MBR-XXXX-000"}
              </p>
            </div>

            {/* Live Rendered Barcode */}
            <div className="bg-white px-2 py-1 rounded-lg shrink-0 shadow-sm flex items-center justify-center">
              {form.member_code ? (
                <Barcode
                  value={form.member_code}
                  width={1.2}
                  height={26}
                  fontSize={9}
                  margin={0}
                  displayValue={false}
                />
              ) : (
                <span className="text-[10px] text-gray-400 font-mono">NO BARCODE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: PROFIL & IDENTITAS MEMBER ── */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
          <HiOutlineUser className="text-blue-600" size={18} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Profil & Identitas Pelanggan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
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
              } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-medium text-gray-800 transition-all shadow-2xs`}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* Kode Member */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kode Member
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
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
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-semibold text-gray-700 tracking-wider shadow-2xs"
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
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    form.gender === g.val
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <HiOutlineCalendar size={14} className="text-gray-400" />
              Tanggal Lahir (Promo Ultah)
            </label>
            <input
              type="date"
              value={form.birth_date || ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 shadow-2xs cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TIER MEMBERSHIP & POIN LOYALITAS ── */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
          <HiOutlineSparkles className="text-amber-500" size={18} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tier Membership & Poin Loyalitas
          </h3>
        </div>

        {/* Visual Tier Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIER_OPTIONS.map((tier) => {
            const isSelected = form.member_level === tier.level;
            return (
              <div
                key={tier.level}
                onClick={() => setForm({ ...form, member_level: tier.level })}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${tier.borderActive} ring-2 ring-blue-500/20 shadow-sm scale-[1.02]`
                    : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black tracking-tight">{tier.label}</span>
                  {isSelected && <HiOutlineCheckCircle className="text-blue-600" size={16} />}
                </div>
                <p className="text-[11px] leading-tight text-gray-500">{tier.benefit}</p>
              </div>
            );
          })}
        </div>

        {/* Poin & Belanja */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <HiOutlineSparkles className="text-purple-600" size={14} />
              Saldo Poin Pelanggan
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.points !== undefined ? form.points : ""}
              onChange={(e) => setForm({ ...form, points: Number(e.target.value) || 0 })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-800 shadow-2xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <HiOutlineCurrencyDollar className="text-emerald-600" size={14} />
              Total Akumulasi Belanja (IDR)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={form.total_spending !== undefined ? form.total_spending : ""}
              onChange={(e) => setForm({ ...form, total_spending: Number(e.target.value) || 0 })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700 shadow-2xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 3: KONTAK & KOMUNIKASI ── */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
          <HiOutlinePhone className="text-emerald-600" size={18} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Informasi Kontak & Domisili
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
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
                  errors.phone ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-emerald-500"
                } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-mono text-gray-800 shadow-2xs`}
              />
              <HiOutlinePhone
                size={16}
                className="absolute right-3.5 top-3 text-gray-400 pointer-events-none"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Alamat Email
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
                } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none text-gray-800 shadow-2xs`}
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
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
            <HiOutlineMapPin size={14} className="text-gray-400" />
            Alamat Lengkap
          </label>
          <textarea
            rows={2}
            placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kota/Kabupaten"
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 resize-none shadow-2xs"
          />
        </div>
      </div>

      {/* ── SECTION 4: STATUS KEAKTIFAN ── */}
      <div className="flex items-center justify-between p-4.5 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
        <div>
          <p className="text-sm font-bold text-gray-800">Status Keanggotaan Member</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Customer aktif dapat mengumpulkan poin, menukarkan diskon, dan dicari pada transaksi kasir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
            form.is_active ? "bg-emerald-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              form.is_active ? "translate-x-6.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleClose}
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold transition-all cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              <HiOutlineCheckCircle size={17} />
              <span>{isEdit ? "Simpan Perubahan" : "Daftarkan Pelanggan"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // If used inside a Modal dialog (e.g. from Intercepting route or inline popup)
  if (isModal) {
    return (
      <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <HiOutlineCreditCard size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  {isEdit ? "Edit Data Pelanggan / Member" : "Registrasi Member Pelanggan Baru"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEdit
                    ? "Perbarui profil, kontak, tier loyalitas atau saldo poin customer."
                    : "Tambahkan member baru untuk menikmati poin loyalitas & promo kasir."}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <HiXMark size={22} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500">Memuat data pelanggan...</p>
              </div>
            ) : (
              formContent
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standalone Page Mode
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-xs max-w-3xl mx-auto">
      <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <HiOutlineCreditCard size={22} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              {isEdit ? "Edit Data Pelanggan / Member" : "Registrasi Member Pelanggan Baru"}
            </h1>
            <p className="text-xs text-gray-500">
              Lengkapi informasi member, kontak, tier loyalitas dan status pelanggan.
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200"
        >
          Kembali
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Memuat data pelanggan...</p>
        </div>
      ) : (
        formContent
      )}
    </div>
  );
}
