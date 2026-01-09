"use client";

import { useState } from "react";
import DashboardFormWrapper from "./DashboardFormWrapper";
import ProductList from "./ProductList";
import type { Category, Product } from "../types";

/**
 * DashboardContent の Props
 */
interface DashboardContentProps {
  categories: Category[]; // カテゴリー一覧
  initialProducts: Product[]; // 初期商品一覧（Server Componentから渡される）
}

/**
 * ダッシュボードのメインコンテナコンポーネント
 * 商品登録フォームと商品一覧を管理します
 *
 * Client Component として実装されており、インタラクティブな機能を提供します
 *
 * Reactのベストプラクティスに従い、状態をリフトアップして管理しています。
 * これにより、データフローが明確になり、コンポーネント間の結合が緩くなります。
 */
export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  // 商品一覧の状態を親コンポーネントで管理（状態のリフトアップ）
  // これにより、データフローが明確になり、Reactのベストプラクティスに沿った実装になります
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // 商品登録フォームの開閉状態を管理
  const [isFormOpen, setIsFormOpen] = useState(false);

  /**
   * 商品一覧をサーバーから取得して更新する
   * 商品の追加・更新・削除後に呼び出されます
   */
  const refreshProducts = async () => {
    try {
      // キャッシュを完全に無効化するためにタイムスタンプをクエリパラメータに追加
      // これにより、常に最新のデータを取得できます
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: "no-store", // Next.js のキャッシュを無効化
        headers: {
          "Cache-Control": "no-cache", // ブラウザのキャッシュを無効化
        },
      });
      const data = await response.json();
      // 取得した商品一覧で状態を更新
      setProducts(data.products || []);
    } catch (error) {
      console.error("商品一覧の更新に失敗しました:", error);
    }
  };

  /**
   * 商品作成後のコールバック関数
   * 商品一覧を更新してフォームを閉じます
   */
  const handleProductCreated = async () => {
    // 商品一覧を更新
    await refreshProducts();
    // フォームを閉じる
    setIsFormOpen(false);
  };

  return (
    <>
      <DashboardFormWrapper
        categories={categories}
        onProductCreated={handleProductCreated}
        isFormOpen={isFormOpen}
        onFormOpenChange={setIsFormOpen}
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
