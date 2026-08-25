"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../atoms";
import { useConfirm } from "./confirmationProvider";
import { categories } from "@/app/libs/data";
import { toSlug } from "@/app/libs";

const DEFAULT_ICONS = [
  { label: "Snack", url: "https://cdn-icons-png.flaticon.com/512/2553/2553642.png" },
  { label: "Mie Cup", url: "https://cdn-icons-png.flaticon.com/512/3014/3014534.png" },
  { label: "Mie Instan", url: "https://cdn-icons-png.flaticon.com/512/599/599502.png" },
  { label: "Minuman", url: "https://cdn-icons-png.flaticon.com/512/3100/3100566.png" },
  { label: "Kopi", url: "https://cdn-icons-png.flaticon.com/512/924/924514.png" },
  { label: "Es Krim", url: "https://cdn-icons-png.flaticon.com/512/938/938063.png" },
  { label: "Roti", url: "https://cdn-icons-png.flaticon.com/512/3014/3014488.png" },
  { label: "Lainnya", url: "https://cdn-icons-png.flaticon.com/512/2917/2917633.png" },
];

type CategoriesFormProps = {
  id?: string;
  onSuccess?: () => void;
};

export function CategoriesForm({ id, onSuccess }: CategoriesFormProps) {
  const router = useRouter();
  const { showAlert } = useConfirm();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    img: DEFAULT_ICONS[0].url,
    isActive: true,
  });

  const [customImgUrl, setCustomImgUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Find category by id or slug
      const found = categories.find(
        (c) => c.id === id || c.slug === id || toSlug(c.name) === id
      );
      if (found) {
        setForm({
          name: found.name || "",
          slug: found.slug || toSlug(found.name || ""),
          description: found.description || "",
          img: found.img || found.img_url || DEFAULT_ICONS[0].url,
          isActive: found.is_active ?? true,
        });
      }
    }
  }, [id]);

  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !isEdit || prev.slug === toSlug(prev.name) ? toSlug(val) : prev.slug,
    }));
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, img: previewUrl }));
    }
  };

  const handleSelectIcon = (url: string) => {
    setForm((prev) => ({ ...prev, img: url }));
    setCustomImgUrl("");
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Nama kategori wajib diisi!");
      return;
    }

    if (isEdit) {
      showAlert("Kategori berhasil diperbarui!", "success");
    } else {
      showAlert("Kategori baru berhasil ditambahkan!", "success");
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.back();
    }
  };

  return (
    <Modal
      onClose={() => router.back()}
      title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
      onSave={handleSave}
    >
      <div className="space-y-5">
        {/* Nama & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Makanan Ringan"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full bg-gray-50 border ${
                error ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              } rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all`}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Slug URL
            </label>
            <input
              type="text"
              placeholder="contoh: makanan-ringan"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Deskripsi & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Deskripsi
            </label>
            <textarea
              rows={2}
              placeholder="Masukkan deskripsi singkat kategori..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Icon & Gambar */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Icon / Gambar Kategori
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Current Selected Image Preview */}
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 p-2.5 flex items-center justify-center shrink-0 shadow-sm">
              {form.img ? (
                <img
                  src={form.img}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No Icon</span>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Atau masukkan URL Icon/Gambar..."
                  value={customImgUrl}
                  onChange={(e) => {
                    setCustomImgUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setForm((prev) => ({ ...prev, img: e.target.value.trim() }));
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Icons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-gray-400">Pilihan Cepat Icon:</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {DEFAULT_ICONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectIcon(preset.url)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    form.img === preset.url
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
      </div>
    </Modal>
  );
}
