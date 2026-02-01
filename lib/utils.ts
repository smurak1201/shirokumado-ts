/**
 * ユーティリティ関数
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名をマージ
 *
 * clsxで条件付きクラス名を展開し、tailwind-mergeでTailwindの競合を解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
