"use client";

import { memo } from "react";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";

/**
 * ProductTile の Props
 */
interface ProductTileProps {
  product: ProductTileType; // 表示する商品情報
  onClick: () => void; // クリック時のコールバック関数
}

/**
 * 商品タイルコンポーネント
 *
 * 商品の画像と商品名を表示するタイルコンポーネントです。
 * クリックすると、親コンポーネントに通知して商品詳細モーダルを開きます。
 *
 * Client Component として実装されており、以下の機能を提供します：
 * - 商品画像の表示（アスペクト比1:1）
 * - 商品名の表示（2行固定、`line-clamp-2`）
 * - ホバーエフェクト（画像の拡大、影の追加）
 * - アクセシビリティ対応（aria-label）
 *
 * React.memoでメモ化しており、propsが変更されない限り再レンダリングされません。
 * これにより、商品グリッドのパフォーマンスが向上します。
 *
 * @param product - 表示する商品情報
 * @param onClick - クリック時のコールバック関数
 */
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
      aria-label={`${product.name}の詳細を見る`}
    >
      {/* 商品画像 */}
      {product.imageUrl ? (
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
            loading="lazy"
          />
          {/* ホバー時のオーバーレイ */}
          <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
        </div>
      ) : (
        <div className="aspect-square w-full bg-linear-to-br from-gray-50 to-gray-100" />
      )}

      {/* 商品名 */}
      <div className="flex h-[3em] items-center justify-center p-1.5 md:h-[4em] md:p-5 lg:h-[3.5em] lg:p-4">
        <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-medium leading-relaxed text-gray-800 md:text-lg lg:text-base">
          {product.name}
        </h3>
      </div>
    </button>
  );
}

// React.memoでメモ化（propsが変更されない限り再レンダリングされない）
export default memo(ProductTile);
