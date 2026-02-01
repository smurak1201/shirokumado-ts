/**
 * 商品検索フック
 *
 * クライアント側での商品フィルタリング。
 * useMemoでフィルター結果をキャッシュし、条件変更時のみ再計算する。
 */
import { useState, useMemo } from "react";
import { filterProducts } from "../utils/productUtils";
import type { Product } from "../types";

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
