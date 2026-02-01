/**
 * @fileoverview ラベルコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのフォームラベルコンポーネント
 * Radix UI の Label Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - フォーム要素との適切な関連付け（htmlFor属性）
 * - peer-disabled でピア要素の disabled 状態を反映
 * - アクセシビリティ対応（Radix UIによる）
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI Labelを使用してアクセシビリティを向上
 *
 * ## 使用例
 * ```tsx
 * <Label htmlFor="email">メールアドレス</Label>
 * <Input id="email" type="email" />
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/label
 * @see https://www.radix-ui.com/docs/primitives/components/label
 */
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ラベルのスタイルバリアント定義
 * peer-disabled でピア要素が無効化されている場合のスタイルを定義
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
