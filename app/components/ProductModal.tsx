"use client";

import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 商品詳細を表示するモーダルウィンドウコンポーネント
 *
 * 商品の詳細情報（画像、名前、説明、価格）をモーダルウィンドウで表示します。
 * shadcn/uiのDialogコンポーネントを使用して実装されています。
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
      <DialogContent className="max-h-[90vh] max-w-2xl !flex !flex-col p-0 gap-0 overflow-hidden">
        {/* 画像部分 - 固定、高さ制限あり */}
        <div className="relative flex-shrink-0">
          {product.imageUrl ? (
            <div className="relative w-full h-[40vh] max-h-[400px] min-h-[200px] flex items-center justify-center overflow-hidden rounded-t-lg bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
                priority
              />
            </div>
          ) : (
            <div className="w-full h-[40vh] max-h-[400px] min-h-[200px] rounded-t-lg bg-gradient-to-br from-muted to-muted/50" />
          )}
        </div>

        {/* テキスト部分 - スクロール可能 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="whitespace-pre-wrap text-center text-2xl font-medium leading-relaxed md:text-3xl">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="mb-6 mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground md:text-lg">
                {product.description}
              </p>
            )}

            {(product.priceS || product.priceL) && (
              <>
                <Separator className="my-6" />
                <div className="flex flex-wrap items-baseline justify-center gap-3">
                  {product.priceS && (
                    <span className="text-2xl font-medium tracking-wide md:text-3xl">
                      S: {formatPrice(product.priceS)}
                    </span>
                  )}
                  {product.priceS && product.priceL && (
                    <span className="text-xl text-muted-foreground">/</span>
                  )}
                  {product.priceL && (
                    <span className="text-2xl font-medium tracking-wide md:text-3xl">
                      L: {formatPrice(product.priceL)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
