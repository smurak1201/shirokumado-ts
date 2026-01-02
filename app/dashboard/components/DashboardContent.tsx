"use client";

import { useRef, useState } from "react";
import DashboardFormWrapper from "./DashboardFormWrapper";
import ProductList from "./ProductList";
import type { Category, Product } from "../types";

interface DashboardContentProps {
  categories: Category[];
  initialProducts: Product[];
}

export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  const productListRef = useRef<{ refreshProducts: () => Promise<void> }>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleProductCreated = async () => {
    // 商品一覧を更新
    await productListRef.current?.refreshProducts();
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
