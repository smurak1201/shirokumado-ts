/**
 * @fileoverview スケルトンコンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのローディング状態表示コンポーネント
 * コンテンツ読み込み中のプレースホルダーとして使用します。
 *
 * ## 主な機能
 * - パルスアニメーション（animate-pulse）で読み込み中を表現
 * - 角丸（rounded-md）のグレー背景（bg-muted）
 * - 柔軟なサイズ指定が可能
 *
 * ## デザイン原則
 * - 実際のコンテンツの形状に合わせてスケルトンを配置
 * - ユーザーにコンテンツが読み込まれていることを視覚的に伝える
 *
 * ## 使用例
 * ```tsx
 * // テキスト行のスケルトン
 * <Skeleton className="h-4 w-full" />
 *
 * // 画像のスケルトン
 * <Skeleton className="h-40 w-full" />
 *
 * // カードのスケルトン
 * <Card>
 *   <CardHeader>
 *     <Skeleton className="h-6 w-3/4" />
 *     <Skeleton className="h-4 w-1/2" />
 *   </CardHeader>
 *   <CardContent>
 *     <Skeleton className="h-40 w-full" />
 *   </CardContent>
 * </Card>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/skeleton
 */
import { cn } from "@/lib/utils"

/**
 * スケルトンコンポーネント
 * パルスアニメーションで読み込み中を表現するプレースホルダー
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
