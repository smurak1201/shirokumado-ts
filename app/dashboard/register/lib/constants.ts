/** フィルタ変更時のデータ取得デバウンス時間（ms）。短すぎるとAPI過負荷、長すぎるとUX悪化 */
export const FETCH_DEBOUNCE_MS = 300;

/** 曜日ラベル（月曜始まり） */
export const DAY_LABELS_MON_START = ["月", "火", "水", "木", "金", "土", "日"] as const;

/** 表示金額を千円単位に換算する除数 */
export const YEN_TO_K_YEN = 1000;
