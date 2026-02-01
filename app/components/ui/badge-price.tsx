/**
 * 商品価格バッジコンポーネント
 *
 * カスタマイズ: 価格は重要な情報なので大きめのサイズ、
 * font-normalで数字を読みやすく表示
 */
import { Badge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type PriceBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

export function PriceBadge({ className, ...props }: PriceBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("text-lg font-normal px-5 py-2.5 md:text-xl md:px-6 md:py-3", className)}
      {...props}
    />
  );
}
