/**
 * @fileoverview インプットコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースの汎用テキスト入力コンポーネント
 * フォーム入力フィールドに一貫したスタイルを提供します。
 *
 * ## 主な機能
 * - レスポンシブなフォントサイズ（モバイル: text-base、デスクトップ: text-sm）
 * - フォーカス時のリングアニメーション
 * - ファイル入力のスタイル対応（file:プレフィックス）
 * - プレースホルダーのスタイル統一
 * - disabled 状態の視覚的フィードバック
 *
 * ## デザイン原則
 * - モバイルファースト: スマートフォンでは16px以上のフォントサイズで
 *   自動ズームを防止（text-base）、デスクトップでは text-sm に切り替え
 *
 * ## 使用例
 * ```tsx
 * <Input type="text" placeholder="名前を入力" />
 * <Input type="email" required />
 * <Input type="file" />
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/input
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * インプットコンポーネント
 *
 * @param {string} [type] - input要素のtype属性（text, email, password, file等）
 * @param {string} [className] - 追加のCSSクラス名
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
