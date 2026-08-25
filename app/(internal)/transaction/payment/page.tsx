"use client";

import React, { useState, useEffect } from "react";
import { HiXMark, HiCheckCircle, HiPrinter } from "react-icons/hi2";
import {
  HiBanknotes,
  HiCreditCard,
  HiUserCircle,
  HiReceiptPercent,
  HiArrowPath,
} from "react-icons/hi2";

// ── helpers ───────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const parseNumber = (value: string): number =>
  Number(value.replace(/[^0-9]/g, "")) || 0;

// ── types ─────────────────────────────────────────────────────────────────────

type PaymentMethod = "cash" | "transfer" | "member";

interface OrderSummary {
  subtotal: number;
  discount_amount: number;
  grand_total: number;
  total_items: number;
}

interface Member {
  id: string;
  name: string;
  points: number;
  phone: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderSummary;
  onPay: (result: PaymentResult) => void;
  onPrint: () => void;
}

interface PaymentResult {
  method: PaymentMethod;
  cash_given?: number;
  change?: number;
  extra_discount?: number;
  member_id?: string;
  points_used?: number;
  grand_total: number;
}

// ── mock members ──────────────────────────────────────────────────────────────

const members: Member[] = [
  { id: "m1", name: "Budi Santoso", points: 1200, phone: "08123456789" },
  { id: "m2", name: "Siti Rahayu", points: 500, phone: "08987654321" },
  { id: "m3", name: "Ahmad Fauzi", points: 3000, phone: "08234567890" },
];

// ── quick cash buttons ────────────────────────────────────────────────────────

const QUICK_CASH = [10000, 20000, 50000, 100000];

// ── component ─────────────────────────────────────────────────────────────────

function PaymentModal({
  isOpen,
  onClose,
  order,
  onPay,
  onPrint
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [extraDiscount, setExtraDiscount] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [transferRef, setTransferRef] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // derived
  const extraDiscAmt = parseNumber(extraDiscount);
  const pointsDisc =
    usePoints && selectedMember
      ? Math.min(selectedMember.points, order.grand_total)
      : 0;
  const finalTotal = Math.max(0, order.grand_total - extraDiscAmt - pointsDisc);

  const cashGiven = parseNumber(cashInput);
  const change = cashGiven - finalTotal;
  const isChangePositive = change >= 0;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch),
  );

  const canPay =
    method === "cash"
      ? cashGiven >= finalTotal
      : method === "transfer"
        ? transferRef.trim().length > 0
        : selectedMember !== null;

  const handlePay = () => {
    if (!canPay) return;
    setIsPaid(true);
  };

  const handleReset = () => {
    setCashInput("");
    setExtraDiscount("");
    setSelectedMember(null);
    setMemberSearch("");
    setUsePoints(false);
    setTransferRef("");
    setIsPaid(false);
    setMethod("cash");
  };

  useEffect(() => {
    if (!isOpen) handleReset();
  }, [isOpen]);

  if (!isOpen) return null;

  // ── success screen ──────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <HiCheckCircle size={36} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">
              Pembayaran Berhasil
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Transaksi telah dicatat
            </p>
          </div>

          <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Metode</span>
              <span className="font-semibold text-gray-700 capitalize">
                {method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total dibayar</span>
              <span className="font-bold text-gray-900">
                {formatRupiah(finalTotal)}
              </span>
            </div>
            {method === "cash" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uang diterima</span>
                  <span className="font-semibold text-gray-700">
                    {formatRupiah(cashGiven)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-400">Kembalian</span>
                  <span className="font-extrabold text-emerald-500">
                    {formatRupiah(change)}
                  </span>
                </div>
              </>
            )}
            {selectedMember && (
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-400">Member</span>
                <span className="font-semibold text-blue-500">
                  {selectedMember.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
            <button onClick={onPrint} className="flex-1 py-3 rounded-2xl bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
              <HiPrinter size={16} />
              Print Struk
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── main modal ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Pembayaran
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.total_items} item
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <HiXMark size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* order summary card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-2xl font-black mt-1">
                  {formatRupiah(finalTotal)}
                </p>
              </div>
              {(extraDiscAmt > 0 || pointsDisc > 0) && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Sebelum diskon</p>
                  <p className="text-sm text-gray-400 line-through mt-0.5">
                    {formatRupiah(order.grand_total)}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Subtotal</p>
                <p className="font-semibold mt-0.5">
                  {formatRupiah(order.subtotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Diskon item</p>
                <p className="font-semibold mt-0.5 text-emerald-400">
                  −{formatRupiah(order.discount_amount)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Diskon tambahan</p>
                <p className="font-semibold mt-0.5 text-emerald-400">
                  {extraDiscAmt + pointsDisc > 0
                    ? `−${formatRupiah(extraDiscAmt + pointsDisc)}`
                    : "−"}
                </p>
              </div>
            </div>
          </div>

          {/* method selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Metode Pembayaran
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "cash", label: "Tunai", icon: HiBanknotes },
                  { id: "transfer", label: "Transfer", icon: HiCreditCard },
                  { id: "member", label: "Member", icon: HiUserCircle },
                ] as {
                  id: PaymentMethod;
                  label: string;
                  icon: React.ElementType;
                }[]
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                    method === id
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* extra discount */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <HiReceiptPercent size={13} className="text-emerald-400" />
              Diskon Tambahan (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={extraDiscount}
              onChange={(e) =>
                setExtraDiscount(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300"
            />
          </div>

          {/* cash section */}
          {method === "cash" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan nominal"
                  value={cashInput}
                  onChange={(e) =>
                    setCashInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300"
                />
              </div>

              {/* quick cash */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_CASH.map((amt) => {
                  const rounded = Math.ceil(finalTotal / amt) * amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => setCashInput(String(rounded))}
                      className="py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                    >
                      {formatRupiah(rounded)}
                    </button>
                  );
                })}
              </div>

              {/* change display */}
              {cashInput && (
                <div
                  className={`rounded-2xl p-4 flex items-center justify-between ${
                    isChangePositive
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${isChangePositive ? "text-emerald-700" : "text-red-500"}`}
                  >
                    {isChangePositive ? "Kembalian" : "Kurang"}
                  </span>
                  <span
                    className={`text-lg font-extrabold ${isChangePositive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {formatRupiah(Math.abs(change))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* transfer section */}
          {method === "transfer" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">
                  Info Rekening
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-500">Bank</span>
                    <span className="font-bold text-blue-800">BCA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-500">No. Rekening</span>
                    <span className="font-bold text-blue-800 tracking-wider">
                      1234 5678 90
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-500">Atas Nama</span>
                    <span className="font-bold text-blue-800">
                      Toko Makmur Jaya
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200 pt-1 mt-1">
                    <span className="text-blue-500">Jumlah</span>
                    <span className="font-extrabold text-blue-900">
                      {formatRupiah(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  No. Referensi / Bukti Transfer
                </label>
                <input
                  type="text"
                  placeholder="Contoh: TRF20260324001"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300"
                />
              </div>
            </div>
          )}

          {/* member section */}
          {method === "member" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Cari Member
                </label>
                <input
                  type="text"
                  placeholder="Nama atau nomor HP"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setSelectedMember(null);
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300"
                />
              </div>

              {memberSearch && !selectedMember && (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                  {filteredMembers.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400 text-center italic">
                      Member tidak ditemukan
                    </p>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m);
                          setMemberSearch(m.name);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {m.name}
                          </p>
                          <p className="text-xs text-gray-400">{m.phone}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                          {m.points.toLocaleString()} pts
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedMember && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-800">
                        {selectedMember.name}
                      </p>
                      <p className="text-xs text-blue-400">
                        {selectedMember.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberSearch("");
                        setUsePoints(false);
                      }}
                    >
                      <HiXMark
                        size={16}
                        className="text-blue-300 hover:text-blue-500"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-blue-100 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-xs text-gray-400">Poin tersedia</p>
                      <p className="text-sm font-extrabold text-amber-500">
                        {selectedMember.points.toLocaleString()} pts
                      </p>
                      {usePoints && (
                        <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                          −{formatRupiah(pointsDisc)} dari poin
                        </p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-gray-500">
                        Pakai poin
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                        />
                        <div
                          className={`w-9 h-5 rounded-full transition-colors ${usePoints ? "bg-blue-500" : "bg-gray-200"}`}
                        />
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${usePoints ? "translate-x-4.5" : "translate-x-0.5"}`}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePay}
            disabled={!canPay}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              canPay
                ? "bg-[#ff9a72] hover:bg-[#ff8559] text-white shadow-sm shadow-orange-200 active:scale-[0.98]"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <HiPrinter size={16} />
            Bayar {formatRupiah(finalTotal)} + Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return null;
}

