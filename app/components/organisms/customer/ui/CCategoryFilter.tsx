type ConfCategories = {
  label: string;
  value: string;
};

type props = {
  tabCategories: ConfCategories[];
  fetchByCategory: (category: string) => void;
  categoryId: string;
};
export const CCategoryFilter = ({
  tabCategories,
  fetchByCategory,
  categoryId,
}: props) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
      {tabCategories.map((cat, i) => {
        const isActive = categoryId === cat.value;
        return (
          <button
            key={i}
            onClick={() => fetchByCategory(cat.value)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              isActive
                ? "bg-[#065f46] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/70"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
