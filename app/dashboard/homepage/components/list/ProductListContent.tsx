/**
 * @fileoverview 商品一覧のコンテンツコンポーネント
 *
 * ## 目的
 * 「登録済み商品一覧」タブの内容（検索フィルター + 商品グリッド）を表示します。
 *
 * ## 主な機能
 * - 新規商品登録ボタンの表示
 * - 検索フィルターUI（商品名、カテゴリー、公開状態）
 * - フィルタリングされた商品一覧をグリッド表示
 * - 空状態の処理（商品なし/検索条件に一致なし）
 *
 * ## 実装の特性
 * - Client Component: 検索フィルターのインタラクションを扱うため
 * - プレゼンテーショナルコンポーネント（フィルター状態は親で管理）
 * - レスポンシブ対応: 3列グリッド（モバイル〜デスクトップで gap を調整）
 *
 * ## レイアウト設計
 * - 3列グリッド: 一覧性とカードサイズのバランスを考慮
 *   - モバイル: gap-1（狭い画面でも3列表示）
 *   - タブレット: gap-2
 *   - デスクトップ: gap-4
 *
 * ## ベストプラクティス
 * - 空状態のメッセージを分岐: 「商品なし」vs「検索条件に一致なし」
 * - onNewProductClick はオプショナル: 新規登録機能を持たないケースに対応
 *
 * @see {@link ProductSearchFilters} - 検索フィルターUI
 * @see {@link ProductCard} - 商品カード
 */
"use client";

import ProductSearchFilters from "./ProductSearchFilters";
import ProductCard from "./ProductCard";
import type { Category, Product } from "../../types";

/**
 * ProductListContent コンポーネントのprops
 *
 * @property {Product[]} products - 全商品リスト（空状態の判定に使用）
 * @property {Product[]} filteredProducts - フィルタリング済みの商品リスト（表示用）
 * @property {Category[]} categories - カテゴリーリスト（フィルターのドロップダウンで使用）
 * @property {string} searchName - 商品名検索の入力値
 * @property {(value: string) => void} setSearchName - 商品名検索の更新関数
 * @property {boolean | null} searchPublished - 公開状態フィルター（null/true/false）
 * @property {(value: boolean | null) => void} setSearchPublished - 公開状態フィルターの更新関数
 * @property {number | null} searchCategoryId - カテゴリーフィルター（null/カテゴリーID）
 * @property {(value: number | null) => void} setSearchCategoryId - カテゴリーフィルターの更新関数
 * @property {(product: Product) => void} onEdit - 商品編集ボタンのクリックハンドラー
 * @property {(productId: number) => Promise<void>} onDelete - 商品削除ボタンのクリックハンドラー
 * @property {() => void} [onNewProductClick] - 新規商品登録ボタンのクリックハンドラー（オプション）
 */
interface ProductListContentProps {
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  searchName: string;
  setSearchName: (value: string) => void;
  searchPublished: boolean | null;
  setSearchPublished: (value: boolean | null) => void;
  searchCategoryId: number | null;
  setSearchCategoryId: (value: number | null) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => Promise<void>;
  onNewProductClick?: () => void;
}

/**
 * 商品一覧のコンテンツコンポーネント
 *
 * 検索フィルターと商品リストを統合して表示します。
 * フィルタリングされた商品を3列グリッドで表示し、空状態も適切に処理します。
 *
 * @param {ProductListContentProps} props - コンポーネントのprops
 * @returns {JSX.Element} 商品一覧コンテンツUI
 *
 * @example
 * ```tsx
 * <ProductListContent
 *   products={allProducts}
 *   filteredProducts={filtered}
 *   categories={categories}
 *   searchName={searchName}
 *   setSearchName={setSearchName}
 *   searchPublished={searchPublished}
 *   setSearchPublished={setSearchPublished}
 *   searchCategoryId={searchCategoryId}
 *   setSearchCategoryId={setSearchCategoryId}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onNewProductClick={() => setIsFormOpen(true)}
 * />
 * ```
 */
export default function ProductListContent({
  products,
  filteredProducts,
  categories,
  searchName,
  setSearchName,
  searchPublished,
  setSearchPublished,
  searchCategoryId,
  setSearchCategoryId,
  onEdit,
  onDelete,
  onNewProductClick,
}: ProductListContentProps) {
  return (
    <>
      {/* 新規商品登録ボタン: onNewProductClick が渡されている場合のみ表示 */}
      <div className="mb-4">
        {onNewProductClick && (
          <button
            onClick={onNewProductClick}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 whitespace-nowrap cursor-pointer transition-all active:scale-95"
          >
            新規商品登録
          </button>
        )}
      </div>

      {/* 検索フィルターUI: 商品名、カテゴリー、公開状態で絞り込み */}
      <ProductSearchFilters
        searchName={searchName}
        setSearchName={setSearchName}
        searchPublished={searchPublished}
        setSearchPublished={setSearchPublished}
        searchCategoryId={searchCategoryId}
        setSearchCategoryId={setSearchCategoryId}
        categories={categories}
      />

      {/* フィルタリング結果の表示 */}
      {filteredProducts.length === 0 ? (
        // 空状態: 全商品がない場合と検索条件に一致しない場合でメッセージを分岐
        <p className="text-gray-500">
          {products.length === 0
            ? "登録されている商品はありません"
            : "検索条件に一致する商品がありません"}
        </p>
      ) : (
        // 商品グリッド: 3列レイアウト（レスポンシブな gap 調整）
        // - gap-1: モバイル（狭い画面でも3列表示を維持）
        // - sm:gap-2: タブレット
        // - md:gap-4: デスクトップ
        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
