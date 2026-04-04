import { useMemo } from "react";

export const useTotalPrice = (products: any[]) => {
  const total = useMemo(() => {
    return products.reduce((acc, item) => {
      const price = item.price_total;
      const discount = item.discount_pct;

      const finalPrice = price - (price * discount) / 100;

      return acc + finalPrice;
    }, 0);
  }, [products]);

  const formatted = useMemo(() => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      
    }).format(total);
  }, [total]);

  return { total, formatted };
};
