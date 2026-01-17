interface ProductCategoryTabButtonProps {
  categoryId: number;
  categoryName: string;
  productCount: number;
  isActive: boolean;
  onCategoryTabChange: (name: string) => void;
}

/**
 * 商品カテゴリータブボタンコンポーネント
 */
export default function ProductCategoryTabButton({
  categoryId,
  categoryName,
  productCount,
  isActive,
  onCategoryTabChange,
}: ProductCategoryTabButtonProps) {
  return (
    <button
      key={categoryId}
      data-category-name={categoryName}
      role="tab"
      aria-selected={isActive}
      onClick={() => onCategoryTabChange(categoryName)}
      className={`relative whitespace-nowrap border-b-2 pb-3 sm:pb-4 px-2 sm:px-1 text-xs sm:text-sm font-medium transition-colors shrink-0 ${
        isActive
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {categoryName}
      <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-400">
        ({productCount})
      </span>
    </button>
  );
}
