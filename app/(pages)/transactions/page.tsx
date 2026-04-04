"use client";

import { Headers } from "@/app/components/atoms";
import { OrderItem } from "@/app/components/molecules";
import { Html5QrcodeScanner } from "html5-qrcode";
import React, { useEffect, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineCamera,
  HiOutlineX,
  HiOutlineViewGrid,
} from "react-icons/hi";
type ProductProps = {
  id: number;
  name: string;
  price: string;
  img: string;
  code: string;
};
const categories = [
  {
    id: 1,
    name: "All",
    icon: <HiOutlineViewGrid className="text-blue-500" size={24} />,
  },
  {
    id: 2,
    name: "Makanan Ringan",
    img: "https://cdn-icons-png.flaticon.com/512/2553/2553642.png",
  },
  {
    id: 3,
    name: "Mie Cup",
    img: "https://cdn-icons-png.flaticon.com/512/3014/3014534.png",
  },
  {
    id: 4,
    name: "Mie Instan",
    img: "https://cdn-icons-png.flaticon.com/512/599/599502.png",
  },
];

const products: ProductProps[] = [
  {
    id: 1,
    name: "Galon Le Minerale 5 L",
    price: "RP 15.000,00",
    img: "https://le-minerale.com/assets/img/product/le-minerale-5l.png",
    code: "8992759170570",
  },
  {
    id: 2,
    name: "Aqua 600 ML",
    price: "RP 3.000,00",
    img: "https://www.sehataqua.co.id/wp-content/uploads/2021/11/AQUA-600ml.png",
    code: "8992759170571",
  },
  {
    id: 3,
    name: "Aqua Galon",
    price: "RP 20.000,00",
    img: "https://www.sehataqua.co.id/wp-content/uploads/2021/11/AQUA-Galon.png",
    code: "8992759170572",
  },
  {
    id: 4,
    name: "Tissue Jolly 250 sheets",
    price: "RP 10.000,00",
    img: "https://www.sehataqua.co.id/wp-content/uploads/2021/11/AQUA-Galon.png",
    code: "8992759170580",
  },
];

const Transactions = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [productSearch, setProductSearch] = useState<ProductProps[]>([]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      // PERBAIKAN: Gunakan setTimeout agar React selesai render div #reader
      const timeoutId = setTimeout(() => {
        const element = document.getElementById("reader");
        if (element) {
          scanner = new Html5QrcodeScanner(
            "reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              useBarCodeDetectorIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 10,
            },
            false,
          );

          scanner.render(
            (decodedText) => {
              setScannedResult(decodedText);
              findProduct(decodedText);
              setIsScanning(false);
              scanner?.clear();
            },
            (error) => {
              /* handle error jika perlu */
            },
          );
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scanner) {
          scanner
            .clear()
            .catch((err) => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [isScanning]);

  useEffect(() => {
    findProduct(scannedResult);
  }, [scannedResult]);

  const findProduct = (code: string) => {
    if (!code) {
      setProductSearch(products);
      return;
    }

    const product = products.find((x) => x.code === code);

    if (product) {
      setProductSearch([product]);
    } else {
      setProductSearch([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScannedResult(value);
    findProduct(value);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Headers />

      <main className="max-w-360 mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* BAGIAN KIRI: DAFTAR PRODUK (Lebar 2/3 di desktop) */}
          <div className="flex-1 space-y-6">
            {/* 1. Barcode Scanner / Search */}
            <div className="bg-white p-1 rounded-lg border-2 border-blue-200 flex items-center shadow-sm">
              <div className="p-2 text-gray-400">
                <HiOutlineSearch size={22} />
              </div>
              <input
                type="text"
                placeholder="Scan Barcode"
                value={scannedResult}
                className="w-full border-none focus:ring-0 text-sm py-2 text-black placeholder:text-gray-300"
                onChange={handleChange}
              />
              {/* Tombol Buka Kamera */}
              <button
                onClick={() => setIsScanning(true)}
                className="p-2 mr-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <HiOutlineCamera size={24} />
              </button>

              {/* MODAL SCANNER (Tambahkan bagian ini) */}
              {isScanning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="text-sm font-bold text-gray-700">
                        Scan Barcode
                      </h3>
                      <button
                        onClick={() => setIsScanning(false)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <HiOutlineX size={20} />
                      </button>
                    </div>
                    <div className="p-4">
                      {/* ID ini harus sama dengan yang dipanggil di scanner */}
                      <div
                        id="reader"
                        className="w-full overflow-hidden rounded-xl"
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Horizontal Categories */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm min-w-fit hover:border-blue-300 transition-all"
                >
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    cat.icon
                  )}
                  <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-b border-gray-200"></div>

            {/* 3. Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {productSearch.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col items-center relative group"
                >
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-[#22c55e] text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm z-10">
                    {product.price}
                  </div>

                  {/* Product Image */}
                  <div className="h-48 w-full flex items-center justify-center p-4">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <p className="text-[13px] font-bold text-gray-700 text-center mb-4 min-h-[40px]">
                    {product.name}
                  </p>

                  <button className="w-full bg-[#1e5bb8] hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* 4. Pagination (Mini) */}
            <div className="flex justify-center mt-8">
              <button className="w-8 h-8 bg-[#1e5bb8] text-white rounded text-xs font-bold shadow-md">
                1
              </button>
            </div>
          </div>

          {/* BAGIAN KANAN: ORDER ITEMS / STRUK (Lebar 1/3 di desktop) */}
          <OrderItem />
        </div>
      </main>
    </div>
  );
};

export default Transactions;
