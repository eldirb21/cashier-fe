export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export const parseRupiah = (value: string): number =>
  Number(value.replace(/[^0-9]/g, ""));

export const formatDiscount = (pct: number): string =>
  pct > 0 ? `-${pct}%` : "-";