"use client";

import { memo } from "react";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface ProductTileProps {
  product: ProductTileType;
  onClick: () => void;
}

/**
 * 商品タイルコンポーネント
 *
 * 商品の画像と商品名を表示するタイルコンポーネントです。
 * クリックすると、親コンポーネントに通知して商品詳細モーダルを開きます。
 * shadcn/uiのCardコンポーネントを使用して実装されています。
 *
 * React.memoでメモ化しており、propsが変更されない限り再レンダリングされません。
 */
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:border-primary/20",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${product.name}の詳細を見る`}
    >
      {product.imageUrl ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/0 transition-colors duration-300 group-hover:bg-background/5" />
        </div>
      ) : (
        <div className="aspect-square w-full rounded-t-lg bg-gradient-to-br from-muted to-muted/50" />
      )}

      <CardContent className="flex h-[3em] items-center justify-center rounded-b-lg p-1.5 md:h-[4em] md:p-5 lg:h-[3.5em] lg:p-4">
        <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-medium leading-relaxed md:text-lg lg:text-base">
          {product.name}
        </h3>
      </CardContent>
    </Card>
  );
}

export default memo(ProductTile);
