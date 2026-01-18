import { Card as ShadCard, CardContent as ShadCardContent, CardHeader as ShadCardHeader, CardTitle as ShadCardTitle } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type FAQCardProps = ComponentPropsWithoutRef<typeof ShadCard>;
export type FAQCardContentProps = ComponentPropsWithoutRef<typeof ShadCardContent>;
export type FAQCardHeaderProps = ComponentPropsWithoutRef<typeof ShadCardHeader>;
export type FAQCardTitleProps = ComponentPropsWithoutRef<typeof ShadCardTitle>;

/**
 * FAQ用のCardコンポーネント
 *
 * FAQページで使用するカードコンポーネントです。
 * ホバーエフェクトがデフォルトで適用されています。
 */
export function FAQCard({ className, ...props }: FAQCardProps) {
  return (
    <ShadCard
      className={cn(
        "group relative overflow-hidden border-border/60 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
        className
      )}
      {...props}
    />
  );
}

/**
 * FAQ用のCardContentコンポーネント
 */
export function FAQCardContent({ className, ...props }: FAQCardContentProps) {
  return (
    <ShadCardContent className={cn("pt-0", className)} {...props} />
  );
}

/**
 * FAQ用のCardHeaderコンポーネント
 */
export function FAQCardHeader({ className, ...props }: FAQCardHeaderProps) {
  return (
    <ShadCardHeader className={cn("pb-3", className)} {...props} />
  );
}

/**
 * FAQ用のCardTitleコンポーネント
 */
export function FAQCardTitle({ className, ...props }: FAQCardTitleProps) {
  return (
    <ShadCardTitle
      className={cn(
        "flex-1 text-base font-normal leading-relaxed text-foreground transition-colors duration-300 group-hover:text-primary md:text-lg",
        className
      )}
      {...props}
    />
  );
}
