/**
 * @fileoverview タブコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのタブ切り替えコンポーネント
 * Radix UI の Tabs Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - 複数のコンテンツを切り替え表示
 * - アクセシビリティ対応（キーボード操作、スクリーンリーダー対応）
 * - アクティブタブの視覚的フィードバック（背景色、シャドウ）
 * - スムーズなトランジション
 *
 * ## カスタマイズ内容
 * - active:scale-95 でクリック時の視覚的フィードバックを追加
 * - transition-all でスムーズなアニメーション
 *
 * ## コンポーネント構成
 * - Tabs: ルートコンテナ
 * - TabsList: タブボタンのリスト（bg-muted）
 * - TabsTrigger: 個別のタブボタン（アクティブ時: bg-background + shadow-sm）
 * - TabsContent: 各タブのコンテンツ
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI Tabs を使用してアクセシビリティを向上
 *
 * ## 使用例
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">タブ1</TabsTrigger>
 *     <TabsTrigger value="tab2">タブ2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">コンテンツ1</TabsContent>
 *   <TabsContent value="tab2">コンテンツ2</TabsContent>
 * </Tabs>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/tabs
 * @see https://www.radix-ui.com/docs/primitives/components/tabs
 */
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// Radix UI Tabs Primitive のラッパーをエクスポート
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
