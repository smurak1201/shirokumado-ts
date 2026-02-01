/**
 * @fileoverview スクロールエリアコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのカスタムスクロールバーコンポーネント
 * Radix UI の ScrollArea Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - カスタムスタイルのスクロールバー
 * - 垂直（vertical）と水平（horizontal）スクロール対応
 * - スムーズなトランジション（transition-colors）
 * - オーバーフロー時のみスクロールバーを表示
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI ScrollArea を使用してクロスブラウザ対応
 * - ネイティブスクロールバーを隠してカスタムスクロールバーを表示
 *
 * ## デザイン原則
 * - スクロールバーは細く（w-2.5, h-2.5）、控えめに
 * - 角丸（rounded-full）でモダンな見た目
 *
 * ## 使用例
 * ```tsx
 * <ScrollArea className="h-72 w-48">
 *   <div className="p-4">
 *     {// 長いコンテンツ}
 *   </div>
 * </ScrollArea>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/scroll-area
 * @see https://www.radix-ui.com/docs/primitives/components/scroll-area
 */
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * スクロールエリアコンポーネント
 * カスタムスクロールバーを持つスクロール可能なコンテナ
 */
const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-px",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-px",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
