/**
 * Intercepting Route用モーダルコンポーネント
 *
 * サイト内遷移時に商品詳細をモーダルとして表示する。
 * クライアントキャッシュから商品データを取得し、DBへの再問い合わせを回避。
 * キャッシュにない場合はAPIからフェッチする（他ページからの遷移時など）。
 */
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Product } from "@/app/types";
import { useProductCache } from "@/app/contexts/ProductCacheContext";
import { fetchJson } from "@/lib/client-fetch";
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
  productId: number;
}

export default function ProductModalRoute({ productId }: ProductModalRouteProps) {
  const router = useRouter();
  const { getProduct } = useProductCache();
  const cachedProduct = getProduct(productId);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);

  // キャッシュにない場合のみAPIからフェッチ（他ページからの遷移時など）
  useEffect(() => {
    if (cachedProduct) return;

    fetchJson<{ product: Product }>(`/api/products/${productId}`)
      .then(({ product }) => setFetchedProduct(product))
      .catch(() => router.back());
  }, [cachedProduct, productId, router]);

  const product = cachedProduct ?? fetchedProduct;

  const handleClose = () => {
    router.back();
  };

  if (!product) {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
