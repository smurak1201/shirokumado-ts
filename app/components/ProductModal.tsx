"use client";

import Image from "next/image";
import type { Product } from "../types";
import { useModal } from "../hooks/useModal";
import { formatPrice } from "../utils/format";
import CloseIcon from "./icons/CloseIcon";

/**
 * ProductModal の Props
 */
interface ProductModalProps {
  product: Product | null; // 表示する商品情報（nullの場合は非表示）
  isOpen: boolean; // モーダルの開閉状態
  onClose: () => void; // モーダルを閉じるコールバック関数
}

/**
 * 商品詳細を表示するモーダルウィンドウコンポーネント
 *
 * 商品の詳細情報（画像、名前、説明、価格）をモーダルウィンドウで表示します。
 *
 * Client Component として実装されており、以下の機能を提供します：
 * - 商品画像の拡大表示（Next.js Imageを使用）
 * - 商品名、説明、価格の表示
 * - ESCキーでモーダルを閉じる（`useModal`フックで実装）
 * - 背景クリックでモーダルを閉じる
 * - モーダル表示時の背景スクロール無効化（`useModal`フックで実装）
 * - フェードイン・フェードアウトアニメーション
 *
 * @param product - 表示する商品情報
 * @param isOpen - モーダルの開閉状態
 * @param onClose - モーダルを閉じるコールバック関数
 */
export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  // ESCキー処理と背景スクロール無効化を管理
  useModal(isOpen, onClose);

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
        {/* 閉じるボタン - スクロールしても右上に固定表示 */}
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4">
          <button
            onClick={onClose}
            className="rounded-full bg-white/90 p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-800 shadow-md"
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 商品画像 */}
        {product.imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
              priority
            />
          </div>
        ) : (
          <div className="aspect-square w-full bg-linear-to-br from-gray-50 to-gray-100" />
        )}

        {/* 商品情報 */}
        <div className="p-6 md:p-8">
          {/* 商品名 */}
          <div className="mb-4 flex h-[4em] items-center justify-center md:h-[4.25em]">
            <h2 className="line-clamp-2 whitespace-pre-wrap text-center text-2xl font-medium leading-relaxed text-gray-800 md:text-3xl">
              {product.name}
            </h2>
          </div>

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
                  S: {formatPrice(product.priceS)}
                </span>
              )}
              {product.priceS && product.priceL && (
                <span className="text-xl text-gray-300">/</span>
              )}
              {product.priceL && (
                <span className="text-2xl font-medium tracking-wide text-gray-800 md:text-3xl">
                  L: {formatPrice(product.priceL)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
