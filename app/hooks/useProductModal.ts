/**
 * 商品モーダルフック
 *
 * モーダルを閉じる際にアニメーション完了を待ってから選択状態をクリアする。
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { Product } from "../types";
import { config } from "@/lib/config";

export function useProductModal() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // アニメーション完了を待ってから選択状態をクリア
    timeoutRef.current = setTimeout(() => {
      setSelectedProduct(null);
      timeoutRef.current = null;
    }, config.displayConfig.MODAL_CLOSE_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    selectedProduct,
    isModalOpen,
    handleProductClick,
    handleCloseModal,
  };
}
