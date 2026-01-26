import { useState, useMemo } from "react";
import { filterProducts } from "../utils/productUtils";
import type { Product } from "../types";

/**
 * 商品検索の状態管理を行うカスタムフック
 *
 * 商品一覧の検索・フィルタリング機能を提供します。
 */
export function useProductSearch(products: Product[]) {
  const [searchName, setSearchName] = useState("");
  const [searchPublished, setSearchPublished] = useState<boolean | null>(null);
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );

  const resetFilters = () => {
    setSearchName("");
    setSearchPublished(null);
    setSearchCategoryId(null);
  };

  return {
    searchName,
    setSearchName,
    searchPublished,
    setSearchPublished,
    searchCategoryId,
    setSearchCategoryId,
    filteredProducts,
    resetFilters,
  };
}
