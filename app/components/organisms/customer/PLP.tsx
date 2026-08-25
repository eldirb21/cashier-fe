"use client";

import React, { useEffect, useState } from "react";
import { Headers } from "@/app/components/atoms";
import { HiOutlineBell } from "react-icons/hi";
import { getProduct, productList } from "@/app/store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getCategoryProduct } from "@/app/store/slices/categorySlice";
import { configList, fetchConfig } from "@/app/store/slices/configSlice";
import { useBarcodeScanner } from "@/app/hooks";
import { Product } from "@/app/libs";
import {
  addCartItem,
  cartList,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/app/store/slices/cartSlice";
import { CCart } from "./ui/CCart";
import { CProductGrid } from "./ui/CProductGrid";
import { CCategoryFilter } from "./ui/CCategoryFilter";
import { Search } from "../../atoms/Search";
import { CHeader } from "../../molecules/customer";

export const CProductList = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(productList);
  const cart = useAppSelector(cartList);
  const { categories: tabCategories } = useAppSelector(configList);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "QRIS">(
    "Cash",
  );
  const [discountAmount, setDiscountAmount] = useState(7000);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useBarcodeScanner({
    isScanning,
    onScanSuccess: (decodedText) => {
      setSearch(decodedText);
      setIsScanning(false);
    },
  });

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  useEffect(() => {
    if (search.length > 0 && search.length < 3) return;
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    dispatch(
      getProduct({
        page,
        size,
        search: debouncedSearch || undefined,
        category_id: categoryId === "all" ? undefined : categoryId,
      }),
    );
  }, [dispatch, page, size, debouncedSearch, categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getCategoryProduct());
      await dispatch(fetchConfig());
    };

    fetchData();
  }, [dispatch]);

  const addToCart = (product: Product) => {
    dispatch(addCartItem({ product_id: product.id, qty: 1 }));
  };

  const fetchSearch = (search: string) => {
    setSearch(search);
    setPage(1);
  };
  const fetchByCategory = (category: string) => {
    setCategoryId(category);
    setPage(1);
  };

  const updateQty = (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(updateCartItem({ id: itemId, qty: newQty }));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const tax = 0;
  const total = Math.max(0, subtotal - discountAmount + tax);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col font-sans">
      <CHeader />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* ── LEFT SIDE: PRODUCTS & FILTERS ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Search Bar */}
          <Search
            search={search}
            onSearch={fetchSearch}
            onClickScan={() => setIsScanning(true)}
            scannVisible
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />

          {/* Category Filter Pills */}
          <CCategoryFilter
            tabCategories={tabCategories}
            fetchByCategory={fetchByCategory}
            categoryId={categoryId}
          />

          <CProductGrid products={products} addToCart={addToCart} />
        </div>

        {/* ── RIGHT SIDE: CURRENT SALE PANEL ── */}
        <CCart
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          tax={tax}
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          updateQty={updateQty}
        />
      </div>
    </div>
  );
};
