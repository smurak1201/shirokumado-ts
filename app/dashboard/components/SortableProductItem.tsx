"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "../types";

/**
 * SortableProductItem の Props
 */
interface SortableProductItemProps {
  /** 表示する商品 */
  product: Product;
}

/**
 * ドラッグ&ドロップ可能な商品アイテムコンポーネント
 *
 * 配置変更タブで使用される、ドラッグ&ドロップで順序を変更できる商品カードです。
 * @dnd-kit ライブラリを使用して実装されています。
 *
 * 機能:
 * - マウス・タッチ・キーボードでのドラッグ操作に対応
 * - ドラッグ中の視覚的フィードバック（透明度とシャドウ）
 * - スムーズなアニメーション
 *
 * @param props - SortableProductItemProps
 */
export default function SortableProductItem({
  product,
}: SortableProductItemProps) {
  /**
   * @dnd-kit の useSortable フックを使用してドラッグ&ドロップ機能を実装
   *
   * - attributes: アクセシビリティ属性（ARIA属性など）
   * - listeners: ドラッグを開始するためのイベントハンドラー
   * - setNodeRef: DOM要素への参照を設定する関数
   * - transform: ドラッグ中の位置変換情報
   * - transition: アニメーションのトランジション情報
   * - isDragging: 現在ドラッグ中かどうかのフラグ
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  /**
   * ドラッグ中のスタイルを計算
   *
   * - transform: ドラッグ中の位置を CSS transform 形式に変換
   * - transition: スムーズなアニメーションのためのトランジション
   * - opacity: ドラッグ中は半透明（0.5）にして視覚的フィードバックを提供
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: "none", // スマホでのタッチ操作を制御（スクロールとの競合を防ぐ）
      }}
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {/* 商品画像 */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-full rounded object-cover sm:h-32 md:h-48"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48" />
      )}

      {/* 商品情報 */}
      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        {/* 商品名 */}
        <div className="mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]">
          <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg">
            {product.name}
          </h3>
        </div>

        {/* 価格 */}
        <div className="mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm text-gray-500">
          {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}
          {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}
