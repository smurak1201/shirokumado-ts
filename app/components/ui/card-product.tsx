import { Card as ShadCard, CardContent as ShadCardContent, CardHeader as ShadCardHeader } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ProductCardProps = ComponentPropsWithoutRef<typeof ShadCard>;
export type ProductCardContentProps = ComponentPropsWithoutRef<typeof ShadCardContent>;
export type ProductCardHeaderProps = ComponentPropsWithoutRef<typeof ShadCardHeader>;

/**
 * 商品タイル用のCardコンポーネント
 *
 * 商品一覧で使用するカードコンポーネントです。
 * ホバーエフェクトとフォーカススタイルがデフォルトで適用されています。
 */
export function ProductCard({ className, ...props }: ProductCardProps) {
  return (
    <ShadCard
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
        "hover:border-primary/40 border-border/60",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

/**
 * 商品タイル用のCardContentコンポーネント
 */
export function ProductCardContent({ className, ...props }: ProductCardContentProps) {
  return (
    <ShadCardContent
      className={cn(
        "flex min-h-12 items-center justify-center p-1.5 transition-colors duration-300 group-hover:bg-muted/30 md:min-h-20 md:p-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * 商品タイル用のCardHeaderコンポーネント
 */
export function ProductCardHeader({ className, ...props }: ProductCardHeaderProps) {
  return (
    <ShadCardHeader className={cn("p-0", className)} {...props} />
  );
}
