/**
 * @fileoverview 商品タイル専用カードコンポーネント
 *
 * ## 概要
 * 商品一覧グリッドで使用する商品タイル専用のカスタムコンポーネント
 * 基本のCardコンポーネントをラップし、商品タイル専用のインタラクティブなスタイルを適用します。
 *
 * ## 主な機能
 * - ホバー時のリフトアップアニメーション（-translate-y-2）
 * - ホバー時の大きなシャドウ（shadow-2xl）
 * - クリック時のスケールダウン（active:scale-95）
 * - フォーカス時のリング表示（focus-within:ring-2）
 * - スムーズなトランジション（duration-500）
 *
 * ## カスタマイズの理由
 * - 商品タイルをクリック可能なボタンのように見せるため、リッチなインタラクションを実装
 * - ホバーエフェクトでユーザーにクリック可能であることを明確に示す
 * - group クラスで子要素（ProductCardContent）にもホバー効果を連動
 * - アクセシビリティを考慮してフォーカスリングを追加
 *
 * ## デザイン原則
 * - cursor-pointer でカーソル形状を変更し、クリック可能であることを示す
 * - duration-500 で比較的長めのトランジションを設定し、滑らかなアニメーションを実現
 *
 * ## 使用例
 * ```tsx
 * <ProductCard onClick={() => openModal(product)}>
 *   <ProductCardHeader>
 *     <Image src={product.imageUrl} alt={product.name} />
 *   </ProductCardHeader>
 *   <ProductCardContent>
 *     <h3>{product.name}</h3>
 *     <p>{product.price}円</p>
 *   </ProductCardContent>
 * </ProductCard>
 * ```
 *
 * @see app/components/ui/card.tsx - 基本のCardコンポーネント
 * @see app/components/ProductGrid.tsx - 使用例
 */
import { Card, CardContent, CardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ProductCardProps = ComponentPropsWithoutRef<typeof Card>;
export type ProductCardContentProps = ComponentPropsWithoutRef<typeof CardContent>;
export type ProductCardHeaderProps = ComponentPropsWithoutRef<typeof CardHeader>;

/**
 * 商品タイル用のCardコンポーネント
 *
 * 商品一覧で使用するカードコンポーネント。
 * ホバーエフェクト（リフトアップ、シャドウ強調、ボーダー変更）、
 * フォーカススタイル、クリック時のスケールダウンがデフォルトで適用されています。
 *
 * @param {string} [className] - 追加のCSSクラス名
 */
export function ProductCard({ className, ...props }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
        "hover:border-primary/40 border-border/60",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "active:scale-95",
        className
      )}
      {...props}
    />
  );
}

/**
 * 商品タイル用のCardContentコンポーネント
 */
export function ProductCardContent({ className, ...props }: ProductCardContentProps) {
  return (
    <CardContent
      className={cn(
        "flex min-h-12 items-center justify-center p-1.5 transition-colors duration-300 group-hover:bg-muted/30 md:min-h-20 md:p-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * 商品タイル用のCardHeaderコンポーネント
 */
export function ProductCardHeader({ className, ...props }: ProductCardHeaderProps) {
  return (
    <CardHeader className={cn("p-0", className)} {...props} />
  );
}
