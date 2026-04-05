# 売上分析ダッシュボード: 基盤 + 売上概要タブ

**日付**: 2026-04-05
**ブランチ**: feature/register-dashboard
**対象**: ダッシュボード レジデータページ、売上分析API、売上概要タブ
**ステータス**: 未着手
**完了日**: -

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: セットアップ](#タスク1-セットアップ)
  - [タスク2: 型定義・定数の作成](#タスク2-型定義定数の作成)
  - [タスク3: 第1層タブの作成](#タスク3-第1層タブの作成)
  - [タスク4: データ取得API](#タスク4-データ取得api)
  - [タスク5: レジ番号一覧API](#タスク5-レジ番号一覧api)
  - [タスク6: データ取得フック](#タスク6-データ取得フック)
  - [タスク7: 期間セレクター](#タスク7-期間セレクター)
  - [タスク8: レジフィルター](#タスク8-レジフィルター)
  - [タスク9: KPIカード](#タスク9-kpiカード)
  - [タスク10: 汎用テーブル](#タスク10-汎用テーブル)
  - [タスク11: 曜日別グラフ・売上内訳ドーナツ](#タスク11-曜日別グラフ売上内訳ドーナツ)
  - [タスク12: 売上概要タブ統合](#タスク12-売上概要タブ統合)
  - [タスク13: 動作確認・ビルドテスト](#タスク13-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                          | 対応課題 | 優先度 | ステータス | 備考                   |
| --- | ------------------------------- | :------: | :----: | :--------: | ---------------------- |
| 1   | セットアップ                    |    -     |   高   |    [ ]     |                        |
| 2   | 型定義・定数の作成              |    -     |   高   |    [ ]     |                        |
| 3   | 第1層タブの作成                 |    1     |   高   |    [ ]     |                        |
| 4   | データ取得API                   |   2,3    |   高   |    [ ]     |                        |
| 5   | レジ番号一覧API                 |    3     |   高   |    [ ]     | タスク4と並列実行可能  |
| 6   | データ取得フック                |   2,3    |   高   |    [ ]     |                        |
| 7   | 期間セレクター                  |    2     |   高   |    [ ]     | タスク8と並列実行可能  |
| 8   | レジフィルター                  |    2     |   高   |    [ ]     | タスク7と並列実行可能  |
| 9   | KPIカード                       |    2     |   中   |    [ ]     |                        |
| 10  | 汎用テーブル                    |    -     |   中   |    [ ]     | タスク9と並列実行可能  |
| 11  | 曜日別グラフ・売上内訳ドーナツ  |    2     |   中   |    [ ]     |                        |
| 12  | 売上概要タブ統合                |  1,2,3   |   高   |    [ ]     |                        |
| 13  | 動作確認・ビルドテスト          |    -     |   -    |    [ ]     |                        |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

## 改修の目的

### 背景

レジCSVデータの取り込み機能は完成しており、DBに5種類のデータ（売上明細Z001、取引キーZ002、商品売上Z004、部門売上Z005、時間帯別売上Z009）が蓄積されている。これらのデータを分析テーマ別に視覚的に閲覧できる売上分析ダッシュボードを構築する。

本仕様書はダッシュボードの基盤（タブ構造、API、共通コンポーネント）と最初の分析タブ「売上概要」を対象とする。

### 課題

- **課題1**: 取り込んだレジデータを閲覧・分析する手段がない
- **課題2**: 日計/週計/月計/年計での集計表示が必要
- **課題3**: 複数レジの合算・個別表示の切り替えが必要

### 設計方針

- **方針1**: 既存の取り込み機能を壊さず、第1層タブで「データ取り込み」と「売上分析」を切り替える
- **方針2**: API側で集計・期間0埋め（定休日対応）を処理し、フロントはデータ表示に専念する
- **方針3**: shadcn/ui Chart（内部でrechartsを使用）でグラフ表示。rechartsがSSR非対応のためdynamic importを使用する
- **方針4**: PC優先のレイアウトだが、モバイルでは縦積みにフォールバックする

## タスク詳細

### タスク1: セットアップ

**対象ファイル**:

- `prisma/schema.prisma`（既存・変更）

**問題点**:

rechartsとshadcn/ui Tableが未導入。期間プリセット・レジ名称・売上目標・ダッシュボード設定のDBテーブルが未定義。

**修正内容**:

1. `npx shadcn@latest add chart` でshadcn/ui Chartコンポーネントを追加（rechartsが依存として自動インストールされる）
2. `npx shadcn@latest add table` でshadcn/ui Tableを追加
3. `prisma/schema.prisma` に4つのモデルを追加
4. `npx prisma migrate dev --name add_register_dashboard_tables` でマイグレーション実行

**schema.prisma の末尾に追加（既存モデルの後に追記）**:

```prisma
// 期間プリセット（カスタム期間に名前を付けて保存）
model RegisterPeriodPreset {
  id        Int      @id @default(autoincrement())
  name      String
  dateFrom  DateTime @map("date_from") @db.Date
  dateTo    DateTime @map("date_to") @db.Date
  createdAt DateTime @default(now()) @map("created_at")

  @@map("reg_period_presets")
}

// レジ番号の表示名（例: 14 → "入口レジ"）
model RegisterMachineName {
  id        Int      @id @default(autoincrement())
  machineNo String   @unique @map("machine_no")
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("reg_machine_names")
}

// 月間売上目標
model RegisterSalesTarget {
  id        Int      @id @default(autoincrement())
  year      Int
  month     Int
  amount    Int
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([year, month])
  @@map("reg_sales_targets")
}

// ダッシュボード表示設定（key-value形式）
model RegisterDashboardSetting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String

  @@map("reg_dashboard_settings")
}
```

---

### タスク2: 型定義・定数の作成

**対象ファイル**:

- `app/dashboard/register/types.ts`（**新規作成**）

**問題点**:

売上分析ダッシュボードで使用する型・定数が未定義。

**修正内容**:

データ種別、期間タイプ、フィルタ条件、APIレスポンスの型、タブ定義の定数を作成する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/dashboard/register/types.ts（新規作成）

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
}

/** 取り込みサマリー（既存のRegisterImportPageに渡すprops） */
export interface ImportSummary {
  totalFiles: number;
  lastImportedAt: string | null;
}
```

</details>

---

### タスク3: 第1層タブの作成

**対象ファイル**:

- `app/dashboard/register/components/RegisterPageTabs.tsx`（**新規作成**）
- `app/dashboard/register/page.tsx`（既存・変更）

**問題点**:

現在のページは取り込み機能のみ。売上分析タブを追加するためのタブ構造が必要。

**修正内容**:

`RegisterPageTabs`コンポーネントで「データ取り込み」と「売上分析」の2タブを提供。`page.tsx`から呼び出す。売上分析タブの中身（`RegisterDataViewer`）はタスク12で作成するため、ここではプレースホルダーを配置する。

<details>
<summary>RegisterPageTabs.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/RegisterPageTabs.tsx（新規作成）
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import type { ImportSummary } from "../types";
import RegisterImportPage from "./RegisterImportPage";

interface RegisterPageTabsProps {
  initialSummary: ImportSummary;
}

export default function RegisterPageTabs({
  initialSummary,
}: RegisterPageTabsProps) {
  return (
    <Tabs defaultValue="import">
      <TabsList className="w-full">
        <TabsTrigger value="import" className="flex-1">
          データ取り込み
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex-1">
          売上分析
        </TabsTrigger>
      </TabsList>

      <TabsContent value="import">
        <RegisterImportPage initialSummary={initialSummary} />
      </TabsContent>

      <TabsContent value="analysis">
        {/* タスク12でRegisterDataViewerに置き換え */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          売上分析ダッシュボード（準備中）
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

</details>

**page.tsx の変更**:

```tsx
// 変更前
import RegisterImportPage from "./components/RegisterImportPage";

// 変更後
import RegisterPageTabs from "./components/RegisterPageTabs";
```

```tsx
// 変更前
export default async function RegisterPage() {
  const summary = await getImportSummary();

  return <RegisterImportPage initialSummary={summary} />;
}

// 変更後
export default async function RegisterPage() {
  const summary = await getImportSummary();

  return <RegisterPageTabs initialSummary={summary} />;
}
```

`getImportSummary` の返り値の型を `ImportSummary` に合わせるため、import文を追加する:

```tsx
// page.tsx の先頭に追加
import type { ImportSummary } from "./types";
```

`getImportSummary` の返り値型アノテーションを変更:

```tsx
// 変更前
async function getImportSummary(): Promise<{
  totalFiles: number;
  lastImportedAt: string | null;
}>

// 変更後
async function getImportSummary(): Promise<ImportSummary>
```

---

### タスク4: データ取得API

**対象ファイル**:

- `app/api/register/data/route.ts`（**新規作成**）

**問題点**:

売上分析に必要なデータ取得APIが存在しない。

**修正内容**:

`GET /api/register/data` を作成する。クエリパラメータ `type`, `dateFrom`, `dateTo`, `machineNo`, `view`, `groupBy`, `granularity`, `compareLastYear` を受け取り、Prismaで適切なテーブルから集計クエリを実行する。

期間内の全日付リストを生成し、データがない日は0で埋める（定休日対応）。前期比のデータも同時に返す。

本タスクではまず `type=Z001` と `type=Z009` の集計を実装する。他の種別は後続の仕様書で追加する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/api/register/data/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import type {
  RegisterDataResponse,
  RegisterDataByMachineResponse,
  Granularity,
  ViewMode,
  GroupBy,
  TimeSeriesEntry,
  AggregatedEntry,
  DataSummary,
  PeriodStat,
} from "@/app/dashboard/register/types";

export const dynamic = "force-dynamic";

/** 期間内の全日付を生成（定休日を0埋めするため） */
function generateDateRange(from: Date, to: Date): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  while (current <= to) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** 日付を粒度に応じたキーに変換 */
function toGranularityKey(dateStr: string, granularity: Granularity): string {
  const date = new Date(dateStr);
  switch (granularity) {
    case "day":
      return dateStr;
    case "week": {
      // ISO週番号の月曜日を基準
      const d = new Date(date);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toISOString().split("T")[0];
    }
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "year":
      return `${date.getFullYear()}`;
  }
}

/** 粒度に応じた期間キーの全リストを生成 */
function generatePeriodKeys(
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): string[] {
  const allDates = generateDateRange(new Date(dateFrom), new Date(dateTo));
  const keySet = new Set<string>();
  for (const d of allDates) {
    keySet.add(toGranularityKey(d, granularity));
  }
  return [...keySet].sort();
}

/** 前期の日付範囲を計算 */
function getPreviousPeriodRange(
  dateFrom: string,
  dateTo: string
): { from: Date; to: Date } {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const diff = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diff);
  return { from: prevFrom, to: prevTo };
}

/** 前年同期の日付範囲を計算 */
function getLastYearRange(
  dateFrom: string,
  dateTo: string
): { from: Date; to: Date } {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  from.setFullYear(from.getFullYear() - 1);
  to.setFullYear(to.getFullYear() - 1);
  return { from, to };
}

/** timeSeriesから統計を計算 */
function calculateSummary(
  timeSeries: TimeSeriesEntry[],
  totalAmount: number,
  totalQuantity: number,
  recordCount: number
): DataSummary {
  // 0を除外したエントリ（定休日を除く）
  const nonZeroAmount = timeSeries.filter((e) => e.totalAmount > 0);
  const nonZeroQuantity = timeSeries.filter((e) => e.totalQuantity > 0);
  const periodCount = timeSeries.length || 1;

  const maxAmountEntry = nonZeroAmount.reduce<PeriodStat>(
    (max, e) => (e.totalAmount > max.value ? { period: e.period, value: e.totalAmount } : max),
    { period: "", value: 0 }
  );
  const minAmountEntry = nonZeroAmount.reduce<PeriodStat>(
    (min, e) => (e.totalAmount < min.value ? { period: e.period, value: e.totalAmount } : min),
    { period: nonZeroAmount[0]?.period ?? "", value: nonZeroAmount[0]?.totalAmount ?? 0 }
  );
  const maxQuantityEntry = nonZeroQuantity.reduce<PeriodStat>(
    (max, e) => (e.totalQuantity > max.value ? { period: e.period, value: e.totalQuantity } : max),
    { period: "", value: 0 }
  );
  const minQuantityEntry = nonZeroQuantity.reduce<PeriodStat>(
    (min, e) => (e.totalQuantity < min.value ? { period: e.period, value: e.totalQuantity } : min),
    { period: nonZeroQuantity[0]?.period ?? "", value: nonZeroQuantity[0]?.totalQuantity ?? 0 }
  );

  return {
    totalAmount,
    totalQuantity,
    recordCount,
    avgAmount: Math.round(totalAmount / periodCount),
    avgQuantity: Math.round(totalQuantity / periodCount),
    maxAmount: maxAmountEntry,
    minAmount: minAmountEntry,
    maxQuantity: maxQuantityEntry,
    minQuantity: minQuantityEntry,
  };
}

/** Z001 売上明細データを取得 */
async function fetchZ001Data(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ itemName: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerSalesSummary.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z001)"
  ).then((rows) =>
    rows.map((r) => ({
      itemName: r.itemName,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** Z009 時間帯別売上データを取得（客数計算用） */
async function fetchZ009Totals(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<Array<{ quantity: number; amount: number; date: Date; machineNo: string }>> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerHourlySale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z009 totals)"
  ).then((rows) =>
    rows.map((r) => ({
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** 行データから時系列を構築（粒度に応じて集約、0埋め） */
function buildTimeSeries(
  rows: Array<{ amount: number; quantity: number; date: Date }>,
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): TimeSeriesEntry[] {
  const periodKeys = generatePeriodKeys(dateFrom, dateTo, granularity);
  const map = new Map<string, { totalAmount: number; totalQuantity: number }>();

  for (const key of periodKeys) {
    map.set(key, { totalAmount: 0, totalQuantity: 0 });
  }

  for (const row of rows) {
    const dateStr = row.date.toISOString().split("T")[0];
    const key = toGranularityKey(dateStr, granularity);
    const entry = map.get(key);
    if (entry) {
      entry.totalAmount += row.amount;
      entry.totalQuantity += row.quantity;
    }
  }

  return periodKeys.map((key) => ({
    period: key,
    totalAmount: map.get(key)?.totalAmount ?? 0,
    totalQuantity: map.get(key)?.totalQuantity ?? 0,
  }));
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const machineNo = searchParams.get("machineNo") || null;
  const view = (searchParams.get("view") || "summary") as ViewMode;
  const groupBy = (searchParams.get("groupBy") || "combined") as GroupBy;
  const granularity = (searchParams.get("granularity") || "day") as Granularity;
  const compareLastYear = searchParams.get("compareLastYear") === "true";

  if (!type || !dateFrom || !dateTo) {
    throw new ValidationError("type, dateFrom, dateTo は必須です");
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ValidationError("日付の形式が不正です");
  }

  // 売上概要ではZ001（売上）とZ009（客数）を両方取得する
  // Z001のitemName="取扱い高" が総売上に相当するかはデータ依存
  // ここでは全itemNameの集計を返し、フロント側で必要な項目を選択する

  if (type === "Z001" || type === "Z009") {
    if (groupBy === "machine") {
      // レジ別集計
      const z001Rows = await fetchZ001Data(from, to, null);
      const machineNos = [...new Set(z001Rows.map((r) => r.machineNo))];

      const byMachine: Record<string, RegisterDataResponse> = {};

      for (const mNo of machineNos) {
        const machineRows = z001Rows.filter((r) => r.machineNo === mNo);
        const timeSeries = buildTimeSeries(
          machineRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
          dateFrom,
          dateTo,
          granularity
        );

        const totalAmount = machineRows.reduce((s, r) => s + r.amount, 0);
        const totalQuantity = machineRows.reduce((s, r) => s + r.quantity, 0);

        const aggregated: AggregatedEntry[] = [];
        const itemMap = new Map<string, { q: number; a: number }>();
        for (const r of machineRows) {
          const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
          existing.q += r.quantity;
          existing.a += r.amount;
          itemMap.set(r.itemName, existing);
        }
        for (const [name, val] of itemMap) {
          aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
        }

        byMachine[mNo] = {
          aggregated,
          timeSeries,
          summary: calculateSummary(timeSeries, totalAmount, totalQuantity, machineRows.length),
        };
      }

      const response: RegisterDataByMachineResponse = { byMachine };
      return apiSuccess(response);
    }

    // 合算集計
    const z001Rows = await fetchZ001Data(from, to, machineNo);

    // 項目別集計
    const itemMap = new Map<string, { q: number; a: number }>();
    for (const r of z001Rows) {
      const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
      existing.q += r.quantity;
      existing.a += r.amount;
      itemMap.set(r.itemName, existing);
    }
    const aggregated: AggregatedEntry[] = [];
    for (const [name, val] of itemMap) {
      aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
    }

    // 時系列（日別売上推移用）
    const timeSeries = buildTimeSeries(
      z001Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      dateFrom,
      dateTo,
      granularity
    );

    const totalAmount = z001Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z001Rows.reduce((s, r) => s + r.quantity, 0);

    // 前期比
    let previousPeriod: { totalAmount: number; totalQuantity: number } | undefined;
    const prev = getPreviousPeriodRange(dateFrom, dateTo);
    const prevRows = await fetchZ001Data(prev.from, prev.to, machineNo);
    if (prevRows.length > 0) {
      previousPeriod = {
        totalAmount: prevRows.reduce((s, r) => s + r.amount, 0),
        totalQuantity: prevRows.reduce((s, r) => s + r.quantity, 0),
      };
    }

    // 前年同期
    let lastYearTimeSeries: TimeSeriesEntry[] | undefined;
    if (compareLastYear) {
      const ly = getLastYearRange(dateFrom, dateTo);
      const lyDateFrom = ly.from.toISOString().split("T")[0];
      const lyDateTo = ly.to.toISOString().split("T")[0];
      const lyRows = await fetchZ001Data(ly.from, ly.to, machineNo);
      lastYearTimeSeries = buildTimeSeries(
        lyRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
        lyDateFrom,
        lyDateTo,
        granularity
      );
    }

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z001Rows.length),
      previousPeriod,
      lastYearTimeSeries,
    };

    return apiSuccess(response);
  }

  throw new ValidationError(`未対応のデータ種別です: ${type}`);
});
```

</details>

---

### タスク5: レジ番号一覧API

**対象ファイル**:

- `app/api/register/machines/route.ts`（**新規作成**）

**問題点**:

フィルタ用のレジ番号一覧を取得するAPIがない。

**修正内容**:

`GET /api/register/machines` でRegisterSettlementからDISTINCT machineNoを取得し、RegisterMachineNameとJOINして名前付きで返す。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/api/register/machines/route.ts（新規作成）

import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import type { MachinesResponse } from "@/app/dashboard/register/types";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const settlements = await safePrismaOperation(
    () =>
      prisma.registerSettlement.findMany({
        select: { machineNo: true },
        distinct: ["machineNo"],
        orderBy: { machineNo: "asc" },
      }),
    "GET /api/register/machines"
  );

  const machineNos = settlements.map((s) => s.machineNo);

  const names = await safePrismaOperation(
    () =>
      prisma.registerMachineName.findMany({
        where: { machineNo: { in: machineNos } },
      }),
    "GET /api/register/machines (names)"
  );

  const nameMap = new Map(names.map((n) => [n.machineNo, n.name]));

  const response: MachinesResponse = {
    machines: machineNos.map((no) => ({
      machineNo: no,
      name: nameMap.get(no) ?? null,
    })),
  };

  return apiSuccess(response);
});
```

</details>

---

### タスク6: データ取得フック

**対象ファイル**:

- `app/dashboard/register/components/viewer/hooks/useRegisterData.ts`（**新規作成**）

**問題点**:

フロント側でフィルタ状態管理とAPI呼び出しを行うフックが必要。

**修正内容**:

フィルタ状態（期間タイプ、日付範囲、レジ番号、表示モード、グループ化）の管理と、`fetchJson`を使ったデータ取得を1つのカスタムフックにまとめる。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/dashboard/register/components/viewer/hooks/useRegisterData.ts（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type {
  RegisterDataResponse,
  RegisterDataByMachineResponse,
  MachinesResponse,
  MachineInfo,
  PeriodType,
  Granularity,
  GroupBy,
} from "../../../types";

/** 期間タイプからデフォルトの日付範囲を計算 */
function getDefaultDateRange(periodType: PeriodType): { from: string; to: string } {
  const today = new Date();
  const toStr = today.toISOString().split("T")[0];

  switch (periodType) {
    case "day":
      return { from: toStr, to: toStr };
    case "week": {
      const d = new Date(today);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      const weekStart = d.toISOString().split("T")[0];
      d.setDate(d.getDate() + 6);
      const weekEnd = d.toISOString().split("T")[0];
      return { from: weekStart, to: weekEnd };
    }
    case "month": {
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const monthEnd = lastDay.toISOString().split("T")[0];
      return { from: monthStart, to: monthEnd };
    }
    case "year": {
      return { from: `${today.getFullYear()}-01-01`, to: `${today.getFullYear()}-12-31` };
    }
    case "custom":
      return { from: toStr, to: toStr };
  }
}

/** 期間タイプに対応するデフォルトの粒度 */
function getDefaultGranularity(periodType: PeriodType): Granularity {
  switch (periodType) {
    case "day":
      return "day";
    case "week":
      return "day";
    case "month":
      return "day";
    case "year":
      return "month";
    case "custom":
      return "day";
  }
}

export interface UseRegisterDataReturn {
  // フィルタ状態
  periodType: PeriodType;
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  groupBy: GroupBy;
  granularity: Granularity;

  // フィルタ操作
  setPeriodType: (type: PeriodType) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setMachineNo: (no: string | null) => void;
  setGroupBy: (groupBy: GroupBy) => void;
  navigatePeriod: (direction: "prev" | "next") => void;

  // データ
  data: RegisterDataResponse | null;
  dataByMachine: RegisterDataByMachineResponse | null;
  machines: MachineInfo[];
  isLoading: boolean;

  // 手動リフレッシュ
  refetch: () => void;
}

export function useRegisterData(
  initialType: string = "Z001"
): UseRegisterDataReturn {
  const [periodType, setPeriodTypeState] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange("month"));
  const [machineNo, setMachineNo] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("combined");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const [data, setData] = useState<RegisterDataResponse | null>(null);
  const [dataByMachine, setDataByMachine] = useState<RegisterDataByMachineResponse | null>(null);
  const [machines, setMachines] = useState<MachineInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // レジ一覧を取得（初回のみ）
  useEffect(() => {
    fetchJson<MachinesResponse>("/api/register/machines")
      .then((res) => setMachines(res.machines))
      .catch((err) => toast.error(getUserFriendlyMessageJa(err)));
  }, []);

  // データ取得
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: initialType,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        view: "summary",
        groupBy,
        granularity,
      });
      if (machineNo) params.set("machineNo", machineNo);

      if (groupBy === "machine") {
        const result = await fetchJson<RegisterDataByMachineResponse>(
          `/api/register/data?${params}`
        );
        setDataByMachine(result);
        setData(null);
      } else {
        const result = await fetchJson<RegisterDataResponse>(
          `/api/register/data?${params}`
        );
        setData(result);
        setDataByMachine(null);
      }
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [initialType, dateRange, machineNo, groupBy, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 期間タイプ変更
  const setPeriodType = useCallback((type: PeriodType) => {
    setPeriodTypeState(type);
    if (type !== "custom") {
      setDateRange(getDefaultDateRange(type));
      setGranularity(getDefaultGranularity(type));
    }
  }, []);

  // 期間ナビゲーション（前/次）
  const navigatePeriod = useCallback(
    (direction: "prev" | "next") => {
      const offset = direction === "prev" ? -1 : 1;
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);

      switch (periodType) {
        case "day":
          from.setDate(from.getDate() + offset);
          to.setDate(to.getDate() + offset);
          break;
        case "week":
          from.setDate(from.getDate() + offset * 7);
          to.setDate(to.getDate() + offset * 7);
          break;
        case "month":
          from.setMonth(from.getMonth() + offset);
          to.setDate(1);
          to.setMonth(to.getMonth() + offset + 1);
          to.setDate(0);
          break;
        case "year":
          from.setFullYear(from.getFullYear() + offset);
          to.setFullYear(to.getFullYear() + offset);
          break;
        default:
          return;
      }

      setDateRange({
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      });
    },
    [dateRange, periodType]
  );

  return {
    periodType,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    machineNo,
    groupBy,
    granularity,
    setPeriodType,
    setDateFrom: (date: string) => setDateRange((prev) => ({ ...prev, from: date })),
    setDateTo: (date: string) => setDateRange((prev) => ({ ...prev, to: date })),
    setMachineNo,
    setGroupBy,
    navigatePeriod,
    data,
    dataByMachine,
    machines,
    isLoading,
    refetch: fetchData,
  };
}
```

</details>

---

### タスク7: 期間セレクター

**対象ファイル**:

- `app/dashboard/register/components/viewer/PeriodSelector.tsx`（**新規作成**）

**問題点**:

日/週/月/年/カスタムの期間切り替えUIが必要。

**修正内容**:

「日」「週」「月」「年」「カスタム」のボタングループと、< > ナビゲーション、カスタム時の日付入力を提供する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/PeriodSelector.tsx（新規作成）
"use client";

import type { PeriodType } from "../../types";
import { PERIOD_LABELS } from "../../types";

interface PeriodSelectorProps {
  periodType: PeriodType;
  dateFrom: string;
  dateTo: string;
  onPeriodTypeChange: (type: PeriodType) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
}

const PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year", "custom"];

/** 表示用の期間ラベル */
function formatPeriodLabel(periodType: PeriodType, dateFrom: string, dateTo: string): string {
  const from = new Date(dateFrom);
  switch (periodType) {
    case "day":
      return from.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    case "week":
      return `${new Date(dateFrom).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })} - ${new Date(dateTo).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}`;
    case "month":
      return from.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
    case "year":
      return `${from.getFullYear()}年`;
    case "custom":
      return `${dateFrom} - ${dateTo}`;
  }
}

export default function PeriodSelector({
  periodType,
  dateFrom,
  dateTo,
  onPeriodTypeChange,
  onDateFromChange,
  onDateToChange,
  onNavigate,
}: PeriodSelectorProps) {
  return (
    <div className="space-y-3">
      {/* 期間タイプ切り替えボタン */}
      <div className="flex flex-wrap gap-1">
        {PERIOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onPeriodTypeChange(type)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
              periodType === type
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {PERIOD_LABELS[type]}
          </button>
        ))}
      </div>

      {/* ナビゲーション + 期間表示 */}
      <div className="flex items-center gap-3">
        {periodType !== "custom" && (
          <button
            type="button"
            onClick={() => onNavigate("prev")}
            className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95"
            aria-label="前の期間"
          >
            &lt;
          </button>
        )}

        <span className="text-sm font-medium text-gray-800">
          {formatPeriodLabel(periodType, dateFrom, dateTo)}
        </span>

        {periodType !== "custom" && (
          <button
            type="button"
            onClick={() => onNavigate("next")}
            className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95"
            aria-label="次の期間"
          >
            &gt;
          </button>
        )}
      </div>

      {/* カスタム期間の日付入力 */}
      {periodType === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
          <span className="text-sm text-gray-500">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}
```

</details>

---

### タスク8: レジフィルター

**対象ファイル**:

- `app/dashboard/register/components/viewer/MachineFilter.tsx`（**新規作成**）

**問題点**:

レジ番号の選択と、合算/レジ別の切り替えUIが必要。

**修正内容**:

レジ選択のセレクトボックス（名前付きで表示）と、「合算」「レジ別」の切り替えボタンを提供する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/MachineFilter.tsx（新規作成）
"use client";

import type { GroupBy, MachineInfo } from "../../types";

interface MachineFilterProps {
  machines: MachineInfo[];
  machineNo: string | null;
  groupBy: GroupBy;
  onMachineNoChange: (no: string | null) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
}

export default function MachineFilter({
  machines,
  machineNo,
  groupBy,
  onMachineNoChange,
  onGroupByChange,
}: MachineFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 合算/レジ別 切り替え */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onGroupByChange("combined")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
            groupBy === "combined"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          合算
        </button>
        <button
          type="button"
          onClick={() => onGroupByChange("machine")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
            groupBy === "machine"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          レジ別
        </button>
      </div>

      {/* レジ番号選択（合算モード時のみ表示） */}
      {groupBy === "combined" && machines.length > 0 && (
        <select
          value={machineNo ?? ""}
          onChange={(e) => onMachineNoChange(e.target.value || null)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">全レジ</option>
          {machines.map((m) => (
            <option key={m.machineNo} value={m.machineNo}>
              {m.name ? `${m.machineNo} - ${m.name}` : `レジ ${m.machineNo}`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```

</details>

---

### タスク9: KPIカード

**対象ファイル**:

- `app/dashboard/register/components/viewer/KpiCards.tsx`（**新規作成**）

**問題点**:

売上合計・客数・客単価・前期比・平均・トップ/ボトムを表示するKPIカードが必要。

**修正内容**:

`DataSummary`と`previousPeriod`を受け取り、KPIカードを表示するコンポーネントを作成する。前期比は上昇/下降をアイコンと色で表示する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/KpiCards.tsx（新規作成）
"use client";

import type { DataSummary } from "../../types";

interface KpiCardsProps {
  summary: DataSummary;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousPeriod?: { totalAmount: number; totalQuantity: number };
  previousCustomers?: number;
}

/** 金額をカンマ区切りでフォーマット */
function formatAmount(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

/** 前期比の変化率を計算 */
function calcChangeRate(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** 変化率の表示 */
function ChangeIndicator({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-xs text-gray-400">--</span>;
  const isPositive = rate > 0;
  const color = isPositive ? "text-green-600" : rate < 0 ? "text-red-600" : "text-gray-500";
  const arrow = isPositive ? "+" : "";
  return <span className={`text-xs font-medium ${color}`}>{arrow}{rate}%</span>;
}

export default function KpiCards({
  summary,
  totalCustomers,
  previousPeriod,
  previousCustomers,
}: KpiCardsProps) {
  const avgUnitPrice = totalCustomers > 0 ? Math.round(summary.totalAmount / totalCustomers) : 0;
  const prevAvgUnitPrice =
    previousPeriod && previousCustomers && previousCustomers > 0
      ? Math.round(previousPeriod.totalAmount / previousCustomers)
      : 0;

  const cards = [
    {
      label: "売上合計",
      value: `${formatAmount(summary.totalAmount)}円`,
      change: previousPeriod
        ? calcChangeRate(summary.totalAmount, previousPeriod.totalAmount)
        : null,
      sub: `平均: ${formatAmount(summary.avgAmount)}円`,
    },
    {
      label: "客数",
      value: `${formatAmount(totalCustomers)}人`,
      change: previousCustomers
        ? calcChangeRate(totalCustomers, previousCustomers)
        : null,
      sub: `平均: ${formatAmount(summary.avgQuantity)}人`,
    },
    {
      label: "客単価",
      value: `${formatAmount(avgUnitPrice)}円`,
      change: prevAvgUnitPrice ? calcChangeRate(avgUnitPrice, prevAvgUnitPrice) : null,
      sub: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-1 text-xs text-gray-500">{card.label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{card.value}</span>
            <ChangeIndicator rate={card.change} />
          </div>
          {card.sub && (
            <div className="mt-1 text-xs text-gray-400">{card.sub}</div>
          )}
        </div>
      ))}

      {/* トップ/ボトム */}
      {summary.maxAmount.period && (
        <div className="col-span-1 rounded-lg border border-gray-200 bg-white p-4 sm:col-span-3">
          <div className="flex flex-wrap gap-6 text-xs text-gray-500">
            <span>
              最高売上: <strong className="text-gray-800">{summary.maxAmount.period}</strong>{" "}
              ({formatAmount(summary.maxAmount.value)}円)
            </span>
            <span>
              最低売上: <strong className="text-gray-800">{summary.minAmount.period}</strong>{" "}
              ({formatAmount(summary.minAmount.value)}円)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

</details>

---

### タスク10: 汎用テーブル

**対象ファイル**:

- `app/dashboard/register/components/viewer/DataTable.tsx`（**新規作成**）

**問題点**:

各分析タブで使い回せる汎用テーブルコンポーネントが必要。

**修正内容**:

shadcn/ui Tableをベースに、カラム定義を受け取って動的にレンダリングする汎用テーブルを作成する。モバイル対応として`overflow-x-auto`のラッパーを含む。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/DataTable.tsx（新規作成）
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  align?: "left" | "right";
  format?: (value: T[keyof T], row: T) => string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** 特定行をハイライトする条件（取引管理の訂正行など） */
  highlightRow?: (row: T) => boolean;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  highlightRow,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.align === "right" ? "text-right" : "text-left"}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={i}
              className={highlightRow?.(row) ? "bg-yellow-50" : undefined}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={col.align === "right" ? "text-right" : "text-left"}
                >
                  {col.format
                    ? col.format(row[col.key], row)
                    : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

</details>

---

### タスク11: 曜日別グラフ・売上内訳ドーナツ

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/DayOfWeekChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/charts/SalesBreakdownDonut.tsx`（**新規作成**）

**問題点**:

売上概要タブに表示する曜日別グラフと売上内訳ドーナツチャートが必要。

**修正内容**:

rechartsを使用して、曜日別の売上・客数棒グラフと、売上内訳のドーナツチャート（中央に合計金額表示）を作成する。SSR非対応のため`next/dynamic`で動的インポートする。

<details>
<summary>DayOfWeekChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/DayOfWeekChart.tsx（新規作成）
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { TimeSeriesEntry } from "../../../types";

interface DayOfWeekChartProps {
  timeSeries: TimeSeriesEntry[];
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const chartConfig = {
  avgAmount: {
    label: "売上",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/** 時系列データを曜日ごとに集計 */
function aggregateByDayOfWeek(
  timeSeries: TimeSeriesEntry[]
): Array<{ day: string; avgAmount: number; avgQuantity: number }> {
  const buckets = Array.from({ length: 7 }, () => ({
    totalAmount: 0,
    totalQuantity: 0,
    count: 0,
  }));

  for (const entry of timeSeries) {
    const date = new Date(entry.period);
    const dayIndex = date.getDay();
    buckets[dayIndex].totalAmount += entry.totalAmount;
    buckets[dayIndex].totalQuantity += entry.totalQuantity;
    buckets[dayIndex].count += 1;
  }

  return buckets.map((b, i) => ({
    day: DAY_LABELS[i],
    avgAmount: b.count > 0 ? Math.round(b.totalAmount / b.count) : 0,
    avgQuantity: b.count > 0 ? Math.round(b.totalQuantity / b.count) : 0,
  }));
}

export default function DayOfWeekChart({ timeSeries }: DayOfWeekChartProps) {
  const data = aggregateByDayOfWeek(timeSeries);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">曜日別売上（平均）</h3>
      <ChartContainer config={chartConfig} className="h-62.5 w-full">
        <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${Number(value).toLocaleString("ja-JP")}円`}
              />
            }
          />
          <Bar dataKey="avgAmount" fill="var(--color-avgAmount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

<details>
<summary>SalesBreakdownDonut.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/SalesBreakdownDonut.tsx（新規作成）
"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { AggregatedEntry } from "../../../types";

interface SalesBreakdownDonutProps {
  aggregated: AggregatedEntry[];
  totalAmount: number;
}

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)",
];

export default function SalesBreakdownDonut({
  aggregated,
  totalAmount,
}: SalesBreakdownDonutProps) {
  const data = aggregated
    .filter((e) => e.totalAmount !== 0)
    .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))
    .slice(0, 10);

  if (data.length === 0) return null;

  // データからChartConfigを動的に生成
  const chartConfig = data.reduce<Record<string, { label: string; color: string }>>(
    (acc, entry, i) => {
      acc[entry.itemName] = {
        label: entry.itemName,
        color: COLORS[i % COLORS.length],
      };
      return acc;
    },
    {}
  ) satisfies ChartConfig;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">売上内訳</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalAmount"
            nameKey="itemName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            cornerRadius={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <Label
              position="center"
              content={() => (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-gray-800 text-sm font-bold"
                >
                  {totalAmount.toLocaleString("ja-JP")}円
                </text>
              )}
            />
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${Number(value).toLocaleString("ja-JP")}円`}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

---

### タスク12: 売上概要タブ統合

**対象ファイル**:

- `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`（**新規作成**）
- `app/dashboard/register/components/RegisterPageTabs.tsx`（既存・変更）

**問題点**:

売上概要タブの各コンポーネントを統合し、RegisterDataViewerとして第2層タブ構造を構築する必要がある。

**修正内容**:

1. `SalesOverviewTab`でKPIカード、曜日別グラフ、売上内訳ドーナツを配置
2. `RegisterDataViewer`でフィルタバー（PeriodSelector + MachineFilter）と第2層タブを統合
3. `RegisterPageTabs`のプレースホルダーを`RegisterDataViewer`に置き換え

グラフコンポーネントはSSR非対応のため`next/dynamic`で動的インポートする。

<details>
<summary>SalesOverviewTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx（新規作成）
"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse } from "../../../types";
import KpiCards from "../KpiCards";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";
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

      {/* 項目別テーブル */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">項目別集計</h3>
        <DataTable columns={aggregatedColumns} data={data.aggregated} />
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>RegisterDataViewer.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/RegisterDataViewer.tsx（新規作成）
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { ANALYSIS_TABS } from "../../types";
import { useRegisterData } from "./hooks/useRegisterData";
import PeriodSelector from "./PeriodSelector";
import MachineFilter from "./MachineFilter";
import SalesOverviewTab from "./tabs/SalesOverviewTab";

export default function RegisterDataViewer() {
  const {
    periodType,
    dateFrom,
    dateTo,
    machineNo,
    groupBy,
    machines,
    data,
    isLoading,
    setPeriodType,
    setDateFrom,
    setDateTo,
    setMachineNo,
    setGroupBy,
    navigatePeriod,
  } = useRegisterData("Z001");

  return (
    <div className="space-y-4">
      {/* フィルタバー */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <PeriodSelector
            periodType={periodType}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPeriodTypeChange={setPeriodType}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onNavigate={navigatePeriod}
          />
          <MachineFilter
            machines={machines}
            machineNo={machineNo}
            groupBy={groupBy}
            onMachineNoChange={setMachineNo}
            onGroupByChange={setGroupBy}
          />
        </div>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-400">読み込み中...</div>
        </div>
      )}

      {/* 第2層タブ */}
      {!isLoading && (
        <Tabs defaultValue="overview">
          <TabsList className="w-full overflow-x-auto">
            {ANALYSIS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            {data ? (
              <SalesOverviewTab
                data={data}
                totalCustomers={0}
                previousCustomers={0}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                データがありません
              </div>
            )}
          </TabsContent>

          {/* 他のタブは後続の仕様書で実装 */}
          <TabsContent value="trend">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              売上推移（準備中）
            </div>
          </TabsContent>
          <TabsContent value="hourly">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              時間帯分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="product">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              商品分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="department">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              部門分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="transaction">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              取引管理（準備中）
            </div>
          </TabsContent>
          <TabsContent value="raw">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              明細データ（準備中）
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

</details>

**RegisterPageTabs.tsx の変更**:

プレースホルダーを`RegisterDataViewer`に置き換える。

```tsx
// 変更前（import部分）
import type { ImportSummary } from "../types";
import RegisterImportPage from "./RegisterImportPage";

// 変更後（import部分）
import type { ImportSummary } from "../types";
import RegisterImportPage from "./RegisterImportPage";
import RegisterDataViewer from "./viewer/RegisterDataViewer";
```

```tsx
// 変更前（TabsContent部分）
      <TabsContent value="analysis">
        {/* タスク12でRegisterDataViewerに置き換え */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          売上分析ダッシュボード（準備中）
        </div>
      </TabsContent>

// 変更後
      <TabsContent value="analysis">
        <RegisterDataViewer />
      </TabsContent>
```

---

### タスク13: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **ローカル確認** (`npm run dev`)
   - `/dashboard/register` にアクセスし、「データ取り込み」「売上分析」タブが表示されること
   - 「データ取り込み」タブで既存の取り込み機能が正常動作すること
   - 「売上分析」タブで期間セレクター（日/週/月/年/カスタム）が切り替わること
   - 期間の < > ナビゲーションが動作すること
   - カスタム期間で日付入力が動作すること
   - レジフィルターの「合算」「レジ別」切り替えが動作すること
   - KPIカードに売上合計・客数・客単価・前期比が表示されること
   - 曜日別グラフが棒グラフで表示されること
   - 売上内訳ドーナツチャートが中央に合計金額付きで表示されること
   - 項目別集計テーブルが表示されること
   - 第2層タブ（売上推移、時間帯分析等）がプレースホルダーとして表示されること

## 変更対象ファイル一覧

| ファイル                                                                  | 変更内容                                 |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| `prisma/schema.prisma`                                                    | 4モデル追加（末尾に追記）                |
| `app/dashboard/register/types.ts`                                         | **新規作成**                             |
| `app/dashboard/register/page.tsx`                                         | RegisterPageTabsへの切り替え             |
| `app/dashboard/register/components/RegisterPageTabs.tsx`                  | **新規作成**                             |
| `app/api/register/data/route.ts`                                          | **新規作成**                             |
| `app/api/register/machines/route.ts`                                      | **新規作成**                             |
| `app/dashboard/register/components/viewer/hooks/useRegisterData.ts`       | **新規作成**                             |
| `app/dashboard/register/components/viewer/PeriodSelector.tsx`             | **新規作成**                             |
| `app/dashboard/register/components/viewer/MachineFilter.tsx`              | **新規作成**                             |
| `app/dashboard/register/components/viewer/KpiCards.tsx`                   | **新規作成**                             |
| `app/dashboard/register/components/viewer/DataTable.tsx`                  | **新規作成**                             |
| `app/dashboard/register/components/viewer/charts/DayOfWeekChart.tsx`      | **新規作成**                             |
| `app/dashboard/register/components/viewer/charts/SalesBreakdownDonut.tsx` | **新規作成**                             |
| `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`      | **新規作成**                             |
| `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`         | **新規作成**                             |

## 備考

### 注意事項

- 既存の取り込み機能（`RegisterImportPage.tsx`, `FolderSelector.tsx`, `ImportProgress.tsx`）は変更しないこと
- 既存のAPIルート（`/api/register/diff`, `/api/register/import`）は変更しないこと
- rechartsのグラフコンポーネントは必ず`next/dynamic`で動的インポートすること（SSR非対応）
- `totalCustomers`（客数）はZ009のquantity合計から取得する。本仕様書では仮に0を渡しており、仕様書03（2026-04-05-03-register-dashboard-sales-trend.md）のタスク4でZ009データの取得ロジックを`useRegisterData`フックに組み込み、実値に置き換える

### 参考

- 既存のタブ実装パターン: `app/dashboard/homepage/components/list/ProductListTabs.tsx`
- 既存のAPI実装パターン: `app/api/register/import/route.ts`
- shadcn/ui Tabs: `app/components/ui/tabs.tsx`
- shadcn/ui Chart: `app/components/ui/chart.tsx`（ChartContainer, ChartTooltip, ChartLegend）。内部でrechartsを使用
