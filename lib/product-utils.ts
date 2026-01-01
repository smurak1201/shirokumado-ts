/**
 * 商品関連のユーティリティ関数
 */

/**
 * 日本時間の現在日時を取得
 */
export function getJapanTime(): Date {
  const now = new Date();
  // 日本時間（UTC+9）に変換
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return japanTime;
}

/**
 * 公開日・終了日から公開情報を自動判定
 * @param publishedAt 公開日（nullの場合は公開日なし）
 * @param endedAt 終了日（nullの場合は終了日なし）
 * @returns 公開情報（true: 公開、false: 非公開）
 */
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  const now = getJapanTime();

  // 公開日が設定されている場合
  if (publishedAt) {
    const publishedDate = new Date(publishedAt);
    // 公開日が未来の場合は非公開
    if (publishedDate > now) {
      return false;
    }
  }

  // 終了日が設定されている場合
  if (endedAt) {
    const endedDate = new Date(endedAt);
    // 終了日が過去の場合は非公開
    if (endedDate < now) {
      return false;
    }
  }

  // 公開日が過去または未設定、かつ終了日が未来または未設定の場合は公開
  return true;
}

/**
 * 公開日・終了日が設定されているかどうかを判定
 * @param publishedAt 公開日
 * @param endedAt 終了日
 * @returns どちらかが設定されている場合はtrue
 */
export function hasDateRange(publishedAt: Date | null, endedAt: Date | null): boolean {
  return publishedAt !== null || endedAt !== null;
}
