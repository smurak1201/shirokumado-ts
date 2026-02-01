/**
 * 商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドレイアウトで表示する。
 */
"use client";

import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { config } from "@/lib/config";
import ProductTile from "./ProductTile";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

export default function ProductGrid({
  category,
  products,
  showCategoryTitle = true,
}: ProductGridProps) {
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-12 md:mb-20 lg:mb-24">
        {showCategoryTitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-center md:mb-12 lg:mb-16"
          >
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <h2 className="text-center text-xl font-normal tracking-wide text-muted-foreground md:text-4xl lg:text-5xl">
                {category.name}
              </h2>
              <div className="h-px w-20 bg-linear-to-r from-transparent via-border/60 to-transparent md:w-32" />
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <ProductTile
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                }}
                onClick={() => handleProductClick(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
