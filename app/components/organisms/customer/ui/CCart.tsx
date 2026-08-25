import { formatRupiah } from "@/app/libs";
import { CartItemType } from "@/app/store/slices/cartSlice";
import { HiMinus, HiPlus } from "react-icons/hi";

type CartItemProps = {
  cart: CartItemType[];
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: "Cash" | "Card" | "QRIS";
  setPaymentMethod: (method: "Cash" | "Card" | "QRIS") => void;
  updateQty: (itemId: number, currentQty: number, delta: number) => void;
};

export const CCart = ({
  cart,
  discountAmount,
  paymentMethod,
  setPaymentMethod,
  subtotal,
  tax,
  total,
  updateQty,
}: CartItemProps) => {
  return (
    <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0">
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200/80 flex flex-col justify-between h-full min-h-[560px]">
        <div>
          {/* Header */}
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Current sale
          </h2>

          {/* Customer Row */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-5 border border-gray-100">
            <span className="text-xs font-semibold text-gray-700">
              Walk-in customer
            </span>
            <button className="text-xs font-bold text-gray-900 hover:text-[#065f46] transition-colors">
              + Add customer
            </button>
          </div>

          {/* Order Items List */}
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No items in cart
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Qty Badge Box */}
                    <div className="bg-[#e0f2fe] text-[#0284c7] font-bold text-xs w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                      {item.qty}
                    </div>
                    {/* Details */}
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Line Item Total & Qty controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {formatRupiah(item.product.price * item.qty)}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQty(item.id, item.qty, -1)}
                        className="p-1 hover:text-red-600"
                      >
                        <HiMinus size={12} />
                      </button>
                      <button
                        onClick={() => updateQty(item.id, item.qty, 1)}
                        className="p-1 hover:text-emerald-700"
                      >
                        <HiPlus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Calculation & Checkout Section */}
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
          {/* Pricing Breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Member discount</span>
              <span className="font-bold text-gray-900">
                – {formatRupiah(discountAmount)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Tax included</span>
              <span className="font-bold text-gray-900">
                {formatRupiah(tax)}
              </span>
            </div>
          </div>

          {/* Total Row */}
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-lg font-extrabold text-gray-900">Total</span>
            <span className="text-xl font-extrabold text-gray-900">
              {formatRupiah(total)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {(["Cash", "Card", "QRIS"] as const).map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#e0f2fe] border-2 border-[#065f46] text-[#065f46]"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>

          {/* Charge Button */}
          <button
            disabled={cart.length === 0}
            className="w-full bg-[#065f46] hover:bg-[#044e39] disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            Charge {formatRupiah(total)}
          </button>
        </div>
      </div>
    </div>
  );
};
