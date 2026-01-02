"use client";

import { useRef, useState } from "react";
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
 */
export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  // ProductListコンポーネントのメソッドを呼び出すための参照
  // forwardRef と useImperativeHandle を使用して実装されています
  const productListRef = useRef<{ refreshProducts: () => Promise<void> }>(null);

  // 商品登録フォームの開閉状態を管理
  const [isFormOpen, setIsFormOpen] = useState(false);

  /**
   * 商品作成後のコールバック関数
   * 商品一覧を更新してフォームを閉じます
   */
  const handleProductCreated = async () => {
    // ProductListコンポーネントのrefreshProductsメソッドを呼び出して商品一覧を更新
    await productListRef.current?.refreshProducts();
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
        ref={productListRef}
        initialProducts={initialProducts}
        categories={categories}
        onNewProductClick={() => setIsFormOpen(true)}
      />
    </>
  );
}
