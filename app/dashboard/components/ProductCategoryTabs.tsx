"use client";

import { useEffect } from "react";
import { useScrollPosition } from "../hooks/useScrollPosition";
import ProductCategoryTabButton from "./ProductCategoryTabButton";
import type { Category, Product } from "../types";

interface ProductCategoryTabsProps {
  categories: Category[];
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  activeCategoryTab: string;
  onCategoryTabChange: (name: string) => void;
}

/**
 * 商品カテゴリータブコンポーネント
 *
 * 配置変更タブで使用される、スクロール可能なカテゴリータブです。
 * 以下の機能を提供します：
 * - カテゴリーごとのタブ表示
 * - 各カテゴリーの商品数を表示
 * - 横スクロール対応（モバイル対応）
 * - スクロール可能な場合の視覚的インジケーター（グラデーション）
 * - アクティブなタブの自動スクロール
 */
export default function ProductCategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: ProductCategoryTabsProps) {
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
