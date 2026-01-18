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
import { Card, CardContent, CardHeader } from "./ui/card";

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
          <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            {/* 画像部分 - Cardで囲む */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-[35vh] min-h-[200px] max-h-[400px] overflow-hidden bg-muted">
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
              </CardHeader>
            </Card>

            {/* 商品情報部分 - Cardで囲む */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <DialogHeader className="space-y-3 mb-0">
                  <DialogTitle className="whitespace-pre-wrap text-center text-xl font-bold leading-tight text-foreground md:text-2xl lg:text-3xl">
                    {product.name}
                  </DialogTitle>
                  {product.description && (
                    <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                      {product.description}
                    </DialogDescription>
                  )}
                </DialogHeader>
              </CardContent>
            </Card>

            {/* 価格部分 - Cardで囲む */}
            {(product.priceS || product.priceL) && (
              <Card className="border-0 shadow-sm bg-muted/30">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
                    {product.priceS && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">S</span>
                        <Badge variant="secondary" className="text-lg font-bold px-5 py-2.5 md:text-xl md:px-6 md:py-3">
                          {formatPrice(product.priceS)}
                        </Badge>
                      </div>
                    )}
                    {product.priceS && product.priceL && (
                      <Separator orientation="vertical" className="h-12 md:h-16" />
                    )}
                    {product.priceL && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">L</span>
                        <Badge variant="secondary" className="text-lg font-bold px-5 py-2.5 md:text-xl md:px-6 md:py-3">
                          {formatPrice(product.priceL)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
