import { Badge as ShadBadge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type PriceBadgeProps = ComponentPropsWithoutRef<typeof ShadBadge>;

/**
 * 価格表示用のBadgeコンポーネント
 *
 * 商品の価格を表示するためのBadgeラッパーです。
 * デフォルトのスタイルが適用されています。
 */
export function PriceBadge({ className, ...props }: PriceBadgeProps) {
  return (
    <ShadBadge
      variant="secondary"
      className={cn("text-lg font-normal px-5 py-2.5 md:text-xl md:px-6 md:py-3", className)}
      {...props}
    />
  );
}
