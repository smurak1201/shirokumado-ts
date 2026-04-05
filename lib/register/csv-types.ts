/** 対象種別コード */
export const VALID_FILE_TYPES = ["Z001", "Z002", "Z004", "Z005", "Z009"] as const;
export type FileType = (typeof VALID_FILE_TYPES)[number];

/** ファイル名パターン: Z{種別}_{日}{A?}{区切り}_{連番}.CSV */
export const FILE_NAME_PATTERN = /^Z(\d{3})_(\d{2}A?)[ _]_?(\d{4})\.CSV$/;

/** メタデータ行数 */
export const METADATA_LINE_COUNT = 6;

/** データ開始行（0-indexed: メタデータ6行 + 空行1行 + ヘッダー1行 = 8） */
export const DATA_START_LINE = 8;

/** CSVメタデータ */
export interface CsvMetadata {
  machineNo: string;
  settlementCount: number;
  date: Date;
  time: string;
}

/** Z001: 売上明細行 */
export interface Z001Row {
  recordNo: number;
  itemName: string;
  quantity: number;
  amount: number;
}

/** Z002: 取引キー行 */
export interface Z002Row {
  recordNo: number;
  itemName: string;
  quantity: number;
  amount: number;
}

/** Z004: 商品売上行 */
export interface Z004Row {
  recordNo: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  amount: number;
}

/** Z005: 部門売上行 */
export interface Z005Row {
  recordNo: number;
  itemName: string;
  quantity: number;
  amount: number;
}

/** Z009: 時間帯別売上行 */
export interface Z009Row {
  recordNo: number;
  startTime: string;
  endTime: string;
  quantity: number;
  amount: number;
}

/** パース結果 */
export interface CsvParseResult {
  metadata: CsvMetadata;
  fileType: FileType;
  rows: Z001Row[] | Z002Row[] | Z004Row[] | Z005Row[] | Z009Row[];
}

/** グループ化キーの抽出パターン: Z001_16 _0001.CSV → "16 _0001" */
export const SETTLEMENT_KEY_PATTERN = /^Z\d{3}_(.+)\.CSV$/;

/** ファイル名が対象種別のCSVかどうか判定 */
export function isValidCsvFileName(fileName: string): boolean {
  const match = fileName.match(FILE_NAME_PATTERN);
  if (!match) return false;
  const typeCode = `Z${match[1]}`;
  return (VALID_FILE_TYPES as readonly string[]).includes(typeCode);
}

/** 差分判定APIのレスポンス */
export interface DiffResponse {
  pendingFiles: string[];
  importedCount: number;
  totalCount: number;
}

/** 取り込みAPIのレスポンス */
export interface ImportResponse {
  imported: number;
  skipped: number;
  errors: string[];
}
