import { ValidationError } from "@/lib/errors";
import {
  METADATA_LINE_COUNT,
  DATA_START_LINE,
  VALID_FILE_TYPES,
  type CsvMetadata,
  type CsvParseResult,
  type FileType,
  type Z001Row,
  type Z002Row,
  type Z004Row,
  type Z005Row,
  type Z009Row,
} from "./csv-types";

/** Shift_JIS の ArrayBuffer を UTF-8 文字列に変換 */
export function decodeShiftJIS(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder("shift_jis");
  return decoder.decode(buffer);
}

/** ダブルクォートで囲まれたCSV行をパース（金額内のカンマに対応） */
export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

/** 配列から安全に値を取得 */
function at(arr: string[], index: number): string {
  return arr[index] ?? "";
}

/** 金額文字列をパース: "102,510" → 102510 */
function parseAmount(value: string): number {
  return parseInt(value.replace(/,/g, ""), 10) || 0;
}

/** メタデータ（行1-6）を抽出 */
export function parseMetadata(lines: string[]): CsvMetadata {
  if (lines.length < METADATA_LINE_COUNT) {
    throw new ValidationError(
      `メタデータが不足しています（${lines.length}行/${METADATA_LINE_COUNT}行）`
    );
  }

  const getValue = (line: string): string => {
    const parts = parseCsvLine(line);
    return parts.length >= 2 ? at(parts, 1).trim() : "";
  };

  const machineNo = getValue(at(lines, 0));
  const settlementCount = parseInt(getValue(at(lines, 3)), 10);
  const dateStr = getValue(at(lines, 4));
  const time = getValue(at(lines, 5));

  if (isNaN(settlementCount)) {
    throw new ValidationError("精算回数の値が不正です");
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`日付の値が不正です: ${dateStr}`);
  }

  return { machineNo, settlementCount, date, time };
}

/** Z001: 売上明細パース（全28行登録） */
function parseZ001Rows(lines: string[]): Z001Row[] {
  return lines
    .slice(DATA_START_LINE)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = parseCsvLine(line);
      return {
        recordNo: parseInt(at(parts, 0), 10),
        itemName: at(parts, 1).trim(),
        quantity: parseInt(at(parts, 2), 10) || 0,
        amount: parseAmount(at(parts, 3)),
      };
    });
}

/** Z002: 取引キーパース（空白行除外） */
function parseZ002Rows(lines: string[]): Z002Row[] {
  return lines
    .slice(DATA_START_LINE)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = parseCsvLine(line);
      return {
        recordNo: parseInt(at(parts, 0), 10),
        itemName: at(parts, 1).trim(),
        quantity: parseInt(at(parts, 2), 10) || 0,
        amount: parseAmount(at(parts, 3)),
      };
    })
    .filter((row) => row.itemName !== "");
}

/** Z004: 商品売上パース（個数・金額ともに0の行は除外） */
function parseZ004Rows(lines: string[]): Z004Row[] {
  return lines
    .slice(DATA_START_LINE)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = parseCsvLine(line);
      return {
        recordNo: parseInt(at(parts, 0), 10),
        itemCode: at(parts, 1).trim(),
        itemName: at(parts, 2).trim(),
        quantity: parseInt(at(parts, 3), 10) || 0,
        amount: parseAmount(at(parts, 4)),
      };
    })
    .filter((row) => row.quantity !== 0 || row.amount !== 0);
}

/** Z005: 部門売上パース（個数・金額ともに0の行は除外） */
function parseZ005Rows(lines: string[]): Z005Row[] {
  return lines
    .slice(DATA_START_LINE)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = parseCsvLine(line);
      return {
        recordNo: parseInt(at(parts, 0), 10),
        itemName: at(parts, 1).trim(),
        quantity: parseInt(at(parts, 2), 10) || 0,
        amount: parseAmount(at(parts, 3)),
      };
    })
    .filter((row) => row.quantity !== 0 || row.amount !== 0);
}

/** Z009: 時間帯別売上パース（件数・金額ともに0の行は除外） */
function parseZ009Rows(lines: string[]): Z009Row[] {
  return lines
    .slice(DATA_START_LINE)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = parseCsvLine(line);
      return {
        recordNo: parseInt(at(parts, 0), 10),
        startTime: at(parts, 1).trim(),
        endTime: at(parts, 2).trim(),
        quantity: parseInt(at(parts, 3), 10) || 0,
        amount: parseAmount(at(parts, 4)),
      };
    })
    .filter((row) => row.quantity !== 0 || row.amount !== 0);
}

/** ファイル名から種別コードを抽出 */
export function extractFileType(fileName: string): FileType {
  const match = fileName.match(/^Z(\d{3})/);
  if (!match?.[1]) {
    throw new ValidationError(`ファイル名が不正です: ${fileName}`);
  }
  const code = `Z${match[1]}`;
  if (!(VALID_FILE_TYPES as readonly string[]).includes(code)) {
    throw new ValidationError(`対象外の種別コードです: ${code}`);
  }
  return code as FileType;
}

/** CSVファイルをパース */
export function parseCsvFile(
  buffer: ArrayBuffer,
  fileName: string
): CsvParseResult {
  const content = decodeShiftJIS(buffer);
  const lines = content.split(/\r?\n/);
  const metadata = parseMetadata(lines);
  const fileType = extractFileType(fileName);

  let rows: CsvParseResult["rows"];
  switch (fileType) {
    case "Z001":
      rows = parseZ001Rows(lines);
      break;
    case "Z002":
      rows = parseZ002Rows(lines);
      break;
    case "Z004":
      rows = parseZ004Rows(lines);
      break;
    case "Z005":
      rows = parseZ005Rows(lines);
      break;
    case "Z009":
      rows = parseZ009Rows(lines);
      break;
  }

  return { metadata, fileType, rows };
}
