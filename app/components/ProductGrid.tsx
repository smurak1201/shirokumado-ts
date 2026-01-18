"use client";

import ProductTile from "./ProductTile";
import ProductModal from "./ProductModal";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";

interface ProductGridProps {
  category: Category;
  products: Product[];
  hideCategoryTitle?: boolean;
}

/**
 * カテゴリーごとの商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドで表示します。
 * 商品タイルをクリックすると、商品詳細を表示するモーダルが開きます。
 */
export default function ProductGrid({
  category,
  products,
  hideCategoryTitle = false,
}: ProductGridProps) {
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-12 md:mb-20 lg:mb-24">
        {!hideCategoryTitle && (
          <div className="mb-8 flex items-center justify-center md:mb-12 lg:mb-16">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <h2 className="text-center text-xl font-normal tracking-wide text-muted-foreground md:text-4xl lg:text-5xl">
                {category.name}
              </h2>
              <div className="h-px w-20 bg-linear-to-r from-transparent via-border/60 to-transparent md:w-32" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
