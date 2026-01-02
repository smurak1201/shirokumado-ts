"use client";

import { useEffect } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
};

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * 商品詳細を表示するモーダルウィンドウコンポーネント
 */
export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // モーダルが開いている時は背景のスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-800"
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 商品画像 */}
        {product.imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100" />
        )}

        {/* 商品情報 */}
        <div className="p-6 md:p-8">
          {/* 商品名 */}
          <h2 className="mb-4 text-2xl font-medium leading-relaxed text-gray-800 md:text-3xl">
            {product.name}
          </h2>

          {/* 商品説明 */}
          {product.description && (
            <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-gray-600 md:text-lg">
              {product.description}
            </p>
          )}

          {/* 価格 */}
          {(product.priceS || product.priceL) && (
            <div className="flex items-baseline gap-3 border-t border-gray-200 pt-6">
              {product.priceS && (
                <span className="text-2xl font-medium tracking-wide text-gray-800 md:text-3xl">
                  S: ¥{Number(product.priceS).toLocaleString()}
                </span>
              )}
              {product.priceS && product.priceL && (
                <span className="text-xl text-gray-300">/</span>
              )}
              {product.priceL && (
                <span className="text-2xl font-medium tracking-wide text-gray-800 md:text-3xl">
                  L: ¥{Number(product.priceL).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
