"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import ProductEditForm from "./ProductEditForm";
import ProductListTabs from "./ProductListTabs";
import ProductListContent from "./ProductListContent";
import ProductLayoutTab from "./ProductLayoutTab";
import { useTabState, useCategoryTabState } from "../hooks/useTabState";
import { filterProducts } from "../utils/productUtils";
import type { Category, Product } from "../types";

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
  categories: Category[];
  onNewProductClick?: () => void;
}

/**
 * 商品一覧コンポーネント
 *
 * 商品の一覧表示と配置変更の機能を提供します。
 * 「登録済み商品一覧」タブでは検索・フィルタリング機能を提供し、
 * 「配置変更」タブではドラッグ&ドロップによる商品の順序変更機能を提供します。
 */
export default function ProductList({
  products,
  setProducts,
  refreshProducts,
  categories,
  onNewProductClick,
}: ProductListProps) {
  const { activeTab, setActiveTab } = useTabState();
  const { activeCategoryTab, setActiveCategoryTab, initialCategoryTab } =
    useCategoryTabState(products, categories);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (activeTab === "layout" && initialCategoryTab) {
      setActiveCategoryTab(initialCategoryTab);
    }
  }, [activeTab, initialCategoryTab, setActiveCategoryTab]);

  const [searchName, setSearchName] = useState("");
  const [searchPublished, setSearchPublished] = useState<boolean | null>(null);
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  const handleDelete = useCallback(
    async (productId: number): Promise<void> => {
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "削除に失敗しました");
        }

        alert("商品を削除しました");
        await refreshProducts();
      } catch (error) {
        log.error("商品の削除に失敗しました", {
          context: "ProductList.handleDelete",
          error,
          metadata: { productId },
        });
        alert(getUserFriendlyMessageJa(error));
      }
    },
    [refreshProducts]
  );

  const handleUpdated = useCallback(async () => {
    await refreshProducts();
  }, [refreshProducts]);

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <ProductListTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-h-[400px]">
          {activeTab === "list" && (
            <ProductListContent
              products={products}
              filteredProducts={filteredProducts}
              categories={categories}
              searchName={searchName}
              setSearchName={setSearchName}
              searchPublished={searchPublished}
              setSearchPublished={setSearchPublished}
              searchCategoryId={searchCategoryId}
              setSearchCategoryId={setSearchCategoryId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNewProductClick={onNewProductClick}
            />
          )}

          {activeTab === "layout" && (
            <ProductLayoutTab
              products={products}
              categories={categories}
              activeCategoryTab={activeCategoryTab}
              onCategoryTabChange={setActiveCategoryTab}
              setProducts={setProducts}
              refreshProducts={refreshProducts}
            />
          )}
        </div>
      </div>

      {editingProduct && (
        <ProductEditForm
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
