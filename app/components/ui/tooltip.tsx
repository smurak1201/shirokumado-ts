/**
 * @fileoverview ツールチップコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのツールチップ（ホバー時の説明表示）コンポーネント
 * Radix UI の Tooltip Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - ホバー時に補足情報を表示
 * - アニメーション付きの表示/非表示（fade, zoom, slide）
 * - 4方向への配置（top, bottom, left, right）
 * - アクセシビリティ対応（キーボード操作、スクリーンリーダー対応）
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI Tooltip を使用してアクセシビリティを向上
 * - TooltipProvider でツールチップの表示タイミングを制御
 *
 * ## 使用例
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="outline">ホバーしてください</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       <p>補足情報がここに表示されます</p>
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/tooltip
 * @see https://www.radix-ui.com/docs/primitives/components/tooltip
 */
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Radix UI Tooltip Primitive のラッパーをエクスポート
const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
