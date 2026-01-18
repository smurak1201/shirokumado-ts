import { Card as ShadCard, CardContent as ShadCardContent, CardHeader as ShadCardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ModalCardProps = ComponentPropsWithoutRef<typeof ShadCard>;
export type ModalCardContentProps = ComponentPropsWithoutRef<typeof ShadCardContent>;
export type ModalCardHeaderProps = ComponentPropsWithoutRef<typeof ShadCardHeader>;

/**
 * モーダル内の画像表示用Cardコンポーネント
 */
export function ModalImageCard({ className, ...props }: ModalCardProps) {
  return (
    <ShadCard className={cn("overflow-hidden border-0 shadow-lg", className)} {...props} />
  );
}

/**
 * モーダル内のコンテンツ表示用Cardコンポーネント
 */
export function ModalContentCard({ className, ...props }: ModalCardProps) {
  return (
    <ShadCard className={cn("border-0 shadow-sm", className)} {...props} />
  );
}

/**
 * モーダル内の価格表示用Cardコンポーネント
 */
export function ModalPriceCard({ className, ...props }: ModalCardProps) {
  return (
    <ShadCard className={cn("border-0 shadow-sm bg-muted/30", className)} {...props} />
  );
}

/**
 * モーダル内のCardContentコンポーネント
 */
export function ModalCardContent({ className, ...props }: ModalCardContentProps) {
  return (
    <ShadCardContent className={cn("p-4 md:p-6", className)} {...props} />
  );
}

/**
 * モーダル内のCardHeaderコンポーネント
 */
export function ModalCardHeader({ className, ...props }: ModalCardHeaderProps) {
  return (
    <ShadCardHeader className={cn("p-0", className)} {...props} />
  );
}
