/**
 * 商品詳細モーダルコンポーネント
 *
 * 商品タイルをクリックした時に表示される、商品の詳細情報を表示するモーダル。
 */
"use client";

import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "@/lib/product-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { PriceBadge } from "./ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "./ui/card-modal";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
        <ScrollArea className="max-h-[90vh]">
          <div className="animate-modal-stagger flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            <div className="transition-transform duration-300 hover:scale-[1.02]">
              <ModalImageCard>
                <ModalCardHeader>
                  <div className="relative h-[40vh] min-h-50 max-h-112.5 md:h-[45vh] md:max-h-125 overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <div className="relative h-full w-full flex items-center justify-center p-4 md:p-6 transition-transform duration-400 hover:scale-105">
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
                  <DialogHeader className="space-y-3 mb-0">
                    <DialogTitle className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                      {product.name}
                    </DialogTitle>
                    {product.description && (
                      <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                        {product.description}
                      </DialogDescription>
                    )}
                  </DialogHeader>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
