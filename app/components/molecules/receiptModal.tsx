"use client";

import React, { useRef } from "react";
import {
  Printer,
  Text,
  Line,
  Row,
  render,
  Cut,
  Br,
} from "react-thermal-printer";

// ── types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  qty: number;
  price_item: number;
  discount_pct: number;
  price_total: number;
}

interface ReceiptData {
  store_name: string;
  store_address: string;
  store_phone: string;
  cashier_name: string;
  shift: string;
  transaction_id: string;
  ordered_at: Date;
  items: OrderItem[];
  subtotal: number;
  discount_item: number;
  discount_extra: number;
  grand_total: number;
  payment_method: "cash" | "transfer" | "member";
  cash_given?: number;
  change?: number;
  member_name?: string;
  points_used?: number;
  transfer_ref?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) +
  " " +
  d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const pad = (str: string, len: number, right = false): string => {
  const s = String(str);
  if (s.length >= len) return s.substring(0, len);
  const spaces = " ".repeat(len - s.length);
  return right ? spaces + s : s + spaces;
};

// ── Receipt JSX (shared between preview + thermal render) ─────────────────────

function ReceiptContent({ data }: { data: ReceiptData }) {
  const LINE = "--------------------------------";
  const methodLabel =
    data.payment_method === "cash"
      ? "Tunai"
      : data.payment_method === "transfer"
      ? "Transfer Bank"
      : "Member";

  return (
    <Printer type="epson" width={32} characterSet="pc437_usa">
      {/* store header */}
      <Text align="center" bold size={{ width: 2, height: 2 }}>
        {data.store_name}
      </Text>
      <Br />
      <Text align="center">{data.store_address}</Text>
      <Text align="center">Telp: {data.store_phone}</Text>
      <Line />

      {/* transaction info */}
      <Row left="No. Transaksi" right={data.transaction_id} />
      <Row left="Tanggal" right={fmtDate(data.ordered_at)} />
      <Row left="Kasir" right={data.cashier_name} />
      <Row left="Shift" right={data.shift} />
      {data.member_name && <Row left="Member" right={data.member_name} />}
      <Line />

      {/* items */}
      <Text bold>ITEM PESANAN</Text>
      <Line character="-" />
      {data.items.map((item, i) => (
        <React.Fragment key={i}>
          <Text>{item.name}</Text>
          <Row
            left={`  ${item.qty} x ${fmt(item.price_item)}`}
            right={fmt(item.price_total)}
          />
          {item.discount_pct > 0 && (
            <Text size={{ width: 1, height: 1 }}>
              {"  "}Diskon {item.discount_pct}%: -{fmt((item.price_item * item.qty * item.discount_pct) / 100)}
            </Text>
          )}
        </React.Fragment>
      ))}
      <Line character="-" />

      {/* totals */}
      <Row left="Subtotal" right={fmt(data.subtotal)} />
      {data.discount_item > 0 && (
        <Row left="Diskon item" right={`-${fmt(data.discount_item)}`} />
      )}
      {data.discount_extra > 0 && (
        <Row left="Diskon tambahan" right={`-${fmt(data.discount_extra)}`} />
      )}
      {data.points_used && data.points_used > 0 && (
        <Row left="Poin member" right={`-${fmt(data.points_used)}`} />
      )}
      <Line />

      <Row
        left={<Text bold size={{ width: 1, height: 2 }}>TOTAL</Text>}
        right={<Text bold size={{ width: 1, height: 2 }}>{fmt(data.grand_total)}</Text>}
      />
      <Br />

      {/* payment details */}
      <Row left={`Bayar (${methodLabel})`} right={data.cash_given ? fmt(data.cash_given) : fmt(data.grand_total)} />
      {data.payment_method === "cash" && data.change !== undefined && (
        <Row left="Kembalian" right={fmt(data.change)} />
      )}
      {data.payment_method === "transfer" && data.transfer_ref && (
        <Row left="Ref. Transfer" right={data.transfer_ref} />
      )}
      <Line />

      {/* footer */}
      <Br />
      <Text align="center">Terima kasih telah berbelanja!</Text>
      <Text align="center">Barang yang sudah dibeli</Text>
      <Text align="center">tidak dapat dikembalikan.</Text>
      <Br />
      <Text align="center">*** SIMPAN STRUK INI ***</Text>
      <Br />
      <Cut />
    </Printer>
  );
}

// ── CSS Preview ───────────────────────────────────────────────────────────────

function ReceiptPreview({ data }: { data: ReceiptData }) {
  const methodLabel =
    data.payment_method === "cash"
      ? "Tunai"
      : data.payment_method === "transfer"
      ? "Transfer Bank"
      : "Member";

  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 12,
        lineHeight: 1.5,
        background: "#fff",
        color: "#111",
        padding: "20px 16px",
        width: 300,
        margin: "0 auto",
        boxShadow: "0 2px 20px rgba(0,0,0,.12)",
      }}
    >
      {/* header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>
          {data.store_name}
        </p>
        <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{data.store_address}</p>
        <p style={{ fontSize: 11, color: "#555" }}>Telp: {data.store_phone}</p>
      </div>
      <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

      {/* meta */}
      <div style={{ fontSize: 11 }}>
        {[
          ["No. Transaksi", data.transaction_id],
          ["Tanggal", fmtDate(data.ordered_at)],
          ["Kasir", data.cashier_name],
          ["Shift", data.shift],
          ...(data.member_name ? [["Member", data.member_name]] : []),
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#555" }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

      {/* items */}
      <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>ITEM PESANAN</p>
      <div style={{ borderTop: "1px dashed #aaa", marginBottom: 6 }} />
      {data.items.map((item, i) => {
        const itemSub = item.price_item * item.qty;
        const discAmt = (itemSub * item.discount_pct) / 100;
        return (
          <div key={i} style={{ marginBottom: 6 }}>
            <p style={{ fontWeight: 600, fontSize: 12 }}>{item.name}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "#555" }}>
                {item.qty} x {fmt(item.price_item)}
              </span>
              <span style={{ fontWeight: 700 }}>{fmt(item.price_total)}</span>
            </div>
            {item.discount_pct > 0 && (
              <p style={{ fontSize: 10, color: "#16a34a", marginLeft: 8 }}>
                Diskon {item.discount_pct}%: -{fmt(discAmt)}
              </p>
            )}
          </div>
        );
      })}
      <div style={{ borderTop: "1px dashed #aaa", marginBottom: 6 }} />

      {/* subtotals */}
      <div style={{ fontSize: 11 }}>
        {[
          ["Subtotal", fmt(data.subtotal), false],
          ...(data.discount_item > 0 ? [["Diskon item", `-${fmt(data.discount_item)}`, false]] : []),
          ...(data.discount_extra > 0 ? [["Diskon tambahan", `-${fmt(data.discount_extra)}`, false]] : []),
          ...(data.points_used && data.points_used > 0
            ? [["Poin member", `-${fmt(data.points_used)}`, false]]
            : []),
        ].map(([k, v]) => (
          <div key={k as string} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#555" }}>{k as string}</span>
            <span style={{ color: String(v).startsWith("-") ? "#16a34a" : "#111" }}>{v as string}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #999", margin: "8px 0" }} />

      {/* grand total */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 900 }}>TOTAL</span>
        <span style={{ fontSize: 14, fontWeight: 900 }}>{fmt(data.grand_total)}</span>
      </div>

      {/* payment */}
      <div style={{ fontSize: 11 }}>
        {[
          [`Bayar (${methodLabel})`, data.cash_given ? fmt(data.cash_given) : fmt(data.grand_total)],
          ...(data.payment_method === "cash" && data.change !== undefined
            ? [["Kembalian", fmt(data.change)]]
            : []),
          ...(data.payment_method === "transfer" && data.transfer_ref
            ? [["Ref. Transfer", data.transfer_ref]]
            : []),
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#555" }}>{k}</span>
            <span style={{ fontWeight: 700, color: k === "Kembalian" ? "#16a34a" : "#111" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

      {/* footer */}
      <div style={{ textAlign: "center", fontSize: 10, color: "#777", lineHeight: 1.6 }}>
        <p>Terima kasih telah berbelanja!</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
        <p style={{ marginTop: 4, fontWeight: 700, color: "#333" }}>*** SIMPAN STRUK INI ***</p>
      </div>

      {/* cut line */}
      <div
        style={{
          marginTop: 12,
          borderTop: "2px dashed #ddd",
          textAlign: "center",
          paddingTop: 4,
          fontSize: 10,
          color: "#ccc",
          letterSpacing: 2,
        }}
      >
        ✂ - - - - - - - - - - - - - -
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const handlePrint = async () => {
    try {
      // render to Uint8Array ESC/POS bytes
      const receiptData = await render(<ReceiptContent data={data} />);

      // request USB thermal printer
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ classCode: 0x07 }], // printer class
      });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      const endpointNumber = device.configuration.interfaces[0].alternate
        .endpoints.find((e: any) => e.direction === "out")?.endpointNumber;

      await device.transferOut(endpointNumber, receiptData);
      await device.close();
    } catch (err) {
      console.error("Print error:", err);
      alert("Gagal terhubung ke printer. Pastikan printer USB thermal terhubung.");
    }
  };

  const handlePrintBrowser = () => {
    const printWin = window.open("", "_blank", "width=400,height=700");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Struk - ${data.transaction_id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; }
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body id="root"></body>
      </html>
    `);
    printWin.document.close();
    // brief delay to ensure window is ready
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>Preview Struk</p>
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{data.transaction_id}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#f5f5f5",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#888",
            }}
          >
            ✕
          </button>
        </div>

        {/* preview */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
            background: "#f8f8f8",
          }}
        >
          <ReceiptPreview data={data} />
        </div>

        {/* footer buttons */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px",
              borderRadius: 14,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#888",
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
          <button
            onClick={handlePrintBrowser}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 14,
              border: "1.5px solid #dbeafe",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🖨 Print (Browser)
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 14,
              border: "none",
              background: "#ff9a72",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,138,89,.3)",
            }}
          >
            🖨 USB Printer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Usage example ─────────────────────────────────────────────────────────────

export function useReceipt() {
  const buildReceiptData = (
    orderItems: any[],
    orderSummary: any,
    paymentInfo: any,
    cashierInfo: any
  ): ReceiptData => ({
    store_name: "TOKO MAKMUR JAYA",
    store_address: "Jl. Sudirman No. 10, Jakarta",
    store_phone: "021-12345678",
    cashier_name: cashierInfo.name,
    shift: cashierInfo.shift,
    transaction_id: `TRX-${Date.now()}`,
    ordered_at: new Date(),
    items: orderItems.map((i) => ({
      name: i.name,
      qty: i.qty,
      price_item: i.price_item,
      discount_pct: i.discount_pct,
      price_total: i.price_total,
    })),
    subtotal: orderSummary.subtotal,
    discount_item: orderSummary.discount_amount,
    discount_extra: paymentInfo.extra_discount ?? 0,
    grand_total: orderSummary.grand_total,
    payment_method: paymentInfo.method,
    cash_given: paymentInfo.cash_given,
    change: paymentInfo.change,
    member_name: paymentInfo.member_name,
    points_used: paymentInfo.points_used,
    transfer_ref: paymentInfo.transfer_ref,
  });

  return { buildReceiptData };
}

// ── Demo ──────────────────────────────────────────────────────────────────────

const DEMO_DATA: ReceiptData = {
  store_name: "TOKO MAKMUR JAYA",
  store_address: "Jl. Sudirman No. 10, Jakarta",
  store_phone: "021-12345678",
  cashier_name: "Andi",
  shift: "Pagi (08.00–16.00)",
  transaction_id: "TRX-20260324-001",
  ordered_at: new Date(),
  items: [
    { name: "Galon Le Minerale 5 L", qty: 2, price_item: 15000, discount_pct: 5, price_total: 28500 },
    { name: "Aqua 600 ML", qty: 3, price_item: 3000, discount_pct: 0, price_total: 9000 },
  ],
  subtotal: 39000,
  discount_item: 1500,
  discount_extra: 0,
  grand_total: 37500,
  payment_method: "cash",
  cash_given: 50000,
  change: 12500,
};

export default function ReceiptDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "12px 24px",
          borderRadius: 14,
          border: "none",
          background: "#ff9a72",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        🖨 Preview & Print Struk
      </button>
      <ReceiptModal isOpen={open} onClose={() => setOpen(false)} data={DEMO_DATA} />
    </div>
  );
}