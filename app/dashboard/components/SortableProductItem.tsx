"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../types";

interface SortableProductItemProps {
  product: Product;
}

/**
 * ドラッグ&ドロップ可能な商品アイテムコンポーネント
 *
 * 配置変更タブで使用される、ドラッグ&ドロップで順序を変更できる商品カードです。
 * @dnd-kit ライブラリを使用して実装されています。
 */
export default function SortableProductItem({
  product,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: "none",
      }}
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <ProductCardContent product={product} />
    </div>
  );
}
