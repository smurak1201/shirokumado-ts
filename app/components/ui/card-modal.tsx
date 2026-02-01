/**
 * @fileoverview モーダル専用カードコンポーネント
 *
 * ## 概要
 * 商品詳細モーダル内で使用するカード専用のカスタムコンポーネント
 * 基本のCardコンポーネントをラップし、モーダル内での表示に最適化されたスタイルを適用します。
 *
 * ## 主な機能
 * - 画像表示用カード（ModalImageCard）
 * - コンテンツ表示用カード（ModalContentCard）
 * - 価格表示用カード（ModalPriceCard）- グラデーション背景付き
 * - レスポンシブなパディング調整（モバイル: p-4、デスクトップ: p-6）
 *
 * ## カスタマイズの理由
 * - モーダル内ではボーダーを非表示（border-0）にしてスッキリとした見た目に
 * - 価格表示用カードにグラデーション背景を追加して視覚的に強調
 * - モーダル内での視認性を考慮したシャドウ調整（shadow-lg, shadow-sm）
 *
 * ## 使用例
 * ```tsx
 * <Dialog>
 *   <DialogContent>
 *     <ModalImageCard>
 *       <ModalCardHeader>
 *         <Image src="..." alt="..." />
 *       </ModalCardHeader>
 *     </ModalImageCard>
 *
 *     <ModalContentCard>
 *       <ModalCardContent>
 *         商品説明
 *       </ModalCardContent>
 *     </ModalContentCard>
 *
 *     <ModalPriceCard>
 *       <ModalCardContent>
 *         価格情報
 *       </ModalCardContent>
 *     </ModalPriceCard>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * @see app/components/ui/card.tsx - 基本のCardコンポーネント
 * @see app/components/ProductModal.tsx - 使用例
 */
import { Card, CardContent, CardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ModalCardProps = ComponentPropsWithoutRef<typeof Card>;
export type ModalCardContentProps = ComponentPropsWithoutRef<typeof CardContent>;
export type ModalCardHeaderProps = ComponentPropsWithoutRef<typeof CardHeader>;

/**
 * モーダル内の画像表示用Cardコンポーネント
 *
 * ボーダーなし（border-0）、大きなシャドウ（shadow-lg）で画像を強調表示
 */
export function ModalImageCard({ className, ...props }: ModalCardProps) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-lg", className)} {...props} />
  );
}

/**
 * モーダル内のコンテンツ表示用Cardコンポーネント
 */
export function ModalContentCard({ className, ...props }: ModalCardProps) {
  return (
    <Card className={cn("border-0 shadow-sm", className)} {...props} />
  );
}

/**
 * モーダル内の価格表示用Cardコンポーネント
 */
export function ModalPriceCard({ className, ...props }: ModalCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-sm",
        "bg-linear-to-br from-primary/5 via-background to-primary/5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * モーダル内のCardContentコンポーネント
 */
export function ModalCardContent({ className, ...props }: ModalCardContentProps) {
  return (
    <CardContent className={cn("p-4 md:p-6", className)} {...props} />
  );
}

/**
 * モーダル内のCardHeaderコンポーネント
 */
export function ModalCardHeader({ className, ...props }: ModalCardHeaderProps) {
  return (
    <CardHeader className={cn("p-0", className)} {...props} />
  );
}
