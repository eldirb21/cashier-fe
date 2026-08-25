import { formatRupiah, Product } from "@/app/libs";

type props = {
  products: Product[];
  addToCart: (product: Product) => void;
};
export const CProductGrid = ({ products, addToCart }: props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12">
          No products found
        </div>
      )}
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => addToCart(product)}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-gray-200/70 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          {/* Image / Label Container */}
          <div className="bg-[#e0f2fe]/80 h-28 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#d0eaec] transition-colors">
            <span className="text-[#065f46] font-black text-xs tracking-widest uppercase">
              {product.barcode}
            </span>
          </div>

          {/* Info Container */}
          <div>
            <div className="flex justify-between items-baseline gap-1">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#065f46] transition-colors line-clamp-1">
                {product.name}
              </h4>
              <span className="text-[11px] text-gray-400 font-medium shrink-0">
                {product.stock} left
              </span>
            </div>
            <p className="text-xs font-extrabold text-gray-900 mt-1">
              {formatRupiah(product.price)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
