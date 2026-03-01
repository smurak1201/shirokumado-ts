/**
 * 商品データのクライアントサイドキャッシュ
 *
 * トップページで取得済みの商品データを保持し、
 * Intercepting Routeのモーダル表示時にDBへの再問い合わせを回避する
 */
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Product } from "@/app/types";

interface ProductCacheContextType {
  getProduct: (id: number) => Product | undefined;
  setProducts: (products: Product[]) => void;
}

const ProductCacheContext = createContext<ProductCacheContextType | null>(null);

export function ProductCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<Map<number, Product>>(new Map());

  const getProduct = useCallback((id: number): Product | undefined => {
    return cacheRef.current.get(id);
  }, []);

  const setProducts = useCallback((products: Product[]): void => {
    for (const product of products) {
      cacheRef.current.set(product.id, product);
    }
  }, []);

  return (
    <ProductCacheContext.Provider value={{ getProduct, setProducts }}>
      {children}
    </ProductCacheContext.Provider>
  );
}

export function useProductCache(): ProductCacheContextType {
  const context = useContext(ProductCacheContext);
  if (!context) {
    throw new Error("useProductCache は ProductCacheProvider 内で使用してください");
  }
  return context;
}
