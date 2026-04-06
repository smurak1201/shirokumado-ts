# 売上分析ダッシュボード: エクスポート・印刷機能

**日付**: 2026-04-05
**ブランチ**: feature/register-dashboard
**対象**: CSVエクスポートボタン、印刷ボタン、印刷用CSSスタイル
**ステータス**: 未着手
**完了日**: -

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: ExportButton.tsx作成](#タスク1-exportbuttontsx作成)
  - [タスク2: PrintButton.tsx作成](#タスク2-printbuttontsx作成)
  - [タスク3: globals.css追記](#タスク3-globalscss追記)
  - [タスク4: RegisterDataViewer.tsx + SalesOverviewTab.tsx変更](#タスク4-registerdataviewertsx--salesoverviewtabtsx変更)
  - [タスク5: 動作確認・ビルドテスト](#タスク5-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                                                   | 対応課題 | 優先度 | ステータス | 備考                   |
| --- | -------------------------------------------------------- | :------: | :----: | :--------: | ---------------------- |
| 1   | ExportButton.tsx作成                                     |    1     |   高   |    [ ]     |                        |
| 2   | PrintButton.tsx作成                                      |    2     |   高   |    [ ]     | タスク1と並列実行可能  |
| 3   | globals.css追記                                          |    2     |   高   |    [ ]     | タスク1,2と並列実行可能 |
| 4   | RegisterDataViewer.tsx + SalesOverviewTab.tsx変更         |   1,2    |   高   |    [ ]     |                        |
| 5   | 動作確認・ビルドテスト                                   |    -     |   -    |    [ ]     |                        |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

## 改修の目的

### 背景

売上分析ダッシュボードの全タブと設定機能は構築済みである。蓄積されたデータを外部に持ち出したり、紙やPDFとして保存する手段がないため、エクスポートと印刷の機能を追加する。

### 課題

- **課題1**: ダッシュボードのデータをCSV形式でダウンロードする手段がない
- **課題2**: ダッシュボードの表示内容を印刷またはPDF保存する手段がない

### 設計方針

- **方針1**: CSVエクスポートはクライアント側で完結する（API不要）。BOM付きUTF-8でExcelでの文字化けを防止する
- **方針2**: 印刷は`window.print()`を利用し、ブラウザの印刷ダイアログからPDF保存にも対応する。専用のPDF生成ライブラリは追加しない
- **方針3**: `@media print`のCSSでヘッダー・ナビゲーション・ボタン類を非表示にし、グラフとテーブルを印刷に最適化する

## タスク詳細

### タスク1: ExportButton.tsx作成

**対象ファイル**:

- `app/dashboard/register/components/viewer/ExportButton.tsx`（**新規作成**）

**問題点**:

ダッシュボードのテーブルデータをCSVファイルとしてダウンロードする手段がない。

**修正内容**:

CSVエクスポートボタンコンポーネントを作成する。propsでデータ配列・カラム定義・ファイル名を受け取り、クリック時にBOM付きUTF-8のCSV文字列を生成してBlobでダウンロードする。カラム定義は`DataTable`の`ColumnDef`型を再利用する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/ExportButton.tsx（新規作成）
"use client";

import { Button } from "@/app/components/ui/button";
import { Download } from "lucide-react";
import type { ColumnDef } from "./DataTable";

interface ExportButtonProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** ファイル名（拡張子なし）。未指定時は「売上分析_YYYY-MM-DD」 */
  fileName?: string;
}

/** 現在日付をYYYY-MM-DD形式で返す */
function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** データ配列とカラム定義からCSV文字列を生成 */
function generateCsv<T>(data: T[], columns: ColumnDef<T>[]): string {
  const header = columns.map((col) => col.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        const formatted = col.format
          ? col.format(value, row)
          : String(value ?? "");
        // カンマや改行を含む場合はダブルクォートで囲む
        if (formatted.includes(",") || formatted.includes("\n") || formatted.includes('"')) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

/** BOM付きUTF-8のCSVファイルをダウンロード */
function downloadCsv(csv: string, fileName: string): void {
  // BOM(\uFEFF)を先頭に付与してExcelでの文字化けを防止
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportButton<T>({
  data,
  columns,
  fileName,
}: ExportButtonProps<T>) {
  const handleExport = (): void => {
    const name = fileName ?? `売上分析_${getToday()}`;
    const csv = generateCsv(data, columns);
    downloadCsv(csv, name);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
      className="print-hidden"
    >
      <Download className="mr-1 h-4 w-4" />
      CSVダウンロード
    </Button>
  );
}
```

</details>

---

### タスク2: PrintButton.tsx作成

**対象ファイル**:

- `app/dashboard/register/components/viewer/PrintButton.tsx`（**新規作成**）

**問題点**:

ダッシュボードの表示内容を印刷またはPDF保存する手段がない。

**修正内容**:

印刷ボタンコンポーネントを作成する。クリック時に`window.print()`を呼び出すだけのシンプルなボタン。印刷時には`print-hidden`クラスにより自身も非表示になる。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/PrintButton.tsx（新規作成）
"use client";

import { Button } from "@/app/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="print-hidden"
    >
      <Printer className="mr-1 h-4 w-4" />
      印刷
    </Button>
  );
}
```

</details>

---

### タスク3: globals.css追記

**対象ファイル**:

- `app/globals.css`（既存・変更）

**問題点**:

印刷時にヘッダー、フッター、ナビゲーション、ボタン類が印刷されてしまい、ダッシュボードの内容が見づらくなる。グラフのサイズやテーブルのページ分割も最適化されていない。

**修正内容**:

`app/globals.css`の末尾に`@media print`ブロックを追記する。`print-hidden`クラスで非表示要素を制御し、グラフエリアの幅調整・テーブルのページ分割対応・背景色の白統一を行う。

**globals.css の末尾に追記**:

```css
/* --- 印刷用スタイル --- */
@media print {
  /* 印刷時に非表示にする要素 */
  .print-hidden,
  header,
  footer,
  nav {
    display: none !important;
  }

  body {
    background: #ffffff;
    color: #000000;
    font-size: 12pt;
  }

  /* グラフエリアを印刷幅に合わせる */
  .recharts-responsive-container {
    width: 100% !important;
    height: 300px !important;
  }

  /* テーブルのページ分割対応 */
  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* 印刷時のレイアウト調整 */
  main {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* リンクのURL表示を抑制 */
  a[href]::after {
    content: none !important;
  }
}
```

---

### タスク4: RegisterDataViewer.tsx + SalesOverviewTab.tsx変更

**対象ファイル**:

- `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`（既存・変更）
- `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`（既存・変更）

**問題点**:

ExportButtonとPrintButtonがダッシュボードに配置されていない。

**修正内容**:

1. `RegisterDataViewer.tsx`のフィルタバーの右端にPrintButtonを配置する
2. `SalesOverviewTab.tsx`の部門別テーブルの上にExportButtonを配置する

**RegisterDataViewer.tsx の変更**:

**注意**: 本仕様書の変更は仕様書03/04/05の変更が適用済みの状態に対して行う。以下は差分のみを記述する。全体コード例は記載しない（仕様書03/04/05の変更を上書きしないため）。

importの追加:

```tsx
// 既存のimport文の末尾に追加
import PrintButton from "./PrintButton";
```

フィルタバーの最上位divにflexレイアウトを追加し、右端にPrintButtonを配置する:

```tsx
// 変更前（フィルタバー内の最上位div）
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <PeriodSelector

// 変更後（flexで囲み、右端にPrintButton��配置）
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-3">
            <PeriodSelector
```

フィルタバーの閉じタグの前にPrintButtonを追加:

```tsx
// 変更前（フィルタバー内の設定ボタン群やPeriodPresetsの閉じタグの後）
        </div>
      </div>

// 変更後（flex-1のdivを閉じた後にPrintButtonを追加）
          </div>
          <PrintButton />
        </div>
      </div>
```

**SalesOverviewTab.tsx の変更**:

importの追加:

```tsx
// 変更前
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

// 変更後
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";
import ExportButton from "../ExportButton";
```

部門別テーブルの見出しの横にExportButtonを配置:

```tsx
// 変更前
      {/* 部門別テーブル */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">部門別売上合計</h3>
        <DataTable columns={aggregatedColumns} data={data.aggregated} />
      </div>

// 変更後
      {/* 部門別テーブル */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">部門別売上合計</h3>
          <ExportButton
            data={data.aggregated}
            columns={aggregatedColumns}
            fileName={`売上概要_部門別売上合計_${getToday()}`}
          />
        </div>
        <DataTable columns={aggregatedColumns} data={data.aggregated} />
      </div>
```

`getToday`関数はExportButtonと同じ日付フォーマットを使用する。SalesOverviewTab内にヘルパー関数を追加する:

```tsx
// aggregatedColumnsの定義の前に追加
/** 現在日付をYYYY-MM-DD形式で返す */
function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
```

<details>
<summary>SalesOverviewTab.tsx 変更後の全体（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx
"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse } from "../../../types";
import KpiCards from "../KpiCards";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";
import ExportButton from "../ExportButton";
import type { AggregatedEntry } from "../../../types";

const DayOfWeekChart = dynamic(() => import("../charts/DayOfWeekChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-lg bg-gray-100" />,
});

const SalesBreakdownDonut = dynamic(() => import("../charts/SalesBreakdownDonut"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-lg bg-gray-100" />,
});

interface SalesOverviewTabProps {
  data: RegisterDataResponse;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousCustomers?: number;
}

/** 現在日付をYYYY-MM-DD形式で返す */
function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const aggregatedColumns: ColumnDef<AggregatedEntry>[] = [
  { key: "itemName", label: "項目名" },
  {
    key: "totalQuantity",
    label: "数量",
    align: "right",
    format: (v) => (v as number).toLocaleString("ja-JP"),
  },
  {
    key: "totalAmount",
    label: "金額",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
  },
];

export default function SalesOverviewTab({
  data,
  totalCustomers,
  previousCustomers,
}: SalesOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <KpiCards
        summary={data.summary}
        totalCustomers={totalCustomers}
        previousPeriod={data.previousPeriod}
        previousCustomers={previousCustomers}
      />

      {/* グラフエリア */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DayOfWeekChart timeSeries={data.timeSeries} />
        <SalesBreakdownDonut
          aggregated={data.aggregated}
          totalAmount={data.summary.totalAmount}
        />
      </div>

      {/* 部門別テーブル */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">部門別売上合計</h3>
          <ExportButton
            data={data.aggregated}
            columns={aggregatedColumns}
            fileName={`売上概要_部門別売上合計_${getToday()}`}
          />
        </div>
        <DataTable columns={aggregatedColumns} data={data.aggregated} />
      </div>
    </div>
  );
}
```

</details>

---

### タスク5: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **ローカル確認** (`npm run dev`)
   - `/dashboard/register` にアクセスし、売上分析タブを表示する
   - 売上概要タブの部門別売上合計テーブルの上に「CSVダウンロード」ボタンが表示されること
   - 「CSVダウンロード」ボタンをクリックし、`売上概要_部門別売上合計_YYYY-MM-DD.csv`がダウンロードされること
   - ダウンロードしたCSVファイルをExcelで開き、日本語が文字化けしないこと
   - データが0件の場合、「CSVダウンロード」ボタンがdisabled状態になること
   - フィルタバーの右端に「印刷」ボタンが表示されること
   - 「印刷」ボタンをクリックし、ブラウザの印刷ダイアログが開くこと
   - 印刷プレビューでヘッダー、ナビゲーション、ボタン類が非表示になっていること
   - 印刷プレビューでグラフが幅100%で表示されていること
   - 印刷ダイアログから「PDFに保存」を選択し、PDFが正常に出力されること

## 変更対象ファイル一覧

| ファイル                                                                  | 変更内容                                    |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| `app/dashboard/register/components/viewer/ExportButton.tsx`               | **新規作成**                                |
| `app/dashboard/register/components/viewer/PrintButton.tsx`                | **新規作成**                                |
| `app/globals.css`                                                         | @media printスタイルを末尾に追記            |
| `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`         | PrintButtonの配置、フィルタバーレイアウト変更 |
| `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`      | ExportButtonの配置、getToday関数追加        |

## 備考

### 前提条件

- 本仕様書は仕様書02~05の変更が全て適用済みの状態を前提とする
- `RegisterDataViewer.tsx`の変更は差分形式で記述しており、仕様書03/04/05で追加されたimport文やタブコンポーネントはそのまま維持すること

### 注意事項

- PDF生成ライブラリ（jsPDF等）は追加しない。印刷ダイアログからPDF保存する方式とする
- CSVエクスポートはクライアント側で完結する。APIエンドポイントは不要
- `ExportButton`はジェネリクスを使用し、各タブで個別にデータとカラム定義を渡す設計とする。本仕様書では売上概要タブのみに配置するが、後続の仕様書で他のタブにも同じパターンで追加可能
- `print-hidden`クラスはTailwindのユーティリティクラスではなく、`globals.css`の`@media print`内で定義するカスタムクラスである
- 既存の取り込み機能（`RegisterImportPage.tsx`, `FolderSelector.tsx`, `ImportProgress.tsx`）は変更しないこと
- 既存のAPIルート（`/api/register/diff`, `/api/register/import`）は変更しないこと

### 参考

- DataTableのColumnDef型: `app/dashboard/register/components/viewer/DataTable.tsx`
- 既存ボタンスタイル: shadcn/ui `Button`コンポーネント（`app/components/ui/button.tsx`）
- lucide-reactアイコン: `Download`, `Printer`
