/**
 * 商品一覧の管理コンポーネント
 *
 * 商品の一覧表示、検索・フィルタリング、配置変更、編集・削除の機能を統合。
 * ProductLayoutTabは重いため動的インポートで必要時のみ読み込む。
 */
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ProductForm from "../form/ProductForm";
import ProductListTabs from "./ProductListTabs";
import ProductListContent from "./ProductListContent";
import { useTabState, useCategoryTabState } from "../../hooks/useTabState";
import { useProductSearch } from "../../hooks/useProductSearch";
import { useProductDelete } from "../../hooks/useProductDelete";
import type { Category, Product, TabType } from "../../types";

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
  const { handleDelete } = useProductDelete(refreshProducts);

  // タブ切り替え時にカテゴリタブを初期値にリセット（useEffectの連鎖を回避）
  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      if (tab === "layout" && initialCategoryTab) {
        setActiveCategoryTab(initialCategoryTab);
      }
    },
    [setActiveTab, initialCategoryTab, setActiveCategoryTab]
  );

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  const handleUpdated = useCallback(async () => {
    await refreshProducts();
  }, [refreshProducts]);

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <ProductListTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="min-h-100">
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
