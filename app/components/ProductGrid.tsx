"use client";

import { useCallback } from "react";
import ProductTile from "./ProductTile";
import ProductModal from "./ProductModal";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";

interface ProductGridProps {
  category: Category;
  products: Product[];
}

/**
 * カテゴリーごとの商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドで表示します。
 * 商品タイルをクリックすると、商品詳細を表示するモーダルが開きます。
 */
export default function ProductGrid({ category, products }: ProductGridProps) {
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  if (products.length === 0) {
    return null;
  }

  const handleTileClick = useCallback(
    (product: Product) => {
      handleProductClick(product);
    },
    [handleProductClick]
  );

  return (
    <>
      <section className="mb-8 md:mb-16 lg:mb-12">
        <div className="mb-4 border-b border-gray-200 pb-2 md:mb-10 md:pb-5 lg:mb-6 lg:pb-3">
          <h2 className="text-center text-lg font-light tracking-widest text-gray-800 md:text-3xl lg:text-2xl">
            {category.name}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-6">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
              onClick={() => handleTileClick(product)}
            />
          ))}
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
