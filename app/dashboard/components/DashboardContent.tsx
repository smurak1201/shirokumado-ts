"use client";

import { useRef, useState } from "react";
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
  published: boolean;
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
        tags={tags}
        onProductCreated={handleProductCreated}
        isFormOpen={isFormOpen}
        onFormOpenChange={setIsFormOpen}
      />
      <ProductList
        ref={productListRef}
        initialProducts={initialProducts}
        categories={categories}
        tags={tags}
        onNewProductClick={() => setIsFormOpen(true)}
      />
    </>
  );
}
