"use client";

import { useCallback } from "react";
import ProductTile from "./ProductTile";
import ProductModal from "./ProductModal";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";

/**
 * ProductGrid の Props
 */
interface ProductGridProps {
  category: Category; // カテゴリー情報
  products: Product[]; // 商品一覧
}

/**
 * カテゴリーごとの商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドで表示します。
 * 商品タイルをクリックすると、商品詳細を表示するモーダルが開きます。
 *
 * Client Component として実装されており、以下の機能を提供します：
 * - 商品タイルの表示（3列グリッド）
 * - 商品クリック時のモーダル表示（`useProductModal`フックで管理）
 * - モーダルの開閉状態管理（`useProductModal`フックで管理）
 *
 * @param category - カテゴリー情報
 * @param products - 表示する商品一覧
 */
export default function ProductGrid({ category, products }: ProductGridProps) {
  // モーダルの状態管理（カスタムフックで実装）
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  // 商品がない場合は何も表示しない
  if (products.length === 0) {
    return null;
  }

  // 商品クリックハンドラーをuseCallbackでメモ化
  // これにより、ProductTileの再レンダリングを最小限に抑えます
  const handleTileClick = useCallback(
    (product: Product) => {
      handleProductClick(product);
    },
    [handleProductClick]
  );

  return (
    <>
      <section className="mb-8 md:mb-16 lg:mb-12">
        {/* カテゴリータイトル */}
        <div className="mb-4 border-b border-gray-200 pb-2 md:mb-10 md:pb-5 lg:mb-6 lg:pb-3">
          <h2 className="text-center text-lg font-light tracking-widest text-gray-800 md:text-3xl lg:text-2xl">
            {category.name}
          </h2>
        </div>

        {/* 商品グリッド（常に3列） */}
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

      {/* モーダルウィンドウ */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
