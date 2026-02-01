/**
 * @fileoverview アコーディオンコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースの折りたたみ可能なコンテンツコンポーネント
 * Radix UI の Accordion Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - クリックで展開/折りたたみ
 * - 複数項目の同時展開または単一展開（type="single" or "multiple"）
 * - アニメーション付きの展開/折りたたみ（accordion-up/down）
 * - アクセシビリティ対応（キーボード操作、スクリーンリーダー対応）
 *
 * ## カスタマイズ内容
 * - active:scale-95 でクリック時の視覚的フィードバックを追加
 * - hover:underline でホバー時に下線を表示
 * - ChevronDown アイコンが開閉状態で回転（rotate-180）
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI Accordion を使用してアクセシビリティを向上
 * - カスタムアニメーション（accordion-up/down）を tailwind.config.ts で定義
 *
 * ## 使用例
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>質問1</AccordionTrigger>
 *     <AccordionContent>
 *       回答1
 *     </AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger>質問2</AccordionTrigger>
 *     <AccordionContent>
 *       回答2
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/accordion
 * @see https://www.radix-ui.com/docs/primitives/components/accordion
 */
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// Radix UI Accordion Primitive のラッパーをエクスポート
const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline cursor-pointer active:scale-95 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
