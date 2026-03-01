"use client";

import Image from "next/image";
import type { Product } from "@/app/types";
import { formatPrice } from "@/lib/product-utils";
import { Separator } from "@/app/components/ui/separator";
import { PriceBadge } from "@/app/components/ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "@/app/components/ui/card-modal";

interface ProductDetailProps {
  product: Product;
  /** 商品名・説明の表示をカスタマイズ（モーダルではDialog系要素を使用するため） */
  headerSlot: React.ReactNode;
}

export default function ProductDetail({ product, headerSlot }: ProductDetailProps) {
  return (
    <>
      <div className="transition-transform duration-300 md:hover:scale-[1.02]">
        <ModalImageCard>
          <ModalCardHeader>
            <div className="relative h-[40svh] min-h-50 max-h-112.5 md:h-[45svh] md:max-h-125 overflow-hidden bg-muted">
              {product.imageUrl ? (
                <div className="relative h-full w-full flex items-center justify-center p-4 md:p-6 transition-transform duration-400 md:hover:scale-105">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                    priority
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
              )}
            </div>
          </ModalCardHeader>
        </ModalImageCard>
      </div>

      <div>
        <ModalContentCard>
          <ModalCardContent>
            {headerSlot}
          </ModalCardContent>
        </ModalContentCard>
      </div>

      {(product.priceS || product.priceL) && (
        <div>
          <ModalPriceCard>
            <ModalCardContent>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                {product.priceS && (
                  <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                      Small
                    </span>
                    <PriceBadge className="text-lg md:text-xl">
                      {formatPrice(product.priceS)}
                    </PriceBadge>
                  </div>
                )}
                {product.priceS && product.priceL && (
                  <div className="flex flex-col items-center">
                    <Separator
                      orientation="vertical"
                      className="h-12 md:h-16 bg-border/50"
                    />
                  </div>
                )}
                {product.priceL && (
                  <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                      Large
                    </span>
                    <PriceBadge className="text-lg md:text-xl">
                      {formatPrice(product.priceL)}
                    </PriceBadge>
                  </div>
                )}
              </div>
            </ModalCardContent>
          </ModalPriceCard>
        </div>
      )}
    </>
  );
}
