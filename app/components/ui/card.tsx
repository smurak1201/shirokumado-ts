/**
 * @fileoverview カードコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのカード型レイアウトコンポーネント
 * コンテンツをグループ化して視覚的に区別するために使用します。
 *
 * ## 主な機能
 * - 角丸（rounded-lg）とシャドウ（shadow-sm）のモダンなデザイン
 * - Header, Title, Description, Content, Footer の構造化されたレイアウト
 * - 柔軟なカスタマイズが可能
 *
 * ## コンポーネント構成
 * - Card: ルートコンテナ
 * - CardHeader: ヘッダー部分（タイトルと説明を含む）
 * - CardTitle: タイトル（text-2xl）
 * - CardDescription: 説明文（text-sm, muted色）
 * - CardContent: メインコンテンツ
 * - CardFooter: フッター（ボタンなどのアクション）
 *
 * ## 使用例
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>タイトル</CardTitle>
 *     <CardDescription>説明文</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     コンテンツ
 *   </CardContent>
 *   <CardFooter>
 *     <Button>アクション</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/card
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * カードコンポーネント（ルートコンテナ）
 * 角丸、ボーダー、シャドウでコンテンツをグループ化
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
