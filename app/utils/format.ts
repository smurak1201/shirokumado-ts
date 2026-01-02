/**
 * フォーマット関連のユーティリティ関数
 */

/**
 * 価格をフォーマットして表示用の文字列を返す
 *
 * @param price - 価格（数値）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）
 */
export function formatPrice(price: number): string {
  return `¥${Number(price).toLocaleString()}`;
}
