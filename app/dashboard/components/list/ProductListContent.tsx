"use client";

import ProductSearchFilters from "./ProductSearchFilters";
import ProductCard from "./ProductCard";
import type { Category, Product } from "../../types";

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
 * 検索フィルターと商品リストを表示します。
 * フィルタリングされた商品一覧を3列グリッドで表示し、空状態の処理も行います。
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
      <div className="min-h-[140px]">
        <div className="mb-4">
          {onNewProductClick && (
            <button
              onClick={onNewProductClick}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 whitespace-nowrap"
            >
              新規商品登録
            </button>
          )}
        </div>

        <ProductSearchFilters
          searchName={searchName}
          setSearchName={setSearchName}
          searchPublished={searchPublished}
          setSearchPublished={setSearchPublished}
          searchCategoryId={searchCategoryId}
          setSearchCategoryId={setSearchCategoryId}
          categories={categories}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500">
          {products.length === 0
            ? "登録されている商品はありません"
            : "検索条件に一致する商品がありません"}
        </p>
      ) : (
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
