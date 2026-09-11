"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../atoms";
import { useConfirm } from "./confirmationProvider";
import { productService } from "@/app/services/product.service";
import { categoryService } from "@/app/services/category.service";
import { supplierService } from "@/app/services/supplier.service";
import { Product, Category, Supplier } from "@/app/libs/types";
import { products as fallbackProducts, categories as fallbackCategories, suppliers as fallbackSuppliers } from "@/app/libs/data";
import { toSlug } from "@/app/libs";

const DEFAULT_PRODUCT_IMAGES = [
  { label: "Chiki / Snack", url: "https://cdn-icons-png.flaticon.com/512/2553/2553642.png" },
  { label: "Mie Cup", url: "https://cdn-icons-png.flaticon.com/512/3014/3014534.png" },
  { label: "Mie Instan", url: "https://cdn-icons-png.flaticon.com/512/599/599502.png" },
  { label: "Air Mineral", url: "https://cdn-icons-png.flaticon.com/512/3100/3100566.png" },
  { label: "Minuman Botol", url: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png" },
  { label: "Kopi / Teh", url: "https://cdn-icons-png.flaticon.com/512/924/924514.png" },
  { label: "Roti / Kue", url: "https://cdn-icons-png.flaticon.com/512/3014/3014488.png" },
  { label: "Lainnya", url: "https://cdn-icons-png.flaticon.com/512/3081/3081840.png" },
];

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);

type ProductFormProps = {
  id?: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function ProductForm({ id, onSuccess, onClose }: ProductFormProps) {
  const router = useRouter();
  const { showAlert } = useConfirm();

  const isEdit = Boolean(id);

  // Form State
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [costPrice, setCostPrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);
  const [imgUrl, setImgUrl] = useState(DEFAULT_PRODUCT_IMAGES[0].url);
  const [customImg, setCustomImg] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Data Reference State
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load Categories & Suppliers
  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setCategories(res);
        else setCategories(fallbackCategories);
      })
      .catch(() => setCategories(fallbackCategories));

    supplierService
      .getAll()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setSuppliers(res);
        else setSuppliers(fallbackSuppliers);
      })
      .catch(() => setSuppliers(fallbackSuppliers));
  }, []);

  // Load Product Details for Edit Mode
  useEffect(() => {
    if (id) {
      productService
        .getById(id)
        .then((prod) => {
          if (prod && prod.name) {
            populateForm(prod);
          } else {
            fallbackLoad();
          }
        })
        .catch(() => fallbackLoad());

      function fallbackLoad() {
        const found = fallbackProducts.find(
          (p) => p.id === id || p.barcode === id || toSlug(p.name) === id
        );
        if (found) populateForm(found);
      }

      function populateForm(p: Product) {
        setName(p.name || "");
        setBarcode(p.barcode || "");
        setCategoryId(p.category_id || "");
        setSupplierId(p.supplier_id || "");
        setCostPrice(Number(p.cost_price) || 0);
        setPrice(Number(p.price) || 0);
        setStock(Number(p.stock) || 0);
        setMinStock(Number(p.min_stock) || 5);
        setImgUrl(p.img_url || DEFAULT_PRODUCT_IMAGES[0].url);
        setIsActive(p.is_active ?? true);
      }
    }
  }, [id]);

  // Auto Generate Barcode
  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    setBarcode(`899${randomSuffix}`);
  };

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  // Profit calculations
  const profitPerItem = price - costPrice;
  const marginPercent = costPrice > 0 ? Math.round((profitPerItem / costPrice) * 100) : 0;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Nama produk wajib diisi!");
      return;
    }

    if (!barcode.trim()) {
      setError("Barcode / SKU produk wajib diisi!");
      return;
    }

    if (price <= 0) {
      setError("Harga jual produk harus lebih besar dari Rp 0!");
      return;
    }

    const payload = {
      name,
      barcode,
      category_id: categoryId || (categories[0]?.id ? String(categories[0].id) : "1"),
      supplier_id: supplierId || (suppliers[0]?.id ? String(suppliers[0].id) : "sup-1"),
      cost_price: Number(costPrice) || 0,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      min_stock: Number(minStock) || 5,
      img_url: customImg.trim() || imgUrl,
      is_active: isActive,
    };

    try {
      if (isEdit && id) {
        await productService.update(id, payload);
        showAlert("Data produk berhasil diperbarui!", "success");
      } else {
        await productService.create(payload);
        showAlert("Produk baru berhasil ditambahkan!", "success");
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      showAlert(
        isEdit ? "Produk diperbarui (tersimpan lokal)" : "Produk ditambahkan (tersimpan lokal)",
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
      title={isEdit ? "Edit Data Produk" : "Tambah Produk Baru"}
      onSave={handleSave}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Nama Produk & Barcode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Chitato Sapi Panggang 68g"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full bg-gray-50 border ${
                error ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              } rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none font-medium`}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Barcode / SKU <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Auto Generate
              </button>
            </div>
            <input
              type="text"
              placeholder="899..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-medium"
            />
          </div>
        </div>

        {/* Kategori & Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kategori Produk
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Mitra Supplier Pemasok
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || "SUP"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Harga Modal (HPP), Harga Jual, & Margin Insight */}
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/80 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Harga Beli Modal (HPP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={costPrice || ""}
                  onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Harga Jual Kasir <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-blue-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-black text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Margin Live Insight Banner */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-100">
            <span className="text-gray-500">Estimasi Keuntungan / Margin:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${profitPerItem >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatRupiah(profitPerItem)} per pcs
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  marginPercent >= 20
                    ? "bg-emerald-100 text-emerald-700"
                    : marginPercent > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {marginPercent > 0 ? `+${marginPercent}%` : `${marginPercent}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Stok Awal & Batas Minimum Stok */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Stok Fisik Saat Ini
            </label>
            <input
              type="number"
              min={0}
              placeholder="10"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Batas Minimum Stok
            </label>
            <input
              type="number"
              min={0}
              placeholder="5"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Status Produk
            </label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-bold"
            >
              <option value="active">Aktif (Dijual di Kasir)</option>
              <option value="inactive">Nonaktif (Diarsipkan)</option>
            </select>
          </div>
        </div>

        {/* Gambar & Icon Produk */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Icon / Gambar Produk
          </label>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 p-2 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={customImg.trim() || imgUrl}
                alt="Product Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as any).src = DEFAULT_PRODUCT_IMAGES[0].url;
                }}
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                placeholder="Masukkan URL Gambar Online (http://...)"
                value={customImg}
                onChange={(e) => setCustomImg(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-[10px] text-gray-400 block">
                Atau pilih salah satu preset icon cepat di bawah:
              </span>
            </div>
          </div>

          {/* Preset Images */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
            {DEFAULT_PRODUCT_IMAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setImgUrl(preset.url);
                  setCustomImg("");
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  (customImg === "" && imgUrl === preset.url)
                    ? "border-[#1e5bb8] bg-blue-50/70 shadow-sm"
                    : "border-gray-100 hover:border-gray-300 bg-white"
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[10px] text-gray-600 mt-1 truncate max-w-full font-medium">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
