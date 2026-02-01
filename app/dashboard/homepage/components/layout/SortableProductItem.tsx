/**
 * @file ドラッグ&ドロップ可能な商品アイテムコンポーネント
 *
 * ## 目的
 * 商品配置変更タブで使用される、ドラッグ&ドロップで順序を変更できる商品カードを提供します。
 *
 * ## 主な機能
 * - ドラッグ&ドロップ操作に対応
 * - ドラッグ中の視覚的フィードバック（透明度変更、影の追加）
 * - スムーズなアニメーション（transform、transition）
 * - タッチデバイス対応（touchAction: "none"）
 *
 * ## 実装の特性
 * - Client Component（ドラッグ&ドロップのインタラクションを実装）
 * - @dnd-kit/sortable の useSortable フックを使用
 * - CSS.Transform でスムーズな移動アニメーションを実現
 *
 * ## ライブラリの使用理由
 * useSortable フック：
 * - ドラッグ&ドロップに必要な属性とイベントリスナーを自動生成
 * - transform と transition でスムーズなアニメーションを提供
 * - isDragging 状態でドラッグ中の視覚的フィードバックを実現
 *
 * ## 注意点
 * - touchAction: "none" は必須（タッチデバイスでスクロールとドラッグを区別するため）
 * - cursor-move でドラッグ可能であることを視覚的に示唆
 * - ProductCardContent を再利用（商品カードの表示ロジックを分離）
 *
 * @see {@link https://docs.dndkit.com/presets/sortable} @dnd-kit/sortable 公式ドキュメント
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductCardContent from "../list/ProductCardContent";
import type { Product } from "../../types";

/**
 * SortableProductItem コンポーネントのprops型定義
 *
 * @property product - 商品データ（表示とドラッグ&ドロップの識別に使用）
 */
interface SortableProductItemProps {
  product: Product;
}

/**
 * ドラッグ&ドロップ可能な商品アイテムコンポーネント
 *
 * 配置変更タブで使用される、ドラッグ&ドロップで順序を変更できる商品カードです。
 * @dnd-kit ライブラリを使用して実装されています。
 *
 * @param props - SortableProductItemProps
 * @param props.product - 商品データ
 *
 * @returns ドラッグ可能な商品カード
 *
 * ## 構成要素
 * - ProductCardContent: 商品の表示内容（画像、名前、価格など）
 * - useSortable フック: ドラッグ&ドロップ機能を提供
 *
 * ## 実装の理由
 * - useSortable フック: @dnd-kit/sortable が提供する、ソート可能なアイテムのフック
 * - product.id を識別子として使用: 各商品を一意に識別するため
 * - CSS.Transform.toString: transform プロパティを文字列に変換（ブラウザ互換性向上）
 *
 * ## 視覚的フィードバック
 * - ドラッグ中: 透明度50%、影を追加（ユーザーに操作中であることを視覚的に伝える）
 * - 通常時: 透明度100%、影なし
 * - カーソル: cursor-move（ドラッグ可能であることを示唆）
 */
export default function SortableProductItem({
  product,
}: SortableProductItemProps) {
  // useSortable フック: ドラッグ&ドロップに必要な機能を提供
  // - attributes: アクセシビリティ属性（aria-*など）
  // - listeners: ドラッグイベントリスナー（onPointerDown など）
  // - setNodeRef: DOM要素への参照を設定
  // - transform: ドラッグ中の移動量（x, y座標）
  // - transition: アニメーションのトランジション設定
  // - isDragging: ドラッグ中かどうかの状態
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  // インラインスタイル: transform と transition でスムーズなアニメーションを実現
  const style = {
    transform: CSS.Transform.toString(transform), // 移動量を CSS の transform プロパティに変換
    transition, // @dnd-kit が自動的に設定するトランジション
    opacity: isDragging ? 0.5 : 1, // ドラッグ中は透明度を下げる（視覚的フィードバック）
  };

  return (
    // ドラッグ可能な商品カードコンテナ
    <div
      ref={setNodeRef} // DOM要素への参照を設定（@dnd-kit が要素を追跡するため）
      style={{
        ...style,
        touchAction: "none", // タッチデバイスでスクロールとドラッグを区別（必須設定）
      }}
      // レスポンシブパディング: モバイル（p-1）→ タブレット（p-2）→ デスクトップ（p-4）
      // cursor-move: ドラッグ可能であることを視覚的に示唆
      // isDragging 時に shadow-lg を追加: ドラッグ中の視覚的フィードバック
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes} // アクセシビリティ属性（aria-pressed, aria-roledescription など）
      {...listeners} // ドラッグイベントリスナー（onPointerDown, onKeyDown など）
    >
      {/* 商品カードの表示内容（画像、名前、価格など） */}
      {/* ProductCardContent を再利用（商品一覧と配置変更で同じ表示ロジックを共有） */}
      <ProductCardContent product={product} />
    </div>
  );
}
