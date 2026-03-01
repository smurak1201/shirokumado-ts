/**
 * 商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドレイアウトで表示する。
 */
"use client";

import ProductTile from "./ProductTile";
import type { Category, Product } from "../types";
import { useInView } from "../hooks/useInView";
import { scrollAnimationClass } from "@/lib/animation";

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
  const { ref: titleRef, isInView: titleInView } = useInView<HTMLDivElement>();
  const { ref: gridRef, isInView: gridInView } = useInView<HTMLDivElement>({ margin: "-50px" });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 md:mb-20 lg:mb-24">
      {showCategoryTitle && (
        <div
          ref={titleRef}
          className={`${scrollAnimationClass(titleInView)} mb-8 flex items-center justify-center md:mb-12 lg:mb-16`}
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
            className={scrollAnimationClass(gridInView, index)}
          >
            <ProductTile
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
