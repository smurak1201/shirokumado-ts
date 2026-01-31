"use client";

import { memo } from "react";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";
import { ProductCard, ProductCardContent, ProductCardHeader } from "./ui/card-product";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
    <ProductCard
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
      <ProductCardHeader>
        <AspectRatio ratio={1} className="w-full overflow-hidden">
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
      </ProductCardHeader>

      <ProductCardContent>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex min-h-[3.25em] cursor-pointer items-center justify-center">
                <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-normal leading-relaxed transition-colors duration-300 group-hover:text-foreground md:text-base lg:text-lg">
                  {product.name}
                </h3>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="whitespace-pre-wrap">{product.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ProductCardContent>
    </ProductCard>
  );
}

export default memo(ProductTile);
