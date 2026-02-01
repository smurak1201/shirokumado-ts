/**
 * モーダル専用カードコンポーネント
 *
 * カスタマイズ: モーダル内ではborder-0でスッキリと、
 * 価格カードにはグラデーション背景で視覚的に強調
 */
import { Card, CardContent, CardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ModalCardProps = ComponentPropsWithoutRef<typeof Card>;
export type ModalCardContentProps = ComponentPropsWithoutRef<typeof CardContent>;
export type ModalCardHeaderProps = ComponentPropsWithoutRef<typeof CardHeader>;

export function ModalImageCard({ className, ...props }: ModalCardProps) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-lg", className)} {...props} />
  );
}

export function ModalContentCard({ className, ...props }: ModalCardProps) {
  return (
    <Card className={cn("border-0 shadow-sm", className)} {...props} />
  );
}

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

export function ModalCardContent({ className, ...props }: ModalCardContentProps) {
  return (
    <CardContent className={cn("p-4 md:p-6", className)} {...props} />
  );
}

export function ModalCardHeader({ className, ...props }: ModalCardHeaderProps) {
  return (
    <CardHeader className={cn("p-0", className)} {...props} />
  );
}
