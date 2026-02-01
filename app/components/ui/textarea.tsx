/**
 * @fileoverview テキストエリアコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースの複数行テキスト入力コンポーネント
 * フォームの複数行入力フィールドに一貫したスタイルを提供します。
 *
 * ## 主な機能
 * - 最小高さ 80px の自動リサイズ可能なテキストエリア
 * - レスポンシブなフォントサイズ（モバイル: text-base、デスクトップ: text-sm）
 * - フォーカス時のリングアニメーション
 * - プレースホルダーのスタイル統一
 * - disabled 状態の視覚的フィードバック
 *
 * ## デザイン原則
 * - Input コンポーネントと同様のスタイルで統一感を維持
 * - モバイルファースト: スマートフォンでは自動ズーム防止のため text-base を使用
 *
 * ## 使用例
 * ```tsx
 * <Textarea placeholder="お問い合わせ内容を入力してください" />
 * <Textarea rows={5} />
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/textarea
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * テキストエリアコンポーネント
 *
 * @param {string} [className] - 追加のCSSクラス名
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
