"use client";

import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 商品詳細を表示するモーダルウィンドウコンポーネント
 *
 * 商品の詳細情報（画像、名前、説明、価格）をモーダルウィンドウで表示します。
 * shadcn/uiのDialog、ScrollArea、AspectRatioコンポーネントを使用して実装されています。
 * ESCキーでモーダルを閉じる機能と、背景クリックでモーダルを閉じる機能を提供します。
 */
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
      <DialogContent className="max-h-[90vh] max-w-3xl !flex !flex-col p-0 gap-0 overflow-hidden">
        {/* 画像部分 - 固定 */}
        <div className="relative flex-shrink-0 border-b">
          {product.imageUrl ? (
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <div className="relative h-full w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
                  priority
                />
              </div>
            </AspectRatio>
          ) : (
            <AspectRatio ratio={16 / 9}>
              <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
            </AspectRatio>
          )}
        </div>

        {/* テキスト部分 - ScrollAreaでスクロール可能 */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="whitespace-pre-wrap text-center text-2xl font-semibold leading-tight md:text-3xl">
                {product.name}
              </DialogTitle>
              {product.description && (
                <DialogDescription className="text-center text-base text-muted-foreground md:text-lg">
                  {product.description}
                </DialogDescription>
              )}
            </DialogHeader>

            {(product.priceS || product.priceL) && (
              <>
                <Separator className="my-6" />
                <div className="flex flex-wrap items-baseline justify-center gap-4">
                  {product.priceS && (
                    <Badge variant="secondary" className="text-lg px-4 py-2 md:text-xl">
                      <span className="mr-2 text-xs font-normal">S</span>
                      {formatPrice(product.priceS)}
                    </Badge>
                  )}
                  {product.priceL && (
                    <Badge variant="secondary" className="text-lg px-4 py-2 md:text-xl">
                      <span className="mr-2 text-xs font-normal">L</span>
                      {formatPrice(product.priceL)}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
