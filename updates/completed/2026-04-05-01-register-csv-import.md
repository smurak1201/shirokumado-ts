# レジCSVデータ取り込み機能

**日付**: 2026-04-05
**ブランチ**: feature/register-csv-import
**対象**: ダッシュボード レジデータページ、CSV取り込みAPI
**ステータス**: 完了
**完了日**: 2026-04-05

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: 型定義・定数の作成](#タスク1-型定義定数の作成)
  - [タスク2: CSVパーサーの作成](#タスク2-csvパーサーの作成)
  - [タスク3: 差分判定APIの作成](#タスク3-差分判定apiの作成)
  - [タスク4: CSV取り込みAPIの作成](#タスク4-csv取り込みapiの作成)
  - [タスク5: フォルダ選択UIの作成](#タスク5-フォルダ選択uiの作成)
  - [タスク6: 取り込み進捗UIの作成](#タスク6-取り込み進捗uiの作成)
  - [タスク7: レジデータページの作成](#タスク7-レジデータページの作成)
  - [タスク8: ダッシュボードヘッダーにタブ追加](#タスク8-ダッシュボードヘッダーにタブ追加)
  - [タスク9: 動作確認・ビルドテスト](#タスク9-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                         | 対応課題 | 優先度 | ステータス | 備考                 |
| --- | ------------------------------ | :------: | :----: | :--------: | -------------------- |
| 1   | 型定義・定数の作成             |    1     |   高   |    [o]     |                      |
| 2   | CSVパーサーの作成              |    1     |   高   |    [o]     |                      |
| 3   | 差分判定APIの作成              |    2     |   高   |    [o]     |                      |
| 4   | CSV取り込みAPIの作成           |   1,2    |   高   |    [o]     |                      |
| 5   | フォルダ選択UIの作成           |    3     |   高   |    [o]     |                      |
| 6   | 取り込み進捗UIの作成           |    3     |   高   |    [o]     | タスク5と並列実行可能 |
| 7   | レジデータページの作成         |   2,3    |   高   |    [o]     |                      |
| 8   | ダッシュボードヘッダーにタブ追加 |    -     |   中   |    [o]     |                      |
| 9   | 動作確認・ビルドテスト         |    -     |   -    |    [o]     |                      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

## 改修の目的

### 背景

CASIOレジ（SR500/550/4000）のSDカードに保存されるCSVデータを、アプリのDBに取り込む機能が必要。
店舗オーナーがWeb画面からフォルダを選択するだけで、差分のみを自動的に取り込めるようにする。

### 課題

- **課題1**: レジのCSVデータがSDカードに蓄積されるだけで、分析・閲覧ができない
- **課題2**: CSVファイルはShift_JISエンコーディングで、手動での取り込みは困難
- **課題3**: 毎回全ファイルをアップロードすると時間がかかる

### 設計方針

- **方針1**: 差分判定方式を採用。ファイル名一覧を先に送信し、未取り込みファイルのみアップロードする
- **方針2**: CSVパーサーをAPIから分離し、将来のレジ機種変更時にパーサーのみ差し替え可能にする
- **方針3**: 同一精算のファイル（同じ日付+連番の5種別）をグループ化し、トランザクションで一括登録する

## タスク詳細

### タスク1: 型定義・定数の作成

**対象ファイル**:

- `lib/register/csv-types.ts`（**新規作成**）

**問題点**:

CSV取り込みで使用する型・定数が未定義。

**修正内容**:

CSVファイルの種別コード、ファイル名パターン、パース結果の型を定義する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// lib/register/csv-types.ts（新規作成）

/** 対象種別コード */
export const VALID_FILE_TYPES = ["Z001", "Z002", "Z004", "Z005", "Z009"] as const;
export type FileType = (typeof VALID_FILE_TYPES)[number];

/** ファイル名パターン: Z{種別}_{日}{A?} _{連番}.CSV */
export const FILE_NAME_PATTERN = /^Z(\d{3})_(\d{2}A?) _(\d{4})\.CSV$/;

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
```

</details>

### タスク2: CSVパーサーの作成

**対象ファイル**:

- `lib/register/csv-parser.ts`（**新規作成**）

**問題点**:

Shift_JISエンコーディングのCSVをパースする処理が存在しない。

**修正内容**:

Shift_JIS→UTF-8変換、メタデータ抽出、種別ごとのデータ行パース、除外条件の適用を行うパーサーを作成する。

CSVの注意点:
- 全フィールドがダブルクォートで囲まれている
- 金額にカンマが含まれる（例: `"102,510"` → 102510）
- キャラクターフィールドに末尾スペースが含まれる（`"総売        "` → `"総売"`）
- メタデータ行は `"ラベル","値"` 形式

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// lib/register/csv-parser.ts（新規作成）

import { ValidationError } from "@/lib/errors";
import {
  METADATA_LINE_COUNT,
  DATA_START_LINE,
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
    return parts.length >= 2 ? parts[1].trim() : "";
  };

  const machineNo = getValue(lines[0]);
  const settlementCount = parseInt(getValue(lines[3]), 10);
  const dateStr = getValue(lines[4]);
  const time = getValue(lines[5]);

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
  return lines.slice(DATA_START_LINE).filter((line) => line.trim() !== "").map((line) => {
    const parts = parseCsvLine(line);
    return {
      recordNo: parseInt(parts[0], 10),
      itemName: parts[1].trim(),
      quantity: parseInt(parts[2], 10) || 0,
      amount: parseAmount(parts[3]),
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
        recordNo: parseInt(parts[0], 10),
        itemName: parts[1].trim(),
        quantity: parseInt(parts[2], 10) || 0,
        amount: parseAmount(parts[3]),
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
        recordNo: parseInt(parts[0], 10),
        itemCode: parts[1].trim(),
        itemName: parts[2].trim(),
        quantity: parseInt(parts[3], 10) || 0,
        amount: parseAmount(parts[4]),
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
        recordNo: parseInt(parts[0], 10),
        itemName: parts[1].trim(),
        quantity: parseInt(parts[2], 10) || 0,
        amount: parseAmount(parts[3]),
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
        recordNo: parseInt(parts[0], 10),
        startTime: parts[1].trim(),
        endTime: parts[2].trim(),
        quantity: parseInt(parts[3], 10) || 0,
        amount: parseAmount(parts[4]),
      };
    })
    .filter((row) => row.quantity !== 0 || row.amount !== 0);
}

/** ファイル名から種別コードを抽出 */
export function extractFileType(fileName: string): FileType {
  const match = fileName.match(/^Z(\d{3})/);
  if (!match) {
    throw new ValidationError(`ファイル名が不正です: ${fileName}`);
  }
  const code = `Z${match[1]}` as FileType;
  return code;
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
```

</details>

### タスク3: 差分判定APIの作成

**対象ファイル**:

- `app/api/register/diff/route.ts`（**新規作成**）

**問題点**:

差分判定を行うAPIが存在しない。

**修正内容**:

ファイル名一覧を受け取り、`RegisterImportFile` テーブルと照合して未取り込みファイル名を返すAPIを作成する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/api/register/diff/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { VALID_FILE_TYPES, FILE_NAME_PATTERN } from "@/lib/register/csv-types";
import type { DiffResponse } from "@/lib/register/csv-types";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const fileNames: string[] = body.fileNames;

  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    throw new ValidationError("ファイル名の一覧が必要です");
  }

  // 対象種別のCSVファイルのみフィルタ
  const validFileNames = fileNames.filter((name) => {
    const match = name.match(FILE_NAME_PATTERN);
    if (!match) return false;
    const typeCode = `Z${match[1]}`;
    return (VALID_FILE_TYPES as readonly string[]).includes(typeCode);
  });

  // 取り込み済みファイル名を取得
  const importedFiles = await safePrismaOperation(
    () =>
      prisma.registerImportFile.findMany({
        where: { fileName: { in: validFileNames } },
        select: { fileName: true },
      }),
    "register/diff"
  );

  const importedSet = new Set(importedFiles.map((f) => f.fileName));
  const pendingFiles = validFileNames.filter(
    (name) => !importedSet.has(name)
  );

  const response: DiffResponse = {
    pendingFiles,
    importedCount: importedSet.size,
    totalCount: validFileNames.length,
  };

  return apiSuccess(response);
});
```

</details>

### タスク4: CSV取り込みAPIの作成

**対象ファイル**:

- `app/api/register/import/route.ts`（**新規作成**）

**問題点**:

CSVファイルをパースしてDBに登録するAPIが存在しない。

**修正内容**:

FormDataで受け取ったCSVファイルをパースし、トランザクション内で精算ヘッダーのupsert→種別データのcreateMany→ファイル管理の登録を行うAPIを作成する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/api/register/import/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { parseCsvFile } from "@/lib/register/csv-parser";
import { FILE_NAME_PATTERN, VALID_FILE_TYPES } from "@/lib/register/csv-types";
import type {
  ImportResponse,
  Z001Row,
  Z002Row,
  Z004Row,
  Z005Row,
  Z009Row,
} from "@/lib/register/csv-types";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    throw new ValidationError("ファイルが指定されていません");
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of files) {
    // ファイル名バリデーション
    const match = file.name.match(FILE_NAME_PATTERN);
    if (!match) {
      errors.push(`ファイル名が不正です: ${file.name}`);
      continue;
    }
    const typeCode = `Z${match[1]}`;
    if (!(VALID_FILE_TYPES as readonly string[]).includes(typeCode)) {
      skipped++;
      continue;
    }

    try {
      const buffer = await file.arrayBuffer();
      const result = parseCsvFile(buffer, file.name);
      const { metadata, fileType, rows } = result;

      await safePrismaOperation(async () => {
        await prisma.$transaction(async (tx) => {
          // 精算ヘッダーの upsert
          const settlement = await tx.registerSettlement.upsert({
            where: {
              machineNo_settlementCount_date_time: {
                machineNo: metadata.machineNo,
                settlementCount: metadata.settlementCount,
                date: metadata.date,
                time: metadata.time,
              },
            },
            create: {
              machineNo: metadata.machineNo,
              settlementCount: metadata.settlementCount,
              date: metadata.date,
              time: metadata.time,
            },
            update: {},
          });

          // 種別に応じたデータ登録
          switch (fileType) {
            case "Z001":
              await tx.registerSalesSummary.createMany({
                data: (rows as Z001Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z002":
              await tx.registerTransactionKey.createMany({
                data: (rows as Z002Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z004":
              await tx.registerProductSale.createMany({
                data: (rows as Z004Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z005":
              await tx.registerDepartmentSale.createMany({
                data: (rows as Z005Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z009":
              await tx.registerHourlySale.createMany({
                data: (rows as Z009Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
          }

          // ファイル管理テーブルに登録
          await tx.registerImportFile.create({
            data: {
              fileName: file.name,
              fileType,
              settlementId: settlement.id,
            },
          });
        });
      }, `register/import - ${file.name}`);

      imported++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラー";
      errors.push(`${file.name}: ${message}`);
      log.error(`CSV取り込みエラー: ${file.name}`, {
        context: "register/import",
        error,
      });
    }
  }

  const response: ImportResponse = { imported, skipped, errors };
  return apiSuccess(response);
});
```

</details>

### タスク5: フォルダ選択UIの作成

**対象ファイル**:

- `app/dashboard/register/components/FolderSelector.tsx`（**新規作成**）

**問題点**:

フォルダ選択のUIが存在しない。

**修正内容**:

`webkitdirectory` 属性を使用したフォルダ選択UIを作成する。選択されたファイルからCSVファイルのみフィルタし、対象ファイル数を表示する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/FolderSelector.tsx（新規作成）
"use client";

import { useRef } from "react";
import { FILE_NAME_PATTERN, VALID_FILE_TYPES } from "@/lib/register/csv-types";

interface FolderSelectorProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

/** 対象CSVファイルのみフィルタ */
function filterCsvFiles(fileList: FileList): File[] {
  const files: File[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const fileName = file.name;
    const match = fileName.match(FILE_NAME_PATTERN);
    if (!match) continue;

    const typeCode = `Z${match[1]}`;
    if ((VALID_FILE_TYPES as readonly string[]).includes(typeCode)) {
      files.push(file);
    }
  }

  return files;
}

export default function FolderSelector({
  onFilesSelected,
  disabled,
}: FolderSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const csvFiles = filterCsvFiles(fileList);
    onFilesSelected(csvFiles);

    // 同じフォルダを再選択できるようにリセット
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        // @ts-expect-error webkitdirectory は標準属性ではないが主要ブラウザで対応
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50 cursor-pointer active:scale-95"
      >
        XZ_BKUPフォルダを選択
      </button>
    </div>
  );
}
```

</details>

### タスク6: 取り込み進捗UIの作成

**対象ファイル**:

- `app/dashboard/register/components/ImportProgress.tsx`（**新規作成**）

**問題点**:

取り込み進捗を表示するUIが存在しない。

**修正内容**:

プログレスバーと処理状況（成功/エラー件数）を表示するコンポーネントを作成する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/ImportProgress.tsx（新規作成）
"use client";

interface ImportProgressProps {
  current: number;
  total: number;
  errors: string[];
}

export default function ImportProgress({
  current,
  total,
  errors,
}: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          取り込み中... {current} / {total} ファイル
        </span>
        <span>{percentage}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gray-900 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-1 text-sm font-medium text-red-800">
            エラー ({errors.length}件)
          </p>
          <ul className="space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-xs text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

</details>

### タスク7: レジデータページの作成

**対象ファイル**:

- `app/dashboard/register/page.tsx`（**新規作成**）
- `app/dashboard/register/components/RegisterImportPage.tsx`（**新規作成**）

**問題点**:

レジデータの取り込みページが存在しない。

**修正内容**:

Server Componentでサマリー情報を取得し、Client Componentでフォルダ選択→差分チェック→アップロード→完了のフローを実装する。

<details>
<summary>page.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/page.tsx（新規作成）

import type { Metadata } from "next";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import RegisterImportPage from "./components/RegisterImportPage";

export const metadata: Metadata = {
  title: "レジデータ",
  description: "レジのCSVデータをDBに取り込む管理画面",
};

export const dynamic = "force-dynamic";

async function getImportSummary(): Promise<{
  totalFiles: number;
  lastImportedAt: string | null;
}> {
  try {
    const result = await safePrismaOperation(
      () =>
        prisma.registerImportFile.aggregate({
          _count: { _all: true },
          _max: { importedAt: true },
        }),
      "register page summary"
    );

    return {
      totalFiles: result._count._all,
      lastImportedAt: result._max.importedAt?.toISOString() ?? null,
    };
  } catch (error) {
    log.error("取り込みサマリーの取得に失敗しました", {
      context: "getImportSummary",
      error,
    });
    return { totalFiles: 0, lastImportedAt: null };
  }
}

export default async function RegisterPage() {
  const summary = await getImportSummary();

  return <RegisterImportPage initialSummary={summary} />;
}
```

</details>

<details>
<summary>RegisterImportPage.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/RegisterImportPage.tsx（新規作成）
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { DiffResponse, ImportResponse } from "@/lib/register/csv-types";
import FolderSelector from "./FolderSelector";
import ImportProgress from "./ImportProgress";

type ImportState = "idle" | "checking" | "uploading" | "done";

interface RegisterImportPageProps {
  initialSummary: {
    totalFiles: number;
    lastImportedAt: string | null;
  };
}

/** 同一精算のファイルをグループ化（日付+連番部分でグループ化） */
function groupFilesBySettlement(files: File[]): Map<string, File[]> {
  const groups = new Map<string, File[]>();

  for (const file of files) {
    // Z001_16 _0001.CSV → "16 _0001"
    const match = file.name.match(/^Z\d{3}_(.+)\.CSV$/);
    const key = match ? match[1] : file.name;

    const group = groups.get(key) ?? [];
    group.push(file);
    groups.set(key, group);
  }

  return groups;
}

export default function RegisterImportPage({
  initialSummary,
}: RegisterImportPageProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState(initialSummary);

  /** フォルダ選択後の処理 */
  async function handleFilesSelected(files: File[]) {
    if (files.length === 0) {
      toast.error("対象のCSVファイルが見つかりませんでした");
      return;
    }

    setAllFiles(files);
    setState("checking");
    setErrors([]);

    try {
      // 差分判定
      const fileNames = files.map((f) => f.name);
      const diff = await fetchJson<DiffResponse>("/api/register/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileNames }),
      });

      if (diff.pendingFiles.length === 0) {
        toast.info("すべてのファイルが取り込み済みです");
        setState("idle");
        return;
      }

      // 未取り込みファイルのみ抽出
      const pendingSet = new Set(diff.pendingFiles);
      const filesToUpload = files.filter((f) => pendingSet.has(f.name));
      setPendingFiles(filesToUpload);

      // アップロード開始
      await handleUpload(filesToUpload);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      setState("idle");
    }
  }

  /** ファイルアップロード処理 */
  async function handleUpload(files: File[]) {
    setState("uploading");
    const groups = groupFilesBySettlement(files);
    const totalGroups = groups.size;
    let currentGroup = 0;
    let totalImported = 0;
    const allErrors: string[] = [];

    setProgress({ current: 0, total: totalGroups });

    for (const [, groupFiles] of groups) {
      currentGroup++;
      setProgress({ current: currentGroup, total: totalGroups });

      try {
        const formData = new FormData();
        for (const file of groupFiles) {
          formData.append("files", file);
        }

        const result = await fetchJson<ImportResponse>(
          "/api/register/import",
          {
            method: "POST",
            body: formData,
          }
        );

        totalImported += result.imported;
        if (result.errors.length > 0) {
          allErrors.push(...result.errors);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "不明なエラー";
        allErrors.push(message);
      }
    }

    setErrors(allErrors);
    setState("done");

    if (totalImported > 0) {
      toast.success(`${totalImported}件のファイルを取り込みました`);
      setSummary({
        totalFiles: summary.totalFiles + totalImported,
        lastImportedAt: new Date().toISOString(),
      });
    }

    if (allErrors.length > 0) {
      toast.error(`${allErrors.length}件のエラーが発生しました`);
    }
  }

  const isProcessing = state === "checking" || state === "uploading";

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:gap-6">
          <span>取り込み済み: {summary.totalFiles}ファイル</span>
          <span>
            最終取り込み:{" "}
            {summary.lastImportedAt
              ? new Date(summary.lastImportedAt).toLocaleString("ja-JP")
              : "なし"}
          </span>
        </div>
      </div>

      {/* フォルダ選択 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">CSVデータ取り込み</h2>

        <FolderSelector
          onFilesSelected={handleFilesSelected}
          disabled={isProcessing}
        />

        {state === "checking" && (
          <p className="mt-3 text-sm text-gray-500">差分を確認中...</p>
        )}

        {allFiles.length > 0 && state !== "checking" && (
          <p className="mt-3 text-sm text-gray-500">
            選択されたCSVファイル: {allFiles.length}件
            {pendingFiles.length > 0 &&
              ` (未取り込み: ${pendingFiles.length}件)`}
          </p>
        )}
      </div>

      {/* 進捗 */}
      {state === "uploading" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ImportProgress
            current={progress.current}
            total={progress.total}
            errors={errors}
          />
        </div>
      )}

      {/* 完了 */}
      {state === "done" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-medium">取り込み完了</h3>
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-1 text-sm font-medium text-red-800">
                エラー ({errors.length}件)
              </p>
              <ul className="space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-xs text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setState("idle");
              setAllFiles([]);
              setPendingFiles([]);
              setErrors([]);
            }}
            className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:bg-gray-300 cursor-pointer active:scale-95"
          >
            新しい取り込みを開始
          </button>
        </div>
      )}
    </div>
  );
}
```

</details>

### タスク8: ダッシュボードヘッダーにタブ追加

**対象ファイル**:

- `app/dashboard/components/DashboardHeader.tsx`（既存・変更）

**問題点**:

レジデータページへのナビゲーションがない。

**修正内容**:

`tabs` 配列に「レジデータ」タブを追加する。

**DashboardHeader.tsx の変更（20-23行目付近）**:

```tsx
// 変更前
const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
] as const;

// 変更後
const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
  { href: '/dashboard/register', label: 'レジデータ' },
] as const;
```

### タスク9: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **ローカル確認** (`npm run dev`)
   - ダッシュボードに「レジデータ」タブが表示されること
   - タブをクリックするとレジデータページに遷移すること
   - 「XZ_BKUPフォルダを選択」ボタンが表示されること
   - sample-data/CASIO/SR500_550_4000/XZ_BKUP フォルダを選択して取り込みが完了すること
   - 取り込み中にプログレスバーが表示されること
   - 完了後に取り込み件数が表示されること
   - 再度同じフォルダを選択すると「すべてのファイルが取り込み済みです」と表示されること

## 変更対象ファイル一覧

| ファイル                                                  | 変更内容                   |
| --------------------------------------------------------- | -------------------------- |
| `lib/register/csv-types.ts`                               | **新規作成**               |
| `lib/register/csv-parser.ts`                              | **新規作成**               |
| `app/api/register/diff/route.ts`                          | **新規作成**               |
| `app/api/register/import/route.ts`                        | **新規作成**               |
| `app/dashboard/register/page.tsx`                         | **新規作成**               |
| `app/dashboard/register/components/RegisterImportPage.tsx` | **新規作成**               |
| `app/dashboard/register/components/FolderSelector.tsx`    | **新規作成**               |
| `app/dashboard/register/components/ImportProgress.tsx`    | **新規作成**               |
| `app/dashboard/components/DashboardHeader.tsx`            | タブ追加（1行追加）        |

## 備考

### 注意事項

- 既存のダッシュボード機能（ホームページ管理、ECサイト管理）には影響を与えないこと
- `prisma/schema.prisma` は変更しないこと（テーブルは作成済み）
- `sample-data/README.md` は変更しないこと

### 参考

- 画像アップロードの既存実装: `app/api/products/upload/route.ts`（FormData処理のパターン参照）
- ダッシュボードページの既存実装: `app/dashboard/homepage/page.tsx`（Server Component + Client Componentのパターン参照）
- CSV仕様の詳細: `sample-data/README.md`

### 技術的な注意点

- `TextDecoder('shift_jis')` はNode.js 18以上で対応済み（外部ライブラリ不要）
- `webkitdirectory` はChrome, Edge, Firefox, Safariで対応済み
- CSVの金額フィールドにカンマが含まれるため（例: `"5,200"`）、ダブルクォート内のカンマはデリミタとして扱わない
