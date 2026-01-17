"use client";

import ProductSearchFilters from "./ProductSearchFilters";
import ProductListView from "./ProductListView";
import type { Category, Product } from "../types";

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

      <ProductListView
        products={products}
        filteredProducts={filteredProducts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
