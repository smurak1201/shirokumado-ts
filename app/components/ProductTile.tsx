/**
 * 商品タイルコンポーネント
 *
 * 商品グリッドに表示される個別の商品タイル。
 * 商品画像と名前を表示し、クリックで商品詳細ページ（/menu/[id]）に遷移する。
 * サイト内遷移時はIntercepting Routeによりモーダルとして表示される。
 */
"use client";

import { memo } from "react";
import Link from "next/link";
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
}

function ProductTile({ product }: ProductTileProps) {
  return (
    <Link href={`/menu/${product.id}`} scroll={false}>
      <ProductCard aria-label={`${product.name}の詳細を見る`}>
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
                <div className="flex min-h-[2.5em] cursor-pointer items-center justify-center md:min-h-[3.25em]">
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
    </Link>
  );
}

// React.memo でメモ化: 商品グリッドに多数表示されるため、不要な再レンダリングを防ぐ
export default memo(ProductTile);
