import { Badge } from "./badge";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type QuestionBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

/**
 * 質問番号表示用のBadgeコンポーネント
 *
 * FAQの質問番号を表示するためのBadgeラッパーです。
 * デフォルトのスタイルが適用されています。
 */
export function QuestionBadge({ className, ...props }: QuestionBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("mt-0.5 shrink-0 text-xs font-bold md:text-sm", className)}
      {...props}
    />
  );
}
