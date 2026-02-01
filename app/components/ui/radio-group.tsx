/**
 * @fileoverview ラジオグループコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのラジオボタングループコンポーネント
 * Radix UI の RadioGroup Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - 単一選択のフォーム入力
 * - アクセシビリティ対応（キーボード操作、スクリーンリーダー対応）
 * - フォーカス時のリングアニメーション
 * - 選択済みアイテムの円形インジケーター表示
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI RadioGroup を使用してアクセシビリティを向上
 * - grid レイアウトで自動的に縦並び（gap-2）
 *
 * ## 使用例
 * ```tsx
 * <RadioGroup defaultValue="option1">
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option1" id="option1" />
 *     <Label htmlFor="option1">オプション1</Label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option2" id="option2" />
 *     <Label htmlFor="option2">オプション2</Label>
 *   </div>
 * </RadioGroup>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/radio-group
 * @see https://www.radix-ui.com/docs/primitives/components/radio-group
 */
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * ラジオグループコンポーネント
 * 複数のラジオボタンをグループ化し、単一選択を可能にする
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
