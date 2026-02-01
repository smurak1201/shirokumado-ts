/**
 * @fileoverview FAQ質問番号バッジコンポーネント
 *
 * ## 概要
 * FAQページで質問番号を表示する専用のカスタムバッジコンポーネント
 * 基本のBadgeコンポーネントをラップし、質問番号表示に最適化されたスタイルを適用します。
 *
 * ## 主な機能
 * - secondary バリアントをデフォルトで適用
 * - レスポンシブなフォントサイズ（モバイル: text-xs、デスクトップ: text-sm）
 * - 太字フォント（font-bold）で視認性を向上
 * - shrink-0 で縮小を防止（質問番号は常に全文表示）
 *
 * ## カスタマイズの理由
 * - 質問番号は重要な識別情報なので、太字で目立たせる
 * - 質問テキストが長い場合でも、番号バッジは常に同じサイズを保つ（shrink-0）
 * - mt-0.5 でテキストとの垂直位置を微調整し、視覚的なバランスを改善
 *
 * ## 使用例
 * ```tsx
 * <div className="flex gap-2">
 *   <QuestionBadge>Q1</QuestionBadge>
 *   <p>質問内容がここに入ります</p>
 * </div>
 * ```
 *
 * @see app/components/ui/badge.tsx - 基本のBadgeコンポーネント
 * @see app/faq/page.tsx - 使用例
 */
import { Badge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type QuestionBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

/**
 * 質問番号表示用のBadgeコンポーネント
 *
 * FAQの質問番号を表示するためのBadgeラッパー。
 * secondary バリアント、太字フォント、レスポンシブなフォントサイズがデフォルトで適用されています。
 *
 * @param {string} [className] - 追加のCSSクラス名
 */
export function QuestionBadge({ className, ...props }: QuestionBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("mt-0.5 shrink-0 text-xs font-bold md:text-sm", className)}
      {...props}
    />
  );
}
