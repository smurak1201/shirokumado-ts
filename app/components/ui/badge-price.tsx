/**
 * @fileoverview 商品価格バッジコンポーネント
 *
 * ## 概要
 * 商品詳細モーダルで価格を表示する専用のカスタムバッジコンポーネント
 * 基本のBadgeコンポーネントをラップし、価格表示に最適化された大きめのスタイルを適用します。
 *
 * ## 主な機能
 * - secondary バリアントをデフォルトで適用
 * - 大きめのフォントサイズ（モバイル: text-lg、デスクトップ: text-xl）
 * - 通常フォント（font-normal）で読みやすく
 * - レスポンシブなパディング（モバイル: px-5 py-2.5、デスクトップ: px-6 py-3）
 *
 * ## カスタマイズの理由
 * - 価格は重要な情報なので、他のバッジよりも大きく目立つサイズに設定
 * - font-normal を使用して、金額の数字を読みやすく表示
 * - パディングを大きくして、クリック可能な領域を確保
 *
 * ## デザイン原則
 * - 通常のBadgeよりも大きめに設計し、価格情報を強調
 * - レスポンシブデザインで、モバイルとデスクトップで適切なサイズを提供
 *
 * ## 使用例
 * ```tsx
 * <PriceBadge>¥1,200</PriceBadge>
 * ```
 *
 * @see app/components/ui/badge.tsx - 基本のBadgeコンポーネント
 * @see app/components/ProductModal.tsx - 使用例
 */
import { Badge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type PriceBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

/**
 * 価格表示用のBadgeコンポーネント
 *
 * 商品の価格を表示するためのBadgeラッパー。
 * secondary バリアント、大きめのフォントサイズとパディング、通常フォントがデフォルトで適用されています。
 *
 * @param {string} [className] - 追加のCSSクラス名
 */
export function PriceBadge({ className, ...props }: PriceBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("text-lg font-normal px-5 py-2.5 md:text-xl md:px-6 md:py-3", className)}
      {...props}
    />
  );
}
