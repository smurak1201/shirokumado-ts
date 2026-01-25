import { Card, CardContent, CardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ModalCardProps = ComponentPropsWithoutRef<typeof Card>;
export type ModalCardContentProps = ComponentPropsWithoutRef<typeof CardContent>;
export type ModalCardHeaderProps = ComponentPropsWithoutRef<typeof CardHeader>;

/**
 * モーダル内の画像表示用Cardコンポーネント
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
