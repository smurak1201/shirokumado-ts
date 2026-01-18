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
      <section className="mb-16 md:mb-24 lg:mb-20">
        <div className="mb-10 flex items-center justify-center md:mb-14 lg:mb-12">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-3xl">
              {category.name}
            </h2>
            <div className="h-px w-20 bg-linear-to-r from-transparent via-border to-transparent md:w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:gap-6">
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
