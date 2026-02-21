/**
 * 商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドレイアウトで表示する。
 */
"use client";

import dynamic from "next/dynamic";
import ProductTile from "./ProductTile";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";
import { useInView } from "../hooks/useInView";

// モーダルはユーザーがクリックした時のみ必要なため、SSRの必要がない
const ProductModal = dynamic(
  () => import("./ProductModal"),
  { ssr: false }
);

interface ProductGridProps {
  category: Category;
  products: Product[];
  showCategoryTitle?: boolean;
}

export default function ProductGrid({
  category,
  products,
  showCategoryTitle = true,
}: ProductGridProps) {
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();
  const { ref: titleRef, isInView: titleInView } = useInView<HTMLDivElement>();
  const { ref: gridRef, isInView: gridInView } = useInView<HTMLDivElement>({ margin: "-50px" });

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-12 md:mb-20 lg:mb-24">
        {showCategoryTitle && (
          <div
            ref={titleRef}
            className={`animate-on-scroll mb-8 flex items-center justify-center md:mb-12 lg:mb-16 ${titleInView ? "is-visible" : ""}`}
          >
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <h2 className="text-center text-xl font-normal tracking-wide text-muted-foreground md:text-4xl lg:text-5xl">
                {category.name}
              </h2>
              <div className="h-px w-20 bg-linear-to-r from-transparent via-border/60 to-transparent md:w-32" />
            </div>
          </div>
        )}

        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`animate-on-scroll stagger-delay-${Math.min(index + 1, 8)} ${gridInView ? "is-visible" : ""}`}
            >
              <ProductTile
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                }}
                onClick={() => handleProductClick(product)}
              />
            </div>
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
