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

/**
 * 数値をカンマ区切りの文字列に変換
 * @param value 数値または数値文字列
 * @returns カンマ区切りの文字列（空の場合は空文字列）
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return numValue.toLocaleString("ja-JP");
}

/**
 * カンマ区切りの文字列を数値に変換
 * @param value カンマ区切りの文字列
 * @returns 数値文字列（空の場合は空文字列）
 */
export function parsePrice(value: string): string {
  // カンマを除去して数字のみを抽出（小数点は除外）
  const cleaned = value.replace(/,/g, "").replace(/[^\d]/g, "");
  return cleaned;
}

/**
 * キー入力が数字かどうかを判定
 * @param e キーボードイベント
 * @returns 数字または許可された制御キーの場合はtrue
 */
export function isNumericKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  // 数字キー（0-9）
  if (e.key >= "0" && e.key <= "9") {
    return true;
  }
  // 許可する制御キー
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(e.key)) {
    return true;
  }
  // Ctrl/Cmd + A, C, V, X などのコピー&ペースト操作
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
    return true;
  }
  return false;
}
