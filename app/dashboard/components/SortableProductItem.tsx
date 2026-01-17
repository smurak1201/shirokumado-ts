"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-full rounded object-cover sm:h-32 md:h-48"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48" />
      )}

      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        <div className="mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]">
          <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg">
            {product.name}
          </h3>
        </div>

        <div className="mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm text-gray-500">
          {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}
          {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}
