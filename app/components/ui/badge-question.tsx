/**
 * FAQ質問番号バッジコンポーネント
 *
 * カスタマイズ: 質問番号は識別情報なので太字で目立たせる、
 * shrink-0で常に同じサイズを保つ
 */
import { Badge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type QuestionBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

export function QuestionBadge({ className, ...props }: QuestionBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("mt-0.5 shrink-0 text-xs font-bold md:text-sm", className)}
      {...props}
    />
  );
}
