/** データ種別 */
export type RegisterDataType = "Z001" | "Z002" | "Z004" | "Z005" | "Z009";

/** 期間タイプ */
export type PeriodType = "day" | "week" | "month" | "year" | "custom";

/** 集約粒度 */
export type Granularity = "day" | "week" | "month" | "year";

/** 表示モード */
export type ViewMode = "summary" | "detail";

/** レジグループ化 */
export type GroupBy = "combined" | "machine";

/** フィルタ条件 */
export interface RegisterFilter {
  type: RegisterDataType;
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  view: ViewMode;
  groupBy: GroupBy;
  granularity: Granularity;
  compareLastYear: boolean;
}

/** 第2層タブ定義 */
export const ANALYSIS_TABS = [
  { value: "overview", label: "売上概要" },
  { value: "trend", label: "売上推移" },
  { value: "hourly", label: "時間帯分析" },
  { value: "product", label: "商品分析" },
  { value: "department", label: "部門分析" },
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

/** データ取得APIレスポンス（レジ別） */
export interface RegisterDataByMachineResponse {
  byMachine: Record<string, RegisterDataResponse>;
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
