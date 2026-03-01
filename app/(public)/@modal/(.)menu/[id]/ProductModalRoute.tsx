/**
 * Intercepting Route用モーダルコンポーネント
 *
 * サイト内遷移時に商品詳細をモーダルとして表示する。
 * router.back()でモーダルを閉じ、元のページのURLに戻す。
 */
"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import ProductDetail from "@/app/components/ProductDetail";

interface ProductModalRouteProps {
  product: Product;
}

export default function ProductModalRoute({ product }: ProductModalRouteProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
        <ScrollArea className="max-h-[90vh]">
          <div className="animate-modal-stagger flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            <ProductDetail
              product={product}
              headerSlot={
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
              }
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
