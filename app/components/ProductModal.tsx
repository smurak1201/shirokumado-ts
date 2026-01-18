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
 * shadcn/uiのDialog、ScrollAreaコンポーネントを使用して実装されています。
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
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl p-0 overflow-hidden sm:rounded-lg">
        <ScrollArea className="max-h-[90vh]">
          <div className="flex flex-col">
            {/* 画像部分 - 高さ制限あり */}
            <div className="relative h-[40vh] min-h-[200px] max-h-[400px] overflow-hidden rounded-t-lg bg-muted">
              {product.imageUrl ? (
                <div className="relative h-full w-full flex items-center justify-center p-4 md:p-8">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1000px"
                    priority
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
              )}
            </div>

            {/* テキスト部分 */}
            <div className="p-6 md:p-8 lg:p-10">
              <DialogHeader className="space-y-4 mb-6">
                <DialogTitle className="whitespace-pre-wrap text-center text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
                  {product.name}
                </DialogTitle>
                {product.description && (
                  <DialogDescription className="text-center text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl max-w-2xl mx-auto">
                    {product.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {(product.priceS || product.priceL) && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    {product.priceS && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">S</span>
                        <Badge variant="secondary" className="text-xl font-semibold px-6 py-3 md:text-2xl">
                          {formatPrice(product.priceS)}
                        </Badge>
                      </div>
                    )}
                    {product.priceS && product.priceL && (
                      <Separator orientation="vertical" className="h-12" />
                    )}
                    {product.priceL && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">L</span>
                        <Badge variant="secondary" className="text-xl font-semibold px-6 py-3 md:text-2xl">
                          {formatPrice(product.priceL)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
