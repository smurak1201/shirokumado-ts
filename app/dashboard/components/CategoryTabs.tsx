"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Category, Product } from "../types";

interface CategoryTabsProps {
  categories: Category[];
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  activeCategoryTab: string;
  onCategoryTabChange: (name: string) => void;
}

/**
 * カテゴリータブコンポーネント
 *
 * 配置変更タブで使用される、スクロール可能なカテゴリータブです。
 * 以下の機能を提供します：
 * - カテゴリーごとのタブ表示
 * - 各カテゴリーの商品数を表示
 * - 横スクロール対応（モバイル対応）
 * - スクロール可能な場合の視覚的インジケーター（グラデーション）
 * - アクティブなタブの自動スクロール
 */
export default function CategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
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
  }, [activeCategoryTab]);

  return (
    <div className="mb-6">
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
                  <button
                    key={category.id}
                    data-category-name={category.name}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onCategoryTabChange(category.name)}
                    className={`relative whitespace-nowrap border-b-2 pb-3 sm:pb-4 px-2 sm:px-1 text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {category.name}
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-400">
                      ({productCount})
                    </span>
                  </button>
                );
              })}
          </nav>
        </div>
      </div>
    </div>
  );
}
