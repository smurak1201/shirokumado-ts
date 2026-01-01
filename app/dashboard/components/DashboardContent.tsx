"use client";

import { useRef } from "react";
import DashboardFormWrapper from "./DashboardFormWrapper";
import ProductList from "./ProductList";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  tags: Tag[];
  publishedAt: string | null;
  endedAt: string | null;
}

interface DashboardContentProps {
  categories: Category[];
  tags: Tag[];
  initialProducts: Product[];
}

export default function DashboardContent({
  categories,
  tags,
  initialProducts,
}: DashboardContentProps) {
  const productListRef = useRef<{ refreshProducts: () => Promise<void> }>(null);

  const handleProductCreated = () => {
    // 商品一覧を更新
    productListRef.current?.refreshProducts();
  };

  return (
    <>
      <DashboardFormWrapper
        categories={categories}
        tags={tags}
        onProductCreated={handleProductCreated}
      />
      <ProductList
        ref={productListRef}
        initialProducts={initialProducts}
        categories={categories}
        tags={tags}
      />
    </>
  );
}
