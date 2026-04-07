# 売上分析ダッシュボード: 残りの分析タブ（Phase 4）

**日付**: 2026-04-05
**ブランチ**: feature/register-dashboard
**対象**: 時間帯分析・商品分析・取引管理・明細データタブ（部門分析は売上概要・商品分析と重複するため廃止）
**ステータス**: 完了
**完了日**: 2026-04-08

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: API拡張（Z002/Z004/Z005/Z009のtype別処理追加）](#タスク1-api拡張z002z004z005z009のtype別処理追加)
  - [タスク2: 時間帯分析タブ](#タスク2-時間帯分析タブ)
  - [タスク3: 商品分析タブ](#タスク3-商品分析タブ)
  - [タスク4: 部門分析タブ](#タスク4-部門分析タブ)
  - [タスク5: 取引管理タブ](#タスク5-取引管理タブ)
  - [タスク6: 明細データタブ](#タスク6-明細データタブ)
  - [タスク7: RegisterDataViewer変更（全タブ統合）](#タスク7-registerdataviewer変更全タブ統合)
  - [タスク8: 動作確認・ビルドテスト](#タスク8-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                              | 対応課題 | 優先度 | ステータス | 備考                       |
| --- | ----------------------------------- | :------: | :----: | :--------: | -------------------------- |
| 1   | API拡張（Z002/Z004/Z009）          |   1,2    |   高   |    [o]     |                            |
| 2   | 時間帯分析タブ                      |   1,2    |   高   |    [o]     |                            |
| 3   | 商品分析タブ                        |   1,2    |   高   |    [o]     |                            |
| 4   | 部門分析タブ                        |   1,2    |   高   |    [-]     | 廃止（売上概要・商品分析と重複） |
| 5   | 取引管理タブ                        |   1,2    |   中   |    [o]     |                            |
| 6   | 明細データタブ                      |    1     |   中   |    [o]     |                            |
| 7   | RegisterDataViewer変更（全タブ統合）|   1,2    |   高   |    [o]     |                            |
| 8   | 動作確認・ビルドテスト              |    -     |   -    |    [o]     |                            |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了 / `[-]` 廃止

## 改修の目的

### 背景

仕様書02で基盤（タブ構造、API、共通コンポーネント）と売上概要タブを構築済み。仕様書03で売上推移タブを構築済み。本仕様書では残り5つの分析タブ（時間帯分析・商品分析・部門分析・取引管理・明細データ）を実装する。

### 課題

- **課題1**: 時間帯・商品・部門・取引の分析ビューが未実装で、蓄積データを活用できない
- **課題2**: APIが`type=Z001`と`type=Z009`のみ対応しており、Z002/Z004/Z005の取得ができない

### 設計方針

- **方針1**: APIルートに`type`別の分岐を追加し、既存のfetchZ001Dataパターンに倣って各種別のfetch関数を実装する
- **方針2**: 各タブは独自のデータ取得を行う。`useRegisterData`フックの`initialType`を切り替えて使用する
- **方針3**: グラフコンポーネントは全て`next/dynamic`で動的インポートする（shadcn/ui Chartが内部で使用するrechartsがSSR非対応のため）
- **方針4**: 既存のDataTable、KpiCards、SalesBreakdownDonutのパターンを踏襲する

## タスク詳細

### タスク1: API拡張（Z002/Z004/Z005/Z009のtype別処理追加）

**対象ファイル**:

- `app/api/register/data/route.ts`（既存・変更）
- `app/dashboard/register/types.ts`（既存・変更）

**問題点**:

現在のAPIは`type=Z001`と`type=Z009`のみ対応しており、時間帯分析（Z009詳細）、商品分析（Z004）、部門分析（Z005）、取引管理（Z002）のデータを取得できない。

**修正内容**:

1. `types.ts`に各タブ用のレスポンス型を追加する
2. `route.ts`にfetchZ002Data、fetchZ004Data、fetchZ005Data、fetchZ009DetailData関数を追加する
3. GETハンドラの`type`分岐に`Z002`、`Z004`、`Z005`、`Z009_DETAIL`を追加する

**types.ts の末尾に追加**:

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/dashboard/register/types.ts に追加する型定義

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

/** Z005 部門データ1件 */
export interface DepartmentEntry {
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
}

/** Z005 部門別推移データ1件 */
export interface DepartmentTrendEntry {
  period: string;
  [departmentName: string]: string | number;
}

/** Z005 部門分析レスポンス */
export interface DepartmentAnalysisResponse {
  departments: DepartmentEntry[];
  trend: DepartmentTrendEntry[];
  totalAmount: number;
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
```

</details>

**route.ts に追加するfetch関数と分岐**:

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// app/api/register/data/route.ts に追加するimport（既存のimportに追記）
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
  HourlyAnalysisResponse,
  HourlyEntry,
  HourlyHeatmapEntry,
  ProductAnalysisResponse,
  ProductEntry,
  DepartmentAnalysisResponse,
  DepartmentEntry,
  DepartmentTrendEntry,
  TransactionAnalysisResponse,
  TransactionEntry,
  RawDataResponse,
  RawDataEntry,
} from "@/app/dashboard/register/types";

/** Z002 取引キーデータを取得 */
async function fetchZ002Data(
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
      prisma.registerTransactionKey.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z002)"
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

/** Z004 商品売上データを取得 */
async function fetchZ004Data(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ itemCode: string; itemName: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerProductSale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z004)"
  ).then((rows) =>
    rows.map((r) => ({
      itemCode: r.itemCode,
      itemName: r.itemName,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** Z005 部門売上データを取得 */
async function fetchZ005Data(
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
      prisma.registerDepartmentSale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z005)"
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

/** Z009 時間帯別詳細データを取得（時間帯分析タブ用） */
async function fetchZ009DetailData(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ startTime: string; endTime: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
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
    "GET /api/register/data (Z009 detail)"
  ).then((rows) =>
    rows.map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** 明細データを取得（全種別対応） */
async function fetchRawData(
  type: string,
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<RawDataEntry[]> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  const settlementSelect = { date: true, time: true, machineNo: true } as const;

  switch (type) {
    case "Z001": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerSalesSummary.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z001)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0],
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z002": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerTransactionKey.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z002)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0],
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z004": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerProductSale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z004)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0],
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemCode: r.itemCode,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z005": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerDepartmentSale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z005)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0],
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z009": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerHourlySale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z009)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0],
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: `${r.startTime}-${r.endTime}`,
        startTime: r.startTime,
        endTime: r.endTime,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    default:
      return [];
  }
}
```

</details>

**route.ts のGETハンドラに追加する分岐**:

既存の `if (type === "Z001" || type === "Z009") { ... }` ブロックの直後（`throw new ValidationError` の直前）に以下を追加する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
  // 以下を既存の Z001/Z009 分岐の後に追加

  // Z009_DETAIL: 時間帯分析タブ用
  if (type === "Z009_DETAIL") {
    const rows = await fetchZ009DetailData(from, to, machineNo);

    // 時間帯別集計（期間内平均）
    const hourlyMap = new Map<string, { totalQuantity: number; totalAmount: number; count: number }>();
    for (const r of rows) {
      const key = `${r.startTime}-${r.endTime}`;
      const entry = hourlyMap.get(key) ?? { totalQuantity: 0, totalAmount: 0, count: 0 };
      entry.totalQuantity += r.quantity;
      entry.totalAmount += r.amount;
      entry.count += 1;
      hourlyMap.set(key, entry);
    }

    // 日数を計算（平均に使用）
    const dateSet = new Set(rows.map((r) => r.date.toISOString().split("T")[0]));
    const dayCount = dateSet.size || 1;

    const hourly: HourlyEntry[] = [...hourlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [startTime, endTime] = key.split("-");
        return {
          startTime,
          endTime,
          totalQuantity: Math.round(val.totalQuantity / dayCount),
          totalAmount: Math.round(val.totalAmount / dayCount),
        };
      });

    // 曜日x時間帯ヒートマップ
    const heatmapMap = new Map<string, { totalAmount: number; totalQuantity: number }>();
    for (const r of rows) {
      const dayOfWeek = r.date.getDay();
      const key = `${dayOfWeek}-${r.startTime}`;
      const entry = heatmapMap.get(key) ?? { totalAmount: 0, totalQuantity: 0 };
      entry.totalAmount += r.amount;
      entry.totalQuantity += r.quantity;
      heatmapMap.set(key, entry);
    }

    const heatmap: HourlyHeatmapEntry[] = [...heatmapMap.entries()]
      .map(([key, val]) => {
        const [dow, startTime] = key.split("-");
        return {
          dayOfWeek: parseInt(dow, 10),
          startTime,
          totalAmount: val.totalAmount,
          totalQuantity: val.totalQuantity,
        };
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

    const response: HourlyAnalysisResponse = { hourly, heatmap };
    return apiSuccess(response);
  }

  // Z004: 商品分析タブ用
  if (type === "Z004") {
    const rows = await fetchZ004Data(from, to, machineNo);

    // 商品別集計
    const productMap = new Map<string, { itemCode: string; quantity: number; amount: number }>();
    for (const r of rows) {
      const key = r.itemCode;
      const entry = productMap.get(key) ?? { itemCode: r.itemCode, quantity: 0, amount: 0 };
      entry.quantity += r.quantity;
      entry.amount += r.amount;
      productMap.set(key, entry);
    }

    // 金額降順でソート
    const sorted = [...productMap.entries()]
      .map(([, val]) => ({
        itemCode: val.itemCode,
        itemName: rows.find((r) => r.itemCode === val.itemCode)?.itemName ?? val.itemCode,
        totalQuantity: val.quantity,
        totalAmount: val.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // ABC分析: 累積構成比を計算してランク付け
    const totalAmount = sorted.reduce((sum, p) => sum + p.totalAmount, 0);
    let cumulative = 0;
    const products: ProductEntry[] = sorted.map((p) => {
      cumulative += p.totalAmount;
      const ratio = totalAmount > 0 ? Math.round((cumulative / totalAmount) * 1000) / 10 : 0;
      const rank: "A" | "B" | "C" = ratio <= 70 ? "A" : ratio <= 90 ? "B" : "C";
      return { ...p, rank, cumulativeRatio: ratio };
    });

    const response: ProductAnalysisResponse = { products };
    return apiSuccess(response);
  }

  // Z005: 部門分析タブ用
  if (type === "Z005") {
    const rows = await fetchZ005Data(from, to, machineNo);

    // 部門別集計
    const deptMap = new Map<string, { quantity: number; amount: number }>();
    for (const r of rows) {
      const entry = deptMap.get(r.itemName) ?? { quantity: 0, amount: 0 };
      entry.quantity += r.quantity;
      entry.amount += r.amount;
      deptMap.set(r.itemName, entry);
    }

    const departments: DepartmentEntry[] = [...deptMap.entries()]
      .map(([name, val]) => ({
        itemName: name,
        totalQuantity: val.quantity,
        totalAmount: val.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const totalAmount = departments.reduce((sum, d) => sum + d.totalAmount, 0);

    // 部門別推移（粒度に応じて集約）
    const periodKeys = generatePeriodKeys(dateFrom, dateTo, granularity);
    const trendMap = new Map<string, Record<string, number>>();
    for (const key of periodKeys) {
      trendMap.set(key, {});
    }
    for (const r of rows) {
      const dateStr = r.date.toISOString().split("T")[0];
      const key = toGranularityKey(dateStr, granularity);
      const periodData = trendMap.get(key);
      if (periodData) {
        periodData[r.itemName] = (periodData[r.itemName] ?? 0) + r.amount;
      }
    }

    const trend: DepartmentTrendEntry[] = periodKeys.map((key) => ({
      period: key,
      ...trendMap.get(key),
    }));

    const response: DepartmentAnalysisResponse = { departments, trend, totalAmount };
    return apiSuccess(response);
  }

  // Z002: 取引管理タブ用
  if (type === "Z002") {
    const rows = await fetchZ002Data(from, to, machineNo);

    // 項目別集計
    const txMap = new Map<string, { quantity: number; amount: number }>();
    for (const r of rows) {
      const entry = txMap.get(r.itemName) ?? { quantity: 0, amount: 0 };
      entry.quantity += r.quantity;
      entry.amount += r.amount;
      txMap.set(r.itemName, entry);
    }

    const transactions: TransactionEntry[] = [...txMap.entries()]
      .map(([name, val]) => ({
        itemName: name,
        totalQuantity: val.quantity,
        totalAmount: val.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 訂正関連の集計
    const correctionRows = transactions.filter((t) => t.itemName.includes("訂正"));
    const correctionCount = correctionRows.reduce((sum, t) => sum + t.totalQuantity, 0);
    const correctionAmount = correctionRows.reduce((sum, t) => sum + t.totalAmount, 0);

    // 訂正件数・金額の時系列推移
    const correctionTimeSeries = buildTimeSeries(
      rows
        .filter((r) => r.itemName.includes("訂正"))
        .map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      granularity
    );

    const response: TransactionAnalysisResponse = {
      transactions,
      timeSeries: correctionTimeSeries,
      correctionCount,
      correctionAmount,
    };
    return apiSuccess(response);
  }

  // RAW: 明細データタブ用
  if (type === "RAW_Z001" || type === "RAW_Z002" || type === "RAW_Z004" || type === "RAW_Z005" || type === "RAW_Z009") {
    const rawType = type.replace("RAW_", "");
    const rawRows = await fetchRawData(rawType, from, to, machineNo);
    const response: RawDataResponse = { rows: rawRows };
    return apiSuccess(response);
  }
```

</details>

---

### タスク2: 時間帯分析タブ

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/HourlyChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/charts/HourlyHeatmap.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/tabs/HourlyAnalysisTab.tsx`（**新規作成**）

**問題点**:

時間帯別の売上・客数分布と、曜日x時間帯のヒートマップを表示する手段がない。

**修正内容**:

1. `HourlyChart` - 時間帯別の二軸ComposedChart（棒=売上、折れ線=客数、期間内平均）
2. `HourlyHeatmap` - divベースの7曜日x時間帯数のグリッド。色の濃さで売上を表現する
3. `HourlyAnalysisTab` - 上記2コンポーネントを配置

<details>
<summary>HourlyChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/HourlyChart.tsx（新規作成）
"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { HourlyEntry } from "../../../types";

interface HourlyChartProps {
  hourly: HourlyEntry[];
}

const chartConfig = {
  売上: {
    label: "売上",
    color: "var(--chart-1)",
  },
  客数: {
    label: "客数",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function HourlyChart({ hourly }: HourlyChartProps) {
  const data = hourly.map((h) => ({
    time: `${h.startTime}`,
    売上: h.totalAmount,
    客数: h.totalQuantity,
  }));

  if (data.length === 0) return null;

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">
        時間帯別 売上・客数（期間内平均）
      </h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${v}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {name === "売上"
                          ? `${Number(value).toLocaleString("ja-JP")}円`
                          : `${Number(value).toLocaleString("ja-JP")}人`}
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar yAxisId="left" dataKey="売上" fill="var(--color-売上)" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="客数"
            stroke="var(--color-客数)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

<details>
<summary>HourlyHeatmap.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/HourlyHeatmap.tsx（新規作成）
"use client";

import { Fragment } from "react";
import type { HourlyHeatmapEntry } from "../../../types";

interface HourlyHeatmapProps {
  heatmap: HourlyHeatmapEntry[];
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** 金額に応じた背景色クラスを返す（濃さ5段階） */
function getIntensityClass(value: number, maxValue: number): string {
  if (maxValue === 0 || value === 0) return "bg-solid-gray-50";
  const ratio = value / maxValue;
  if (ratio < 0.2) return "bg-indigo-100";
  if (ratio < 0.4) return "bg-indigo-200";
  if (ratio < 0.6) return "bg-indigo-300";
  if (ratio < 0.8) return "bg-indigo-400 text-white";
  return "bg-indigo-600 text-white";
}

export default function HourlyHeatmap({ heatmap }: HourlyHeatmapProps) {
  if (heatmap.length === 0) return null;

  // 時間帯のリストを取得（ソート済み）
  const timeSlots = [...new Set(heatmap.map((h) => h.startTime))].sort();

  // 最大値を取得（色の正規化に使用）
  const maxAmount = Math.max(...heatmap.map((h) => h.totalAmount), 1);

  // 曜日x時間帯のマトリクスを構築
  const matrix = new Map<string, number>();
  for (const h of heatmap) {
    matrix.set(`${h.dayOfWeek}-${h.startTime}`, h.totalAmount);
  }

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">
        曜日 x 時間帯ヒートマップ（売上）
      </h3>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(2.5rem, 1fr))` }}>
          {/* ヘッダー行: 時間帯 */}
          <div className="p-1" />
          {timeSlots.map((time) => (
            <div
              key={time}
              className="p-1 text-center text-xs text-solid-gray-536"
            >
              {time}
            </div>
          ))}

          {/* データ行: 曜日ごと */}
          {DAY_LABELS.map((dayLabel, dayIndex) => (
            <Fragment key={dayIndex}>
              <div
                className="flex items-center p-1 text-xs font-medium text-solid-gray-600"
              >
                {dayLabel}
              </div>
              {timeSlots.map((time) => {
                const value = matrix.get(`${dayIndex}-${time}`) ?? 0;
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className={`flex items-center justify-center rounded p-1 text-xs ${getIntensityClass(value, maxAmount)}`}
                    title={`${dayLabel} ${time}: ${value.toLocaleString("ja-JP")}円`}
                  >
                    {value > 0 ? `${(value / 1000).toFixed(0)}k` : ""}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-3 flex items-center gap-2 text-xs text-solid-gray-536">
        <span>低</span>
        <div className="flex gap-0.5">
          <div className="h-4 w-4 rounded bg-solid-gray-50" />
          <div className="h-4 w-4 rounded bg-indigo-100" />
          <div className="h-4 w-4 rounded bg-indigo-200" />
          <div className="h-4 w-4 rounded bg-indigo-300" />
          <div className="h-4 w-4 rounded bg-indigo-400" />
          <div className="h-4 w-4 rounded bg-indigo-600" />
        </div>
        <span>高</span>
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>HourlyAnalysisTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/HourlyAnalysisTab.tsx（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { HourlyAnalysisResponse } from "../../../types";

const HourlyChart = dynamic(() => import("../charts/HourlyChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-100" />,
});

const HourlyHeatmap = dynamic(() => import("../charts/HourlyHeatmap"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-100" />,
});

interface HourlyAnalysisTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

export default function HourlyAnalysisTab({
  dateFrom,
  dateTo,
  machineNo,
}: HourlyAnalysisTabProps) {
  const [data, setData] = useState<HourlyAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z009_DETAIL",
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<HourlyAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-solid-gray-420">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-420">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HourlyChart hourly={data.hourly} />
      <HourlyHeatmap heatmap={data.heatmap} />
    </div>
  );
}
```

</details>

---

### タスク3: 商品分析タブ

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/ProductParetoChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/tabs/ProductAnalysisTab.tsx`（**新規作成**）

**問題点**:

商品のABC分析（パレート図）と全件テーブルを表示する手段がない。

**修正内容**:

1. `ProductParetoChart` - TOP10のComposedChart（棒=個別売上、折れ線=累積構成比%、二軸）。A/B/Cランク境界にReferenceLineで70%/90%に水平線
2. `ProductAnalysisTab` - パレート図 + 全件テーブル（ランク列付き）

<details>
<summary>ProductParetoChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/ProductParetoChart.tsx（新規作成）
"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { ProductEntry } from "../../../types";

interface ProductParetoChartProps {
  products: ProductEntry[];
}

const chartConfig = {
  売上: {
    label: "売上",
    color: "var(--chart-1)",
  },
  累積構成比: {
    label: "累積構成比",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function ProductParetoChart({ products }: ProductParetoChartProps) {
  const top10 = products.slice(0, 10);

  if (top10.length === 0) return null;

  const data = top10.map((p) => ({
    name: p.itemName.length > 8 ? `${p.itemName.slice(0, 8)}...` : p.itemName,
    fullName: p.itemName,
    売上: p.totalAmount,
    累積構成比: p.cumulativeRatio,
  }));

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">
        ABC分析（売上TOP10 パレート図）
      </h3>
      <ChartContainer config={chartConfig} className="h-87.5 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {name === "売上"
                          ? `${Number(value).toLocaleString("ja-JP")}円`
                          : `${value}%`}
                      </span>
                    </div>
                  </>
                )}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName ?? label;
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <ReferenceLine
            yAxisId="right"
            y={70}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{ value: "A (70%)", position: "right", fill: "#22c55e", fontSize: 11 }}
          />
          <ReferenceLine
            yAxisId="right"
            y={90}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: "B (90%)", position: "right", fill: "#f59e0b", fontSize: 11 }}
          />
          <Bar yAxisId="left" dataKey="売上" fill="var(--color-売上)" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="累積構成比"
            stroke="var(--color-累積構成比)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

<details>
<summary>ProductAnalysisTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/ProductAnalysisTab.tsx（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { ProductAnalysisResponse, ProductEntry } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const ProductParetoChart = dynamic(() => import("../charts/ProductParetoChart"), {
  ssr: false,
  loading: () => <div className="h-87.5 animate-pulse rounded-8 bg-solid-gray-100" />,
});

interface ProductAnalysisTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

const productColumns: ColumnDef<ProductEntry>[] = [
  { key: "rank", label: "ランク" },
  { key: "itemCode", label: "商品コード" },
  { key: "itemName", label: "商品名" },
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
  {
    key: "cumulativeRatio",
    label: "累積構成比",
    align: "right",
    format: (v) => `${v}%`,
  },
];

export default function ProductAnalysisTab({
  dateFrom,
  dateTo,
  machineNo,
}: ProductAnalysisTabProps) {
  const [data, setData] = useState<ProductAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z004",
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<ProductAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-solid-gray-420">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-420">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductParetoChart products={data.products} />

      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">商品一覧（ABC分析）</h3>
        <DataTable columns={productColumns} data={data.products} />
      </div>
    </div>
  );
}
```

</details>

---

### タスク4: 部門分析タブ

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/DepartmentDonutChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/charts/DepartmentTrendChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/tabs/DepartmentAnalysisTab.tsx`（**新規作成**）

**問題点**:

部門別の売上構成と推移を表示する手段がない。

**修正内容**:

1. `DepartmentDonutChart` - SalesBreakdownDonut.tsxと同様のドーナツチャート（中央に合計金額表示）
2. `DepartmentTrendChart` - 部門別積み上げ棒グラフ（stackIdを使用）
3. `DepartmentAnalysisTab` - ドーナツ + 積み上げ棒 + テーブル

<details>
<summary>DepartmentDonutChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/DepartmentDonutChart.tsx（新規作成）
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
import type { DepartmentEntry } from "../../../types";

interface DepartmentDonutChartProps {
  departments: DepartmentEntry[];
  totalAmount: number;
}

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)",
];

export default function DepartmentDonutChart({
  departments,
  totalAmount,
}: DepartmentDonutChartProps) {
  const data = departments
    .filter((d) => d.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  if (data.length === 0) return null;

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
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">部門別売上構成</h3>
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
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
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

<details>
<summary>DepartmentTrendChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/DepartmentTrendChart.tsx（新規作成）
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { DepartmentTrendEntry } from "../../../types";

interface DepartmentTrendChartProps {
  trend: DepartmentTrendEntry[];
  departmentNames: string[];
}

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)",
];

export default function DepartmentTrendChart({
  trend,
  departmentNames,
}: DepartmentTrendChartProps) {
  if (trend.length === 0) return null;

  const chartConfig = departmentNames.reduce<Record<string, { label: string; color: string }>>(
    (acc, name, i) => {
      acc[name] = {
        label: name,
        color: COLORS[i % COLORS.length],
      };
      return acc;
    },
    {}
  ) satisfies ChartConfig;

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">部門別推移（積み上げ）</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <BarChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {departmentNames.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="dept"
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

<details>
<summary>DepartmentAnalysisTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/DepartmentAnalysisTab.tsx（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { DepartmentAnalysisResponse, DepartmentEntry, Granularity } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const DepartmentDonutChart = dynamic(() => import("../charts/DepartmentDonutChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-100" />,
});

const DepartmentTrendChart = dynamic(() => import("../charts/DepartmentTrendChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-100" />,
});

interface DepartmentAnalysisTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  granularity: Granularity;
}

const departmentColumns: ColumnDef<DepartmentEntry>[] = [
  { key: "itemName", label: "部門名" },
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

export default function DepartmentAnalysisTab({
  dateFrom,
  dateTo,
  machineNo,
  granularity,
}: DepartmentAnalysisTabProps) {
  const [data, setData] = useState<DepartmentAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z005",
        dateFrom,
        dateTo,
        granularity,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<DepartmentAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-solid-gray-420">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-420">
        データがありません
      </div>
    );
  }

  const departmentNames = data.departments.map((d) => d.itemName);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DepartmentDonutChart
          departments={data.departments}
          totalAmount={data.totalAmount}
        />
        <DepartmentTrendChart
          trend={data.trend}
          departmentNames={departmentNames}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">部門別集計</h3>
        <DataTable columns={departmentColumns} data={data.departments} />
      </div>
    </div>
  );
}
```

</details>

---

### タスク5: 取引管理タブ

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/TransactionChart.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/tabs/TransactionTab.tsx`（**新規作成**）

**問題点**:

取引キー（Z002）の訂正件数・金額の推移や集計を表示する手段がない。

**修正内容**:

1. `TransactionChart` - 訂正件数・金額の推移棒グラフ
2. `TransactionTab` - KPIカード（訂正合計件数・金額）+ 推移グラフ + 全件テーブル（「訂正」を含む行をハイライト）

<details>
<summary>TransactionChart.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/TransactionChart.tsx（新規作成）
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { TimeSeriesEntry } from "../../../types";

interface TransactionChartProps {
  timeSeries: TimeSeriesEntry[];
}

const chartConfig = {
  訂正金額: {
    label: "訂正金額",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function TransactionChart({ timeSeries }: TransactionChartProps) {
  const hasData = timeSeries.some((e) => e.totalAmount !== 0 || e.totalQuantity !== 0);
  if (!hasData) return null;

  const data = timeSeries.map((e) => ({
    period: e.period,
    訂正金額: Math.abs(e.totalAmount),
  }));

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-solid-gray-700">訂正金額の推移</h3>
      <ChartContainer config={chartConfig} className="h-62.5 w-full">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <Bar dataKey="訂正金額" fill="var(--color-訂正金額)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

<details>
<summary>TransactionTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/TransactionTab.tsx（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { TransactionAnalysisResponse, TransactionEntry, Granularity } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const TransactionChart = dynamic(() => import("../charts/TransactionChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-8 bg-solid-gray-100" />,
});

interface TransactionTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  granularity: Granularity;
}

const transactionColumns: ColumnDef<TransactionEntry>[] = [
  { key: "itemName", label: "項目名" },
  {
    key: "totalQuantity",
    label: "件数",
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

export default function TransactionTab({
  dateFrom,
  dateTo,
  machineNo,
  granularity,
}: TransactionTabProps) {
  const [data, setData] = useState<TransactionAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z002",
        dateFrom,
        dateTo,
        granularity,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<TransactionAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-solid-gray-420">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-420">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIカード: 訂正合計 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
          <div className="mb-1 text-xs text-solid-gray-536">訂正合計件数</div>
          <div className="text-xl font-bold text-gray-900">
            {data.correctionCount.toLocaleString("ja-JP")}件
          </div>
        </div>
        <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
          <div className="mb-1 text-xs text-solid-gray-536">訂正合計金額</div>
          <div className="text-xl font-bold text-gray-900">
            {data.correctionAmount.toLocaleString("ja-JP")}円
          </div>
        </div>
      </div>

      {/* 訂正推移グラフ */}
      <TransactionChart timeSeries={data.timeSeries} />

      {/* 取引キー全件テーブル（「訂正」を含む行をハイライト） */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">取引キー集計</h3>
        <DataTable
          columns={transactionColumns}
          data={data.transactions}
          highlightRow={(row) => row.itemName.includes("訂正")}
        />
      </div>
    </div>
  );
}
```

</details>

---

### タスク6: 明細データタブ

**対象ファイル**:

- `app/dashboard/register/components/viewer/tabs/RawDataTab.tsx`（**新規作成**）

**問題点**:

各CSV種別の生データを確認する手段がない。

**修正内容**:

CSV種別（Z001/Z002/Z004/Z005/Z009）のセレクトボックスで切り替え、選択した種別の生データをDataTableで表示する。settlement情報（date, time, machineNo）付き。

<details>
<summary>RawDataTab.tsx 実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/RawDataTab.tsx（新規作成）
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { RawDataResponse, RawDataEntry, RegisterDataType } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

interface RawDataTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

const DATA_TYPE_OPTIONS: { value: RegisterDataType; label: string }[] = [
  { value: "Z001", label: "Z001 - 売上明細" },
  { value: "Z002", label: "Z002 - 取引キー" },
  { value: "Z004", label: "Z004 - 商品売上" },
  { value: "Z005", label: "Z005 - 部門売上" },
  { value: "Z009", label: "Z009 - 時間帯別売上" },
];

const baseColumns: ColumnDef<RawDataEntry>[] = [
  { key: "date", label: "日付" },
  { key: "time", label: "時刻" },
  { key: "machineNo", label: "レジ番号" },
  { key: "recordNo", label: "No", align: "right" },
];

/** 種別に応じたカラム定義を返す */
function getColumnsForType(type: RegisterDataType): ColumnDef<RawDataEntry>[] {
  switch (type) {
    case "Z004":
      return [
        ...baseColumns,
        { key: "itemCode", label: "商品コード" },
        { key: "itemName", label: "商品名" },
        {
          key: "quantity",
          label: "数量",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
    case "Z009":
      return [
        ...baseColumns,
        { key: "startTime", label: "開始時刻" },
        { key: "endTime", label: "終了時刻" },
        {
          key: "quantity",
          label: "客数",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
    default:
      return [
        ...baseColumns,
        { key: "itemName", label: "項目名" },
        {
          key: "quantity",
          label: "数量",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
  }
}

export default function RawDataTab({
  dateFrom,
  dateTo,
  machineNo,
}: RawDataTabProps) {
  const [selectedType, setSelectedType] = useState<RegisterDataType>("Z001");
  const [data, setData] = useState<RawDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: `RAW_${selectedType}`,
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<RawDataResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, dateFrom, dateTo, machineNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = getColumnsForType(selectedType);

  return (
    <div className="space-y-4">
      {/* 種別セレクトボックス */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-solid-gray-700">データ種別:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as RegisterDataType)}
          className="rounded-6 border border-solid-gray-420 px-3 py-1.5 text-sm"
        >
          {DATA_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-solid-gray-420">読み込み中...</div>
        </div>
      )}

      {/* データテーブル */}
      {!isLoading && data && (
        <div>
          <div className="mb-2 text-xs text-solid-gray-536">{data.rows.length}件</div>
          <DataTable columns={columns} data={data.rows} />
        </div>
      )}
    </div>
  );
}
```

</details>

---

### タスク7: RegisterDataViewer変更（全タブ統合）

**対象ファイル**:

- `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`（既存・変更）

**問題点**:

RegisterDataViewerの各分析タブがプレースホルダー（「準備中」）のまま。

**修正内容**:

5つのプレースホルダーを実装コンポーネントに置き換える。各タブにはフィルタバーから取得した`dateFrom`、`dateTo`、`machineNo`、`granularity`を渡す。

**import部分の変更**:

```tsx
// 変更前
import SalesOverviewTab from "./tabs/SalesOverviewTab";

// 変更後
import SalesOverviewTab from "./tabs/SalesOverviewTab";
import HourlyAnalysisTab from "./tabs/HourlyAnalysisTab";
import ProductAnalysisTab from "./tabs/ProductAnalysisTab";
import DepartmentAnalysisTab from "./tabs/DepartmentAnalysisTab";
import TransactionTab from "./tabs/TransactionTab";
import RawDataTab from "./tabs/RawDataTab";
```

**TabsContent部分の変更（hourly）**:

```tsx
// 変更前
          <TabsContent value="hourly">
            <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-solid-gray-536">
              時間帯分析（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="hourly">
            <HourlyAnalysisTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
```

**TabsContent部分の変更（product）**:

```tsx
// 変更前
          <TabsContent value="product">
            <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-solid-gray-536">
              商品分析（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="product">
            <ProductAnalysisTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
```

**TabsContent部分の変更（department）**:

```tsx
// 変更前
          <TabsContent value="department">
            <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-solid-gray-536">
              部門分析（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="department">
            <DepartmentAnalysisTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
              granularity={granularity}
            />
          </TabsContent>
```

**TabsContent部分の変更（transaction）**:

```tsx
// 変更前
          <TabsContent value="transaction">
            <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-solid-gray-536">
              取引管理（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="transaction">
            <TransactionTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
              granularity={granularity}
            />
          </TabsContent>
```

**TabsContent部分の変更（raw）**:

```tsx
// 変更前
          <TabsContent value="raw">
            <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-solid-gray-536">
              明細データ（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="raw">
            <RawDataTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
```

**注**: `useRegisterData`フックからの`granularity`のdestructureは仕様書03で対応済み。追加変更は不要。

---

### タスク8: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **ローカル確認** (`npm run dev`)
   - 「時間帯分析」タブで時間帯別二軸グラフ（棒=売上、折れ線=客数）が表示されること
   - 曜日x時間帯ヒートマップが色の濃さで売上を表現していること
   - 「商品分析」タブでパレート図（棒=売上、折れ線=累積構成比%）が表示されること
   - パレート図に70%/90%のA/B/Cランク境界線が表示されること
   - 商品一覧テーブルにランク列（A/B/C）が表示されること
   - 「部門分析」タブでドーナツチャート（中央に合計金額）が表示されること
   - 部門別推移の積み上げ棒グラフが表示されること
   - 「取引管理」タブで訂正合計件数・金額のKPIカードが表示されること
   - 訂正推移グラフが表示されること
   - 取引キーテーブルで「訂正」を含む行がbg-yellow-50でハイライトされること
   - 「明細データ」タブでCSV種別セレクトボックスが切り替わること
   - 種別切り替え時にテーブルカラムが種別に応じて変わること（Z004は商品コード列、Z009は開始/終了時刻列）
   - 期間セレクターの変更が各タブに反映されること

## 変更対象ファイル一覧

| ファイル                                                                          | 変更内容                              |
| --------------------------------------------------------------------------------- | ------------------------------------- |
| `app/dashboard/register/types.ts`                                                 | 型定義追加（末尾に追記）              |
| `app/api/register/data/route.ts`                                                  | fetch関数とtype別分岐の追加           |
| `app/dashboard/register/components/viewer/charts/HourlyChart.tsx`                 | **新規作成**                          |
| `app/dashboard/register/components/viewer/charts/HourlyHeatmap.tsx`               | **新規作成**                          |
| `app/dashboard/register/components/viewer/charts/ProductParetoChart.tsx`           | **新規作成**                          |
| `app/dashboard/register/components/viewer/charts/DepartmentDonutChart.tsx`         | **新規作成**                          |
| `app/dashboard/register/components/viewer/charts/DepartmentTrendChart.tsx`         | **新規作成**                          |
| `app/dashboard/register/components/viewer/charts/TransactionChart.tsx`             | **新規作成**                          |
| `app/dashboard/register/components/viewer/tabs/HourlyAnalysisTab.tsx`             | **新規作成**                          |
| `app/dashboard/register/components/viewer/tabs/ProductAnalysisTab.tsx`             | **新規作成**                          |
| `app/dashboard/register/components/viewer/tabs/DepartmentAnalysisTab.tsx`          | **新規作成**                          |
| `app/dashboard/register/components/viewer/tabs/TransactionTab.tsx`                 | **新規作成**                          |
| `app/dashboard/register/components/viewer/tabs/RawDataTab.tsx`                     | **新規作成**                          |
| `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`                  | プレースホルダーを実装コンポーネントに置換 |

## 備考

### 注意事項

- 実装例は仕様書03で行った追加変更（DSトークン、withLoadingパターン、ツールチップ改善等）を反映済み
- 仕様書02（基盤 + 売上概要タブ）および仕様書03（売上推移タブ）が完了していることが前提
- 既存の取り込み機能（`RegisterImportPage.tsx`, `FolderSelector.tsx`, `ImportProgress.tsx`）は変更しないこと
- 既存のAPIルート（`/api/register/diff`, `/api/register/import`）は変更しないこと
- 既存のグラフコンポーネント（`DayOfWeekChart.tsx`, `SalesBreakdownDonut.tsx`）は変更しないこと
- shadcn/ui Chartのグラフコンポーネントは必ず`next/dynamic`で動的インポートすること（内部のrechartsがSSR非対応）
- `HourlyHeatmap`はグラフライブラリではなくdivベースのグリッドで実装する（ヒートマップの標準コンポーネントがないため）
- APIの`type`パラメータに`Z009_DETAIL`や`RAW_Z001`〜`RAW_Z009`を使用するが、これらは`RegisterDataType`型（`"Z001" | "Z002" | "Z004" | "Z005" | "Z009"`）には含まれない。APIルートのGETハンドラでは文字列として直接比較するため型定義の変更は不要だが、明細データタブの`RawDataTab.tsx`では`RegisterDataType`型のセレクトボックスから選択した値に`RAW_`プレフィックスを付けてAPIに送信する設計としている

### データ構造の対応表

| タブ         | API type      | Prismaモデル           | 主要フィールド                          |
| ------------ | ------------- | ---------------------- | --------------------------------------- |
| 時間帯分析   | Z009_DETAIL   | RegisterHourlySale     | startTime, endTime, quantity, amount    |
| 商品分析     | Z004          | RegisterProductSale    | itemCode, itemName, quantity, amount    |
| 部門分析     | Z005          | RegisterDepartmentSale | itemName, quantity, amount              |
| 取引管理     | Z002          | RegisterTransactionKey | itemName, quantity, amount              |
| 明細データ   | RAW_Z001〜Z009| 全モデル                | 種別に応じた全フィールド                |

### 参考

- 既存のグラフ実装パターン（shadcn/ui Chart使用）: `app/dashboard/register/components/viewer/charts/DayOfWeekChart.tsx`
- 既存のドーナツ実装パターン（shadcn/ui Chart使用）: `app/dashboard/register/components/viewer/charts/SalesBreakdownDonut.tsx`
- 既存のテーブル実装パターン: `app/dashboard/register/components/viewer/DataTable.tsx`
- 既存のAPI実装パターン: `app/api/register/data/route.ts`（fetchZ001Data関数）
