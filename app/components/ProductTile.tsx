"use client";

import { memo } from "react";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
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
 * shadcn/uiのCardとAspectRatioコンポーネントを使用して実装されています。
 *
 * React.memoでメモ化しており、propsが変更されない限り再レンダリングされません。
 */
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
        "hover:border-primary/40 border-border/60",
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
      <CardHeader className="p-0">
        <AspectRatio ratio={1} className="overflow-hidden">
          {product.imageUrl ? (
            <div className="relative h-full w-full bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                loading="lazy"
              />
              {/* ホバー時のオーバーレイ */}
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
            </div>
          ) : (
            <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
          )}
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex min-h-[3rem] items-center justify-center p-1.5 transition-colors duration-300 group-hover:bg-muted/30 md:min-h-[5rem] md:p-6">
        <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-medium leading-relaxed transition-colors duration-300 group-hover:text-foreground md:text-base lg:text-lg">
          {product.name}
        </h3>
      </CardContent>
    </Card>
  );
}

export default memo(ProductTile);
