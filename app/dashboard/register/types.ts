/** データ種別 */
export type RegisterDataType = "Z001" | "Z002" | "Z004" | "Z005" | "Z009";

/** 期間タイプ */
export type PeriodType = "day" | "week" | "month" | "year" | "custom";

/** 集約粒度 */
export type Granularity = "day" | "week" | "month" | "year";

/** 表示モード */
export type ViewMode = "summary" | "detail";

/** フィルタ条件 */
export interface RegisterFilter {
  type: RegisterDataType;
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  view: ViewMode;
  granularity: Granularity;
  compareLastYear: boolean;
}

/** 第2層タブ定義 */
export const ANALYSIS_TABS = [
  { value: "overview", label: "売上概要" },
  { value: "trend", label: "売上推移" },
  { value: "hourly", label: "時間帯分析" },
  { value: "product", label: "商品分析" },
  { value: "transaction", label: "取引管理" },
  { value: "raw", label: "明細データ" },
] as const;

export type AnalysisTabValue = (typeof ANALYSIS_TABS)[number]["value"];

/** 期間タイプの表示名 */
export const PERIOD_LABELS: Record<PeriodType, string> = {
  day: "日",
  week: "週",
  month: "月",
  year: "年",
  custom: "カスタム",
};

/** 時系列データ1件 */
export interface TimeSeriesEntry {
  period: string;
  totalAmount: number;
  totalQuantity: number;
}

/** 項目別集計データ1件 */
export interface AggregatedEntry {
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
}

/** 統計サマリー（最大・最小・平均） */
export interface PeriodStat {
  period: string;
  value: number;
}

export interface DataSummary {
  totalAmount: number;
  totalQuantity: number;
  recordCount: number;
  avgAmount: number;
  avgQuantity: number;
  maxAmount: PeriodStat;
  minAmount: PeriodStat;
  maxQuantity: PeriodStat;
  minQuantity: PeriodStat;
}

/** データ取得APIレスポンス（合算） */
export interface RegisterDataResponse {
  aggregated: AggregatedEntry[];
  timeSeries: TimeSeriesEntry[];
  summary: DataSummary;
  previousPeriod?: { totalAmount: number; totalQuantity: number };
  lastYearTimeSeries?: TimeSeriesEntry[];
}


/** レジ情報 */
export interface MachineInfo {
  machineNo: string;
  name: string | null;
}

/** レジ一覧APIレスポンス */
export interface MachinesResponse {
  machines: MachineInfo[];
  /** データが存在する最新の日付（YYYY-MM-DD） */
  latestDate: string | null;
}

/** 取り込みサマリー（既存のRegisterImportPageに渡すprops） */
export interface ImportSummary {
  totalFiles: number;
  lastImportedAt: string | null;
}

/** Z009 時間帯別データ1件 */
export interface HourlyEntry {
  startTime: string;
  endTime: string;
  totalQuantity: number;
  totalAmount: number;
}

/** Z009 曜日x時間帯ヒートマップ用データ1件 */
export interface HourlyHeatmapEntry {
  dayOfWeek: number;
  startTime: string;
  totalAmount: number;
  totalQuantity: number;
}

/** Z009 時間帯分析レスポンス */
export interface HourlyAnalysisResponse {
  hourly: HourlyEntry[];
  heatmap: HourlyHeatmapEntry[];
}

/** Z004 商品データ1件 */
export interface ProductEntry {
  itemCode: string;
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
  rank: "A" | "B" | "C";
  cumulativeRatio: number;
}

/** Z004 商品分析レスポンス */
export interface ProductAnalysisResponse {
  products: ProductEntry[];
}

/** Z002 取引キーデータ1件 */
export interface TransactionEntry {
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
}

/** Z002 取引管理レスポンス */
export interface TransactionAnalysisResponse {
  transactions: TransactionEntry[];
  timeSeries: TimeSeriesEntry[];
  correctionCount: number;
  correctionAmount: number;
}

/** 明細データ1件（全種別共通） */
export interface RawDataEntry {
  date: string;
  time: string;
  machineNo: string;
  recordNo: number;
  itemName: string;
  itemCode?: string;
  startTime?: string;
  endTime?: string;
  quantity: number;
  amount: number;
}

/** 明細データレスポンス */
export interface RawDataResponse {
  rows: RawDataEntry[];
}

/** 期間プリセット（比較選択用に最低限の形状） */
export interface ComparePreset {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
}
