import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名をマージするユーティリティ関数
 *
 * shadcn/uiコンポーネントで使用するクラス名のマージ関数です。
 * clsxとtailwind-mergeを組み合わせて、Tailwind CSSのクラス名を適切にマージします。
 *
 * @param inputs - マージするクラス名（文字列、オブジェクト、配列など）
 * @returns マージされたクラス名の文字列
 *
 * @example
 * ```tsx
 * cn("px-2 py-1", "px-4") // "py-1 px-4" (px-2がpx-4で上書きされる)
 * cn({ "bg-red-500": true, "text-white": false }) // "bg-red-500"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
