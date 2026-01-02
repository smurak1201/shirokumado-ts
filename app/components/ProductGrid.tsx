"use client";

import { useState } from "react";
import ProductTile from "./ProductTile";
import ProductModal from "./ProductModal";

type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
};

type Category = {
  id: number;
  name: string;
};

type ProductGridProps = {
  category: Category;
  products: Product[];
};

/**
 * カテゴリーごとの商品グリッドコンポーネント（3列表示）
 */
export default function ProductGrid({ category, products }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // モーダルが閉じた後に選択をクリア（アニメーション完了を待つ）
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  // 商品がない場合は何も表示しない
  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-16 md:mb-20">
        {/* カテゴリータイトル */}
        <div className="mb-10 border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-light tracking-widest text-gray-800 md:text-4xl">
            {category.name}
          </h2>
        </div>

        {/* 商品グリッド（3列） */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </section>

      {/* モーダルウィンドウ */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
