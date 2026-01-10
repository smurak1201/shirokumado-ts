import { useState, useEffect, useRef, useCallback } from "react";
import type { Product } from "../types";

/**
 * 商品モーダルの状態管理を行うカスタムフック
 *
 * 商品タイルクリック時にモーダルを開き、閉じる際にアニメーション完了を待ってから
 * 選択状態をクリアします。
 *
 * Reactのベストプラクティスに従い、setTimeoutのクリーンアップを実装しています。
 *
 * @returns モーダルの状態と操作関数
 */
export function useProductModal() {
  // 選択された商品を管理（モーダル表示用）
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  // setTimeoutのIDを保持するためのref（クリーンアップ用）
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 商品タイルクリック時のハンドラー
   * 選択された商品を設定してモーダルを開きます
   *
   * useCallbackでメモ化しており、依存配列が空のため常に同じ関数参照を返します。
   * これにより、ProductGridコンポーネントの再レンダリングを最小限に抑えます。
   *
   * @param product - クリックされた商品
   */
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  /**
   * モーダル閉じる時のハンドラー
   * モーダルを閉じ、アニメーション完了後に選択をクリアします
   *
   * useCallbackでメモ化しており、依存配列が空のため常に同じ関数参照を返します。
   * これにより、ProductModalコンポーネントの再レンダリングを最小限に抑えます。
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // 既存のタイマーをクリア（複数回呼ばれた場合に備える）
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // モーダルが閉じた後に選択をクリア（アニメーション完了を待つ）
    timeoutRef.current = setTimeout(() => {
      setSelectedProduct(null);
      timeoutRef.current = null;
    }, 300);
  }, []);

  // コンポーネントのアンマウント時にタイマーをクリーンアップ
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
