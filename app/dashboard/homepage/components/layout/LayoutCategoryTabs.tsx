/**
 * @file レイアウト配置変更タブ用のカテゴリータブコンポーネント
 *
 * ## 目的
 * 商品配置変更タブで使用される、カテゴリー別のタブUI を提供します。
 * スクロール可能なタブリストと、視覚的なスクロールインジケーターを実装しています。
 *
 * ## 主な機能
 * - カテゴリーごとのタブ表示
 * - 各カテゴリーの公開済み商品数を表示
 * - 横スクロール対応（モバイル端末でカテゴリーが多い場合）
 * - スクロール可能な場合の視覚的インジケーター（左右のグラデーション）
 * - アクティブなタブの自動スクロール（タブ変更時に中央に移動）
 *
 * ## 実装の特性
 * - Client Component（スクロール位置の監視とDOM操作を実装）
 * - カスタムフック（useScrollPosition）でスクロール状態を管理
 * - アクセシビリティ対応（role="tab", aria-selected）
 *
 * ## デザインの意図
 * - タブが多い場合でも横スクロールで全て表示可能
 * - スクロール可能な方向を視覚的に示す（グラデーション）
 * - レスポンシブ対応（モバイル: 小さめ、デスクトップ: 大きめ）
 *
 * ## 注意点
 * - スクロールバーは非表示（デザイン上の理由）
 * - グラデーションはpointer-events-noneでクリック不可（UX配慮）
 * - タブ変更時のスムーズスクロール（behavior: "smooth"）
 */

"use client";

import { useEffect } from "react";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import type { Category, Product } from "../../types";

/**
 * LayoutCategoryTabs コンポーネントのprops型定義
 *
 * @property categories - カテゴリー一覧（全カテゴリー）
 * @property publishedProductsByCategory - カテゴリー別の公開済み商品グループ
 * @property activeCategoryTab - 現在アクティブなカテゴリータブの名前
 * @property onCategoryTabChange - カテゴリータブ変更時のコールバック
 */
interface LayoutCategoryTabsProps {
  categories: Category[];
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  activeCategoryTab: string;
  onCategoryTabChange: (name: string) => void;
}

/**
 * ProductCategoryTabButton コンポーネントのprops型定義
 *
 * 個別のカテゴリータブボタンのpropsを定義します。
 *
 * @property categoryId - カテゴリーID（一意性確保のため）
 * @property categoryName - カテゴリー名（表示用）
 * @property productCount - 該当カテゴリーの公開済み商品数
 * @property isActive - アクティブ状態（現在選択中かどうか）
 * @property onCategoryTabChange - タブ変更ハンドラー
 */
interface ProductCategoryTabButtonProps {
  categoryId: number;
  categoryName: string;
  productCount: number;
  isActive: boolean;
  onCategoryTabChange: (name: string) => void;
}

/**
 * 商品カテゴリータブボタンコンポーネント（内部コンポーネント）
 *
 * 個別のカテゴリータブボタンを表示します。
 *
 * @param props - ProductCategoryTabButtonProps
 * @param props.categoryId - カテゴリーID
 * @param props.categoryName - カテゴリー名
 * @param props.productCount - 公開済み商品数
 * @param props.isActive - アクティブ状態
 * @param props.onCategoryTabChange - タブ変更ハンドラー
 *
 * @returns カテゴリータブボタン要素
 *
 * ## 実装の理由
 * - data-category-name 属性: アクティブタブの自動スクロールで使用
 * - role="tab" と aria-selected: アクセシビリティ対応
 * - whitespace-nowrap: タブ名が折り返さないようにする
 * - shrink-0: Flexboxで縮小されないようにする（タブの最小幅を保証）
 *
 * ## スタイルの意図
 * - アクティブ: 青いボーダーとテキスト（視覚的に明確）
 * - 非アクティブ: グレーで控えめ、ホバーで強調（インタラクション性を示唆）
 * - レスポンシブ: モバイルは小さめ、デスクトップは大きめ
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
      data-category-name={categoryName} // アクティブタブの自動スクロール用の識別子
      role="tab" // アクセシビリティ: タブロール
      aria-selected={isActive} // アクセシビリティ: 選択状態
      onClick={() => onCategoryTabChange(categoryName)}
      className={`relative whitespace-nowrap border-b-2 pb-3 sm:pb-4 px-2 sm:px-1 text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer ${
        isActive
          ? "border-blue-500 text-blue-600" // アクティブ時: 青いボーダーとテキスト
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" // 非アクティブ時: グレー、ホバーで強調
      }`}
    >
      {/* カテゴリー名 */}
      {categoryName}
      {/* 商品数バッジ */}
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
 *
 * @param props - LayoutCategoryTabsProps
 * @param props.categories - カテゴリー一覧
 * @param props.publishedProductsByCategory - カテゴリー別の公開済み商品グループ
 * @param props.activeCategoryTab - 現在アクティブなカテゴリータブ
 * @param props.onCategoryTabChange - タブ変更ハンドラー
 *
 * @returns カテゴリータブUI
 *
 * ## 構成要素
 * - 説明テキスト: 機能説明と注意事項
 * - スクロールインジケーター: 左右のグラデーション（スクロール可能な方向を示唆）
 * - タブボタン: ProductCategoryTabButton の配列
 *
 * ## 実装の理由
 * - useScrollPosition フック: スクロール位置を監視し、グラデーション表示を制御
 * - 2つの useEffect: データ変更時と、タブ変更時の異なるタイミングで処理を実行
 */
export default function LayoutCategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: LayoutCategoryTabsProps) {
  // スクロール位置の監視（左右のグラデーション表示制御用）
  const {
    scrollContainerRef,
    showLeftGradient,
    showRightGradient,
    checkScrollPosition,
  } = useScrollPosition();

  // カテゴリーや商品データが変更されたときにスクロール位置をチェック
  // データ変更でタブの幅が変わる可能性があるため
  useEffect(() => {
    checkScrollPosition();
  }, [categories, publishedProductsByCategory, checkScrollPosition]);

  // アクティブタブが変更されたときに、そのタブを画面中央にスクロール
  // UX向上: ユーザーが選択したタブが見えるようにする
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    // data-category-name 属性でアクティブなタブボタンを取得
    const activeButton = scrollContainerRef.current.querySelector(
      `button[data-category-name="${activeCategoryTab}"]`
    ) as HTMLElement;
    if (activeButton) {
      // スムーズスクロールでタブを中央に移動
      // inline: "center" で水平方向の中央に配置
      activeButton.scrollIntoView({
        behavior: "smooth", // スムーズスクロール
        block: "nearest", // 垂直方向は最も近い位置（変更なし）
        inline: "center", // 水平方向は中央
      });
    }
  }, [activeCategoryTab, scrollContainerRef]);

  return (
    <div className="mb-6">
      {/* 説明テキスト */}
      <div className="mb-4 text-sm text-gray-600">
        <p>カテゴリーごとに公開している商品の配置を変更できます</p>
        <p>非公開の商品は表示されません</p>
      </div>

      {/* タブコンテナ */}
      {/* -mx-6 px-6: 親の左右パディングを打ち消して、グラデーションを端まで表示 */}
      <div className="border-b border-gray-200 relative -mx-6 px-6">
        {/* 左側のグラデーション（左にスクロール可能な場合に表示） */}
        {/* pointer-events-none: クリックイベントを透過（下のボタンをクリック可能に） */}
        {showLeftGradient && (
          <div className="absolute left-6 top-0 bottom-0 w-8 bg-linear-to-r from-white to-transparent pointer-events-none z-10" />
        )}
        {/* 右側のグラデーション（右にスクロール可能な場合に表示） */}
        {showRightGradient && (
          <div className="absolute right-6 top-0 bottom-0 w-8 bg-linear-to-l from-white to-transparent pointer-events-none z-10" />
        )}

        {/* スクロール可能なタブリスト */}
        {/* スクロールバーを非表示にする（デザイン上の理由） */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            scrollbarWidth: "none", // Firefox用
            msOverflowStyle: "none", // IE/Edge用
          }}
        >
          {/* タブナビゲーション */}
          {/* min-w-max: 内容に応じて最小幅を設定（スクロール可能にするため） */}
          <nav className="flex space-x-4 sm:space-x-8 min-w-max" role="tablist">
            {/* カテゴリーをID順にソートして表示 */}
            {/* 理由: カテゴリーの表示順を一定にするため（データベースの取得順に依存しない） */}
            {[...categories]
              .sort((a, b) => a.id - b.id)
              .map((category) => {
                // 該当カテゴリーの商品グループを取得
                const categoryGroup = publishedProductsByCategory.find(
                  (g) => g.name === category.name
                );
                // 商品数を計算（グループがない場合は0）
                const productCount = categoryGroup
                  ? categoryGroup.products.length
                  : 0;
                // アクティブ状態を判定
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
