"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import ProductForm from "../form/ProductForm";
import ProductListTabs from "./ProductListTabs";
import ProductListContent from "./ProductListContent";
import { useTabState, useCategoryTabState } from "../../hooks/useTabState";
import { useProductSearch } from "../../hooks/useProductSearch";
import type { Category, Product } from "../../types";

const ProductLayoutTab = dynamic(
  () => import("../layout/ProductLayoutTab"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    ),
    ssr: false,
  }
);

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

  const {
    searchName,
    setSearchName,
    searchPublished,
    setSearchPublished,
    searchCategoryId,
    setSearchCategoryId,
    filteredProducts,
  } = useProductSearch(products);

  useEffect(() => {
    if (activeTab === "layout" && initialCategoryTab) {
      setActiveCategoryTab(initialCategoryTab);
    }
  }, [activeTab, initialCategoryTab, setActiveCategoryTab]);

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
        <ProductForm
          categories={categories}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleUpdated}
          mode="edit"
          product={editingProduct}
        />
      )}
    </>
  );
}
