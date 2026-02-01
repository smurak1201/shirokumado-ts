/**
 * ユーティリティ関数 (lib/utils.ts)
 *
 * アプリケーション全体で使用する汎用的なヘルパー関数を提供します。
 *
 * 主な機能:
 * - クラス名のマージ（Tailwind CSS の競合解決）
 *
 * 使用箇所:
 * - すべての React コンポーネント（UI コンポーネント、ページコンポーネント）
 * - 動的なクラス名を生成する場面
 *
 * ベストプラクティス:
 * - Tailwind CSS のクラス名を動的に生成する場合は cn() を使用
 * - 条件付きクラス名の適用に便利（例: `cn("base", { "active": isActive })`）
 *
 * 技術的な詳細:
 * - clsx: 条件付きクラス名の生成（オブジェクト、配列をサポート）
 * - tailwind-merge: Tailwind CSS のクラス名の競合を解決（後から指定したクラスが優先）
 *
 * @see https://github.com/lukeed/clsx
 * @see https://github.com/dcastil/tailwind-merge
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名をマージするユーティリティ関数
 *
 * shadcn/ui コンポーネントや一般的な React コンポーネントで使用するクラス名のマージ関数です。
 * clsx と tailwind-merge を組み合わせて、Tailwind CSS のクラス名を適切にマージします。
 *
 * @param inputs マージするクラス名（文字列、オブジェクト、配列、null、undefined など）
 * @returns マージされたクラス名の文字列
 *
 * 主な用途:
 * 1. **Tailwind CSS の競合解決**: 同じプロパティ（padding, margin など）のクラスが複数ある場合、後から指定したものを優先
 * 2. **条件付きクラス名**: オブジェクトや配列を使って動的にクラスを適用
 * 3. **コンポーネントのバリエーション**: props に応じて異なるスタイルを適用
 *
 * 使用例:
 * ```tsx
 * // 1. Tailwind CSS の競合解決
 * cn("px-2 py-1", "px-4")
 * // → "py-1 px-4" (px-2 が px-4 で上書きされる)
 *
 * // 2. 条件付きクラス名（オブジェクト形式）
 * cn("btn", {
 *   "bg-blue-500": isPrimary,
 *   "bg-gray-500": !isPrimary,
 *   "opacity-50": isDisabled
 * })
 * // isPrimary=true, isDisabled=false の場合
 * // → "btn bg-blue-500"
 *
 * // 3. 複数のクラス名を結合
 * cn("text-sm", className) // className は親から渡された追加クラス
 * // → "text-sm [親から渡されたクラス]"
 *
 * // 4. 配列形式
 * cn(["flex", "items-center"], isActive && "bg-blue-500")
 * // isActive=true の場合
 * // → "flex items-center bg-blue-500"
 *
 * // 5. コンポーネントでの実用例
 * function Button({ variant, className, ...props }) {
 *   return (
 *     <button
 *       className={cn(
 *         "px-4 py-2 rounded", // 基本スタイル
 *         {
 *           "bg-blue-500 text-white": variant === "primary",
 *           "bg-gray-200 text-black": variant === "secondary",
 *         },
 *         className // 親から渡された追加クラス
 *       )}
 *       {...props}
 *     />
 *   );
 * }
 * ```
 *
 * 処理の流れ:
 * 1. **clsx**: 条件付きクラス名を展開し、有効なクラスのみを抽出
 *    - 例: `{ "bg-red-500": true, "text-white": false }` → `"bg-red-500"`
 * 2. **twMerge**: Tailwind CSS の競合を解決し、後から指定したクラスを優先
 *    - 例: `"px-2 px-4"` → `"px-4"`
 *
 * 実装の理由:
 * - **clsx のみでは不十分**: `cn("px-2", "px-4")` が `"px-2 px-4"` になり、両方適用されてしまう
 * - **tailwind-merge のみでは不十分**: 条件付きクラス名（オブジェクト、配列）に対応していない
 * - 両方を組み合わせることで、柔軟かつ正確なクラス名マージが可能
 *
 * トレードオフ:
 * - 利点: Tailwind CSS のクラス名を安全にマージできる、条件付きクラスに対応
 * - 欠点: 実行時のオーバーヘッドがわずかにある（ただし、ほとんどのケースで無視できる）
 *
 * 注意点:
 * - 動的に生成されるクラス名（例: `bg-${color}-500`）は Tailwind CSS の JIT に含まれない
 * - クラス名は常に完全な形で記述すること（例: `bg-blue-500` は OK、`bg-${color}-500` は NG）
 *
 * @see https://github.com/lukeed/clsx - clsx のドキュメント
 * @see https://github.com/dcastil/tailwind-merge - tailwind-merge のドキュメント
 */
export function cn(...inputs: ClassValue[]) {
  // clsx で条件付きクラス名を展開し、twMerge で Tailwind CSS の競合を解決
  return twMerge(clsx(inputs));
}
