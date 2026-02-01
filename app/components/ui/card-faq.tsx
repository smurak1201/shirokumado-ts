/**
 * @fileoverview FAQ専用カードコンポーネント
 *
 * ## 概要
 * FAQページで使用する質問カード専用のカスタムコンポーネント
 * 基本のCardコンポーネントをラップし、FAQ専用のスタイルを適用します。
 *
 * ## 主な機能
 * - ホバー時のリフトアップアニメーション（-translate-y-1）
 * - ホバー時のシャドウ強調（shadow-lg）
 * - ホバー時のボーダー色変更（border-primary/30）
 * - スムーズなトランジション（duration-300）
 *
 * ## カスタマイズの理由
 * - FAQ項目をインタラクティブに見せるため、ホバーエフェクトを強化
 * - ユーザーがクリック可能な要素であることを視覚的に示す
 * - group クラスで子要素にもホバー効果を連動（FAQCardTitle の色変更）
 *
 * ## 使用例
 * ```tsx
 * <FAQCard>
 *   <FAQCardHeader>
 *     <FAQCardTitle>よくある質問のタイトル</FAQCardTitle>
 *   </FAQCardHeader>
 *   <FAQCardContent>
 *     回答内容
 *   </FAQCardContent>
 * </FAQCard>
 * ```
 *
 * @see app/components/ui/card.tsx - 基本のCardコンポーネント
 */
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type FAQCardProps = ComponentPropsWithoutRef<typeof Card>;
export type FAQCardContentProps = ComponentPropsWithoutRef<typeof CardContent>;
export type FAQCardHeaderProps = ComponentPropsWithoutRef<typeof CardHeader>;
export type FAQCardTitleProps = ComponentPropsWithoutRef<typeof CardTitle>;

/**
 * FAQ用のCardコンポーネント
 *
 * FAQページで使用するカードコンポーネント。
 * ホバーエフェクト（リフトアップ、シャドウ強調、ボーダー変更）がデフォルトで適用されています。
 *
 * @param {string} [className] - 追加のCSSクラス名
 */
export function FAQCard({ className, ...props }: FAQCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
        className
      )}
      {...props}
    />
  );
}

/**
 * FAQ用のCardContentコンポーネント
 */
export function FAQCardContent({ className, ...props }: FAQCardContentProps) {
  return (
    <CardContent className={cn("pt-0", className)} {...props} />
  );
}

/**
 * FAQ用のCardHeaderコンポーネント
 */
export function FAQCardHeader({ className, ...props }: FAQCardHeaderProps) {
  return (
    <CardHeader className={cn("pb-3", className)} {...props} />
  );
}

/**
 * FAQ用のCardTitleコンポーネント
 */
export function FAQCardTitle({ className, ...props }: FAQCardTitleProps) {
  return (
    <CardTitle
      className={cn(
        "flex-1 text-base font-normal leading-relaxed text-foreground transition-colors duration-300 group-hover:text-primary md:text-lg",
        className
      )}
      {...props}
    />
  );
}
