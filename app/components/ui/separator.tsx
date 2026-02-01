/**
 * @fileoverview セパレーターコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースの区切り線コンポーネント
 * Radix UI の Separator Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - 水平（horizontal）と垂直（vertical）の区切り線
 * - アクセシビリティ対応（decorative属性でセマンティック意味を制御）
 * - 1px の細い線（bg-border）
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI Separator を使用してアクセシビリティを向上
 * - decorative=true の場合、スクリーンリーダーから隠される（視覚的装飾のみ）
 *
 * ## 使用例
 * ```tsx
 * <Separator />  // 水平線（デフォルト）
 * <Separator orientation="vertical" />  // 垂直線
 * <Separator decorative={false} />  // セマンティックな区切り
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/separator
 * @see https://www.radix-ui.com/docs/primitives/components/separator
 */
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * セパレーターコンポーネント
 *
 * @param {string} [orientation="horizontal"] - 向き（horizontal: 水平、vertical: 垂直）
 * @param {boolean} [decorative=true] - 装飾目的かどうか（true: スクリーンリーダーから隠す）
 */
const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
