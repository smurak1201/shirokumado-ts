"use client";

import { useState, useEffect, useRef } from "react";
import type { Category, Product } from "../types";

/**
 * CategoryTabs の Props
 */
interface CategoryTabsProps {
  /** カテゴリー一覧 */
  categories: Category[];
  /** カテゴリーごとにグループ化された公開商品 */
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  /** 現在選択されているカテゴリータブ名 */
  activeCategoryTab: string;
  /** カテゴリータブが変更されたときに呼び出されるコールバック関数 */
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
 *
 * @param props - CategoryTabsProps
 */
export default function CategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: CategoryTabsProps) {
  // スクロール可能なコンテナへの参照
  // useRef を使用して DOM 要素に直接アクセスします
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 左側のグラデーション表示フラグ（スクロール可能な場合に表示）
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  // 右側のグラデーション表示フラグ（スクロール可能な場合に表示）
  const [showRightGradient, setShowRightGradient] = useState(false);

  /**
   * スクロール位置をチェックしてグラデーションの表示を更新する関数
   *
   * スクロール可能な方向にグラデーションを表示することで、
   * ユーザーにスクロール可能であることを視覚的に伝えます。
   */
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    // 左側にスクロールできる場合（scrollLeft > 0）は左側のグラデーションを表示
    setShowLeftGradient(scrollLeft > 0);
    // 右側にスクロールできる場合（scrollLeft < scrollWidth - clientWidth - 1）は右側のグラデーションを表示
    // -1 は丸め誤差を考慮したマージン
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  };

  /**
   * スクロールイベントとリサイズイベントのリスナーを設定
   *
   * スクロールやウィンドウサイズの変更時にグラデーションの表示を更新します。
   * クリーンアップ関数でイベントリスナーを削除してメモリリークを防ぎます。
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 初期状態でグラデーションの表示をチェック
    checkScrollPosition();

    // スクロール時にグラデーションの表示を更新
    container.addEventListener("scroll", checkScrollPosition);
    // ウィンドウサイズが変更されたときもグラデーションの表示を更新
    // （タブの数が変わったり、画面サイズが変わった場合に対応）
    window.addEventListener("resize", checkScrollPosition);

    // クリーンアップ関数: コンポーネントがアンマウントされる際にイベントリスナーを削除
    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [categories, publishedProductsByCategory]); // カテゴリーや商品が変更されたときも再設定

  /**
   * アクティブなタブが変更されたときに、そのタブまで自動スクロール
   *
   * ユーザーが別の方法でタブを選択した場合（例: キーボード操作）でも、
   * 選択されたタブが画面内に表示されるようにします。
   */
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    // data-category-name 属性でアクティブなタブのボタンを検索
    const activeButton = scrollContainerRef.current.querySelector(
      `button[data-category-name="${activeCategoryTab}"]`
    ) as HTMLElement;
    if (activeButton) {
      // スムーズにスクロールしてアクティブなタブを中央に表示
      activeButton.scrollIntoView({
        behavior: "smooth", // スムーズなスクロールアニメーション
        block: "nearest", // 垂直方向の配置（nearest は最小限のスクロール）
        inline: "center", // 水平方向は中央に配置
      });
    }
  }, [activeCategoryTab]);

  return (
    <div className="mb-6">
      {/* 説明メッセージ */}
      <div className="mb-4 text-sm text-gray-600">
        <p>カテゴリーごとに公開している商品の配置を変更できます</p>
        <p>非公開の商品は表示されません</p>
      </div>

      <div className="border-b border-gray-200 relative -mx-6 px-6">
        {/* 左側のグラデーション */}
        {showLeftGradient && (
          <div className="absolute left-6 top-0 bottom-0 w-8 bg-linear-to-r from-white to-transparent pointer-events-none z-10" />
        )}
        {/* 右側のグラデーション */}
        {showRightGradient && (
          <div className="absolute right-6 top-0 bottom-0 w-8 bg-linear-to-l from-white to-transparent pointer-events-none z-10" />
        )}
        {/* スクロール可能なタブコンテナ */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            {[...categories]
              .sort((a, b) => a.id - b.id)
              .map((category) => {
                const categoryGroup = publishedProductsByCategory.find(
                  (g) => g.name === category.name
                );
                const productCount = categoryGroup
                  ? categoryGroup.products.length
                  : 0;

                return (
                  <button
                    key={category.id}
                    data-category-name={category.name}
                    onClick={() => onCategoryTabChange(category.name)}
                    className={`relative whitespace-nowrap border-b-2 pb-3 sm:pb-4 px-2 sm:px-1 text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                      activeCategoryTab === category.name
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
