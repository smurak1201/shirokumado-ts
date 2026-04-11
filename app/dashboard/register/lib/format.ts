import { YEN_TO_K_YEN } from "./constants";

/** 金額を日本円表記にフォーマット（例: 1234 → "1,234円"） */
export function formatJpy(value: number | string): string {
  return `${Number(value).toLocaleString("ja-JP")}円`;
}

/** Y軸用: 金額を千円単位に換算（例: 1234000 → "1234千円"） */
export function formatJpyAxis(value: number): string {
  return `${(value / YEN_TO_K_YEN).toFixed(0)}千円`;
}

/** 人数を日本語フォーマット（例: 1234 → "1,234人"） */
export function formatPersons(value: number | string): string {
  return `${Number(value).toLocaleString("ja-JP")}人`;
}

/**
 * 時系列X軸ラベルを短縮表示
 * - YYYY-MM-DD → MM/DD
 * - YYYY-MM → M月
 * - それ以外（年など）はそのまま返す
 */
export function formatPeriodShortLabel(period: string): string {
  if (period.length === 10) {
    return `${period.slice(5, 7)}/${period.slice(8, 10)}`;
  }
  if (period.length === 7) {
    return `${parseInt(period.slice(5, 7), 10)}月`;
  }
  return period;
}
