/**
 * 商品関連のユーティリティ関数
 *
 * 日付管理、価格フォーマット、公開状態の判定など
 */

/**
 * 日本時間の現在日時を取得
 *
 * サーバーのタイムゾーンに依存せず、常にJST（UTC+9）を返す
 */
export function getJapanTime(): Date {
  const now = new Date();
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return japanTime;
}

/**
 * 公開日・終了日から公開状態を自動判定
 */
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  const now = getJapanTime();

  if (publishedAt) {
    const publishedDate = new Date(publishedAt);
    if (publishedDate > now) {
      return false;
    }
  }

  if (endedAt) {
    const endedDate = new Date(endedAt);
    if (endedDate < now) {
      return false;
    }
  }

  return true;
}

export function hasDateRange(publishedAt: Date | null, endedAt: Date | null): boolean {
  return publishedAt !== null || endedAt !== null;
}

/**
 * 日付の値を解決（商品更新API用）
 *
 * undefined: 既存値を維持、null: 削除、string: 更新
 */
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  if (requestValue === undefined) {
    return existingValue;
  }

  if (requestValue === null) {
    return null;
  }

  return new Date(requestValue);
}

/**
 * 商品の公開状態を決定
 *
 * 日付範囲が設定されている場合は自動判定を優先、
 * それ以外は手動設定フラグを使用
 */
export function determinePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null,
  manualPublished?: boolean,
  defaultPublished: boolean = true
): boolean {
  if (publishedAt || endedAt) {
    return calculatePublishedStatus(publishedAt, endedAt);
  }

  return manualPublished !== undefined ? manualPublished : defaultPublished;
}

export function formatPriceForInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return numValue.toLocaleString("ja-JP");
}

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return `¥${numValue.toLocaleString("ja-JP")}`;
}

export function parsePrice(value: string): string {
  const cleaned = value.replace(/,/g, "").replace(/[^\d]/g, "");
  return cleaned;
}

/**
 * 数値入力のキーフィルタリング
 *
 * 数字、制御キー、コピー&ペースト操作のみ許可
 */
export function isNumericKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  if (e.key >= "0" && e.key <= "9") {
    return true;
  }
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
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
    return true;
  }
  return false;
}
