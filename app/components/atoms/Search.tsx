import { HiOutlineQrcode, HiOutlineSearch, HiOutlineX } from "react-icons/hi";

type props = {
  search: string;
  onSearch: (search: string) => void;
  onClickScan: () => void;
  scannVisible: boolean;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
};
export const Search = ({
  search,
  onSearch,
  onClickScan,
  scannVisible = true,
  isScanning,
  setIsScanning,
}: props) => {
  return (
    <>
      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200/80 shadow-2xs flex items-center gap-3">
        <HiOutlineSearch className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search product, SKU, or scan barcode"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {scannVisible && (
          <div className="flex items-center gap-2">
            <button
              onClick={onClickScan}
              title="Scan Barcode"
              className="p-1.5 text-gray-400 hover:text-[#065f46] hover:bg-emerald-50 rounded-lg transition-all"
            >
              <HiOutlineQrcode size={20} />
            </button>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800">
                Scan Barcode / QR
              </h3>
              <button
                onClick={() => setIsScanning(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full"
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="p-4">
              <div
                id="reader"
                className="w-full overflow-hidden rounded-xl"
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
