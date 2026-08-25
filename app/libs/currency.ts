export const formatRupiah = (amount: number): string =>
  `Rp ${Number(amount).toLocaleString("id-ID")}`;

export const parseRupiah = (value: string): number =>
  Number(value.replace(/[^0-9]/g, ""));

export const formatDiscount = (pct: number): string =>
  pct > 0 ? `-${pct}%` : "-";
