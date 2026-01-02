"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "../types";

interface SortableProductItemProps {
  product: Product;
}

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
      style={style}
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {/* 商品画像 */}
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

      {/* 商品情報 */}
      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        {/* 商品名 */}
        <h3 className="mb-1 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:mb-2 sm:text-xs md:text-lg">
          {product.name}
        </h3>

        {/* 価格 */}
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
