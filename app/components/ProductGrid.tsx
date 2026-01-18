"use client";

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

  return (
    <>
      <section className="mb-12 md:mb-20 lg:mb-16">
        <div className="mb-8 flex items-center justify-center md:mb-12 lg:mb-10">
          <div className="relative">
            <h2 className="relative z-10 text-center text-xl font-light tracking-[0.2em] text-foreground/90 md:text-4xl lg:text-3xl">
              {category.name}
            </h2>
            <div className="absolute -bottom-2 left-1/2 h-[1px] w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:w-24" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-6">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
              onClick={() => handleProductClick(product)}
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
