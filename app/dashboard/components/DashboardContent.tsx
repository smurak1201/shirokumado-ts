"use client";

import { useState } from "react";
import DashboardForm from "./DashboardForm";
import ProductList from "./ProductList";
import type { Category, Product } from "../types";

interface DashboardContentProps {
  categories: Category[];
  initialProducts: Product[];
}

/**
 * ダッシュボードのメインコンテナコンポーネント
 *
 * 商品登録フォームと商品一覧を管理します。
 * 状態をリフトアップして管理することで、データフローが明確になります。
 */
export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const refreshProducts = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("商品一覧の更新に失敗しました:", error);
    }
  };

  const handleProductCreated = async (): Promise<void> => {
    await refreshProducts();
    setIsFormOpen(false);
  };

  return (
    <>
      <DashboardForm
        categories={categories}
        onProductCreated={handleProductCreated}
        onClose={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />
      <ProductList
        products={products}
        setProducts={setProducts}
        refreshProducts={refreshProducts}
        categories={categories}
        onNewProductClick={() => setIsFormOpen(true)}
      />
    </>
  );
}
