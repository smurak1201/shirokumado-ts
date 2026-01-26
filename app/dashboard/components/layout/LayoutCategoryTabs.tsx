"use client";

import { useEffect } from "react";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import type { Category, Product } from "../../types";

interface LayoutCategoryTabsProps {
  categories: Category[];
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  activeCategoryTab: string;
  onCategoryTabChange: (name: string) => void;
}

interface ProductCategoryTabButtonProps {
  categoryId: number;
  categoryName: string;
  productCount: number;
  isActive: boolean;
  onCategoryTabChange: (name: string) => void;
}

/**
 * 商品カテゴリータブボタンコンポーネント（内部コンポーネント）
 */
function ProductCategoryTabButton({
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

/**
 * 配置変更タブ用のカテゴリータブコンポーネント
 *
 * 配置変更タブで使用される、スクロール可能なカテゴリータブです。
 * 以下の機能を提供します：
 * - カテゴリーごとのタブ表示
 * - 各カテゴリーの商品数を表示
 * - 横スクロール対応（モバイル対応）
 * - スクロール可能な場合の視覚的インジケーター（グラデーション）
 * - アクティブなタブの自動スクロール
 */
export default function LayoutCategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: LayoutCategoryTabsProps) {
  const {
    scrollContainerRef,
    showLeftGradient,
    showRightGradient,
    checkScrollPosition,
  } = useScrollPosition();

  useEffect(() => {
    checkScrollPosition();
  }, [categories, publishedProductsByCategory, checkScrollPosition]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeButton = scrollContainerRef.current.querySelector(
      `button[data-category-name="${activeCategoryTab}"]`
    ) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategoryTab, scrollContainerRef]);

  return (
    <div className="mb-6 min-h-[140px]">
      <div className="mb-4 text-sm text-gray-600">
        <p>カテゴリーごとに公開している商品の配置を変更できます</p>
        <p>非公開の商品は表示されません</p>
      </div>

      <div className="border-b border-gray-200 relative -mx-6 px-6">
        {showLeftGradient && (
          <div className="absolute left-6 top-0 bottom-0 w-8 bg-linear-to-r from-white to-transparent pointer-events-none z-10" />
        )}
        {showRightGradient && (
          <div className="absolute right-6 top-0 bottom-0 w-8 bg-linear-to-l from-white to-transparent pointer-events-none z-10" />
        )}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <nav className="flex space-x-4 sm:space-x-8 min-w-max" role="tablist">
            {[...categories]
              .sort((a, b) => a.id - b.id)
              .map((category) => {
                const categoryGroup = publishedProductsByCategory.find(
                  (g) => g.name === category.name
                );
                const productCount = categoryGroup
                  ? categoryGroup.products.length
                  : 0;
                const isActive = activeCategoryTab === category.name;

                return (
                  <ProductCategoryTabButton
                    key={category.id}
                    categoryId={category.id}
                    categoryName={category.name}
                    productCount={productCount}
                    isActive={isActive}
                    onCategoryTabChange={onCategoryTabChange}
                  />
                );
              })}
          </nav>
        </div>
      </div>
    </div>
  );
}
