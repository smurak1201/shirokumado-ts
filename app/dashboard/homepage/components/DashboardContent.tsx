/**
 * ダッシュボードメインコンテンツ
 *
 * 商品データの状態をリフトアップし、ProductFormとProductListで共有する。
 */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { log } from "@/lib/logger";
import { fetchJson } from "@/lib/client-fetch";
import ProductForm from "./form/ProductForm";
import ProductList from "./list/ProductList";
import type { Category, Product } from "../types";

interface DashboardContentProps {
  categories: Category[];
  initialProducts: Product[];
}

export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);

  /**
   * 商品一覧を最新データで更新
   *
   * 設計判断: キャッシュ無効化でタイムスタンプとCache-Controlヘッダーを使用し、
   * 常に最新データを取得する。楽観的更新は採用せず、データ整合性を優先。
   */
  const refreshProducts = async (): Promise<void> => {
    try {
      const data = await fetchJson<{ products: Product[] }>(
        `/api/products?t=${Date.now()}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }
      );
      setProducts(data.products || []);
    } catch (error) {
      log.error("商品一覧の更新に失敗しました", {
        context: "DashboardContent.refreshProducts",
        error,
      });
      toast.error("商品一覧の更新に失敗しました");
    }
  };

  const handleProductCreated = async (): Promise<void> => {
    await refreshProducts();
    setIsFormOpen(false);
  };

  return (
    <>
      <ProductForm
        categories={categories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleProductCreated}
        mode="create"
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
