# 売上分析ダッシュボード: 売上推移タブ（Phase 3）

**日付**: 2026-04-05
**ブランチ**: feature/register-dashboard
**対象**: 売上推移タブ（SalesTrendChart, CustomerTrendChart, SalesTrendTab, RegisterDataViewer変更）
**ステータス**: 未着手
**完了日**: -

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: 売上推移グラフの作成](#タスク1-売上推移グラフの作成)
  - [タスク2: 客数・客単価推移グラフの作成](#タスク2-客数客単価推移グラフの作成)
  - [タスク3: 売上推移タブ統合コンポーネントの作成](#タスク3-売上推移タブ統合コンポーネントの作成)
  - [タスク4: RegisterDataViewerの変更](#タスク4-registerdataviewerの変更)
  - [タスク5: 動作確認・ビルドテスト](#タスク5-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                                       | 対応課題 | 優先度 | ステータス | 備考                   |
| --- | -------------------------------------------- | :------: | :----: | :--------: | ---------------------- |
| 1   | 売上推移グラフの作成                         |   1,2    |   高   |    [ ]     |                        |
| 2   | 客数・客単価推移グラフの作成                 |   1,3    |   高   |    [ ]     | タスク1と並列実行可能  |
| 3   | 売上推移タブ統合コンポーネント作成           |   1,2,3  |   高   |    [ ]     |                        |
| 4   | RegisterDataViewerの変更 + 客数取得の改修    |   1,4    |   高   |    [ ]     |                        |
| 5   | 動作確認・ビルドテスト                       |    -     |   -    |    [ ]     |                        |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

## 改修の目的

### 背景

仕様書02（2026-04-05-02-register-dashboard-foundation.md）で売上分析ダッシュボードの基盤（タブ構造、API、共通コンポーネント）と「売上概要」タブを構築済み。本仕様書では第2層タブの「売上推移」を実装し、日/週/月/年の粒度で売上推移・客数推移・客単価推移をグラフで可視化する。

### 課題

- **課題1**: 売上推移タブがプレースホルダー（「売上推移（準備中）」）のまま未実装
- **課題2**: 売上金額の時系列推移を棒グラフで確認でき、前年同期との比較ができる必要がある
- **課題3**: 客数・客単価の推移を確認できる必要がある（Z009のquantity合計 = 客数）
- **課題4**: 売上推移タブの客数・客単価推移グラフにZ009データが必要

### 設計方針

- **方針1**: shadcn/ui Chart（内部でrecharts使用）のComposedChartを使用し、棒グラフ（当年売上）と折れ線グラフ（前年同期）を重ね合わせ表示する
- **方針2**: 客数・客単価は二軸の折れ線グラフで1つのチャートにまとめる
- **方針3**: 客単価はtimeSeriesのamount / quantity（Z009ベース）で算出する。quantityが0の期間は客単価0とする
- **方針4**: rechartsがSSR非対応のため、グラフコンポーネントは`next/dynamic`で動的インポートする
- **方針5**: useRegisterDataに`compareLastYear=true`を渡して前年同期データを取得する

## タスク詳細

### タスク1: 売上推移グラフの作成

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/SalesTrendChart.tsx`（**新規作成**）

**問題点**:

売上金額の時系列推移を表示するグラフが存在しない。当年データと前年同期データを重ね合わせて比較できる必要がある。

**修正内容**:

shadcn/ui ChartのChartContainerとrechartsのComposedChartを使用し、当年データを棒グラフ（Bar）、前年データを半透明の破線折れ線（Line, strokeDasharray="5 5"）で重ね合わせるグラフコンポーネントを作成する。`next/dynamic`でSSRを回避する。

前年同期データは`lastYearTimeSeries`として渡される。当年と前年の期間ラベルが異なるため、インデックスベースで突き合わせて1つのデータ配列にマージする。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/SalesTrendChart.tsx（新規作成）
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
import type { TimeSeriesEntry } from "../../../types";

interface SalesTrendChartProps {
  timeSeries: TimeSeriesEntry[];
  lastYearTimeSeries?: TimeSeriesEntry[];
}

interface ChartDataEntry {
  period: string;
  amount: number;
  lastYearAmount?: number;
}

const chartConfig = {
  amount: {
    label: "当年売上",
    color: "var(--chart-1)",
  },
  lastYearAmount: {
    label: "前年売上",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/** 当年と前年のデータをインデックスベースでマージ */
function mergeTimeSeries(
  current: TimeSeriesEntry[],
  lastYear?: TimeSeriesEntry[]
): ChartDataEntry[] {
  return current.map((entry, i) => ({
    period: entry.period,
    amount: entry.totalAmount,
    lastYearAmount: lastYear?.[i]?.totalAmount,
  }));
}

/** X軸ラベルを短縮表示（日: MM/DD、月: MM月、年: YYYY） */
function formatXLabel(period: string): string {
  if (period.length === 10) {
    return `${period.slice(5, 7)}/${period.slice(8, 10)}`;
  }
  if (period.length === 7) {
    return `${parseInt(period.slice(5, 7), 10)}月`;
  }
  return period;
}

export default function SalesTrendChart({
  timeSeries,
  lastYearTimeSeries,
}: SalesTrendChartProps) {
  const data = mergeTimeSeries(timeSeries, lastYearTimeSeries);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">売上推移</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickFormatter={formatXLabel} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${Number(value).toLocaleString("ja-JP")}円`}
              />
            }
            labelFormatter={formatXLabel}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
          {lastYearTimeSeries && (
            <Line
              dataKey="lastYearAmount"
              stroke="var(--color-lastYearAmount)"
              strokeOpacity={0.4}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
```

</details>

---

### タスク2: 客数・客単価推移グラフの作成

**対象ファイル**:

- `app/dashboard/register/components/viewer/charts/CustomerTrendChart.tsx`（**新規作成**）

**問題点**:

客数と客単価の推移を同時に確認できるグラフが存在しない。

**修正内容**:

shadcn/ui ChartのChartContainerとrechartsのComposedChartで二軸グラフを作成する。左Y軸に客数（折れ線）、右Y軸に客単価（折れ線）を表示する。色はChartConfigのCSS変数で管理する。客単価はtimeSeriesの各エントリから `totalAmount / totalQuantity` で計算する。`totalQuantity`が0の期間は客単価0とする。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/charts/CustomerTrendChart.tsx（新規作成）
"use client";

import {
  ComposedChart,
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
import type { TimeSeriesEntry } from "../../../types";

interface CustomerTrendChartProps {
  timeSeries: TimeSeriesEntry[];
}

interface ChartDataEntry {
  period: string;
  customers: number;
  unitPrice: number;
}

const chartConfig = {
  customers: {
    label: "客数",
    color: "var(--chart-1)",
  },
  unitPrice: {
    label: "客単価",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/** timeSeriesから客数・客単価データを生成 */
function buildChartData(timeSeries: TimeSeriesEntry[]): ChartDataEntry[] {
  return timeSeries.map((entry) => ({
    period: entry.period,
    customers: entry.totalQuantity,
    unitPrice:
      entry.totalQuantity > 0
        ? Math.round(entry.totalAmount / entry.totalQuantity)
        : 0,
  }));
}

/** X軸ラベルを短縮表示 */
function formatXLabel(period: string): string {
  if (period.length === 10) {
    return `${period.slice(5, 7)}/${period.slice(8, 10)}`;
  }
  if (period.length === 7) {
    return `${parseInt(period.slice(5, 7), 10)}月`;
  }
  return period;
}

export default function CustomerTrendChart({
  timeSeries,
}: CustomerTrendChartProps) {
  const data = buildChartData(timeSeries);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">客数・客単価推移</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickFormatter={formatXLabel} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${v}`}
            label={{ value: "客数", angle: -90, position: "insideLeft", offset: -5 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            label={{ value: "客単価", angle: 90, position: "insideRight", offset: -5 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) =>
                  name === "customers"
                    ? `${Number(value).toLocaleString("ja-JP")}人`
                    : `${Number(value).toLocaleString("ja-JP")}円`
                }
              />
            }
            labelFormatter={formatXLabel}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="customers"
            stroke="var(--color-customers)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="unitPrice"
            stroke="var(--color-unitPrice)"
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

---

### タスク3: 売上推移タブ統合コンポーネントの作成

**対象ファイル**:

- `app/dashboard/register/components/viewer/tabs/SalesTrendTab.tsx`（**新規作成**）

**問題点**:

売上推移グラフ・客数客単価グラフ・データテーブルを統合して配置するタブコンポーネントが必要。

**修正内容**:

`SalesTrendChart`と`CustomerTrendChart`を`next/dynamic`で動的インポートし、`DataTable`と組み合わせて配置する。`RegisterDataResponse`を受け取り、各コンポーネントにデータを渡す。

テーブルには時系列データ（期間、売上金額、客数、客単価）を表示する。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/tabs/SalesTrendTab.tsx（新規作成）
"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const SalesTrendChart = dynamic(() => import("../charts/SalesTrendChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-lg bg-gray-100" />,
});

const CustomerTrendChart = dynamic(() => import("../charts/CustomerTrendChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-lg bg-gray-100" />,
});

interface SalesTrendTabProps {
  data: RegisterDataResponse;
}

interface TrendTableRow {
  period: string;
  amount: number;
  customers: number;
  unitPrice: number;
}

/** 時系列データからテーブル行を生成 */
function buildTableRows(data: RegisterDataResponse): TrendTableRow[] {
  return data.timeSeries.map((entry) => ({
    period: entry.period,
    amount: entry.totalAmount,
    customers: entry.totalQuantity,
    unitPrice:
      entry.totalQuantity > 0
        ? Math.round(entry.totalAmount / entry.totalQuantity)
        : 0,
  }));
}

const trendColumns: ColumnDef<TrendTableRow>[] = [
  { key: "period", label: "期間" },
  {
    key: "amount",
    label: "売上金額",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
  },
  {
    key: "customers",
    label: "客数",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}人`,
  },
  {
    key: "unitPrice",
    label: "客単価",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
  },
];

export default function SalesTrendTab({ data }: SalesTrendTabProps) {
  const tableRows = buildTableRows(data);

  return (
    <div className="space-y-6">
      {/* 売上推移グラフ（棒+前年折れ線） */}
      <SalesTrendChart
        timeSeries={data.timeSeries}
        lastYearTimeSeries={data.lastYearTimeSeries}
      />

      {/* 客数・客単価推移グラフ */}
      <CustomerTrendChart timeSeries={data.timeSeries} />

      {/* 時系列データテーブル */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">売上推移データ</h3>
        <DataTable columns={trendColumns} data={tableRows} />
      </div>
    </div>
  );
}
```

</details>

---

### タスク4: RegisterDataViewerの変更 + 客数取得の改修

**対象ファイル**:

- `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`（既存・変更）
- `app/dashboard/register/components/viewer/hooks/useRegisterData.ts`（既存・変更）

**問題点**:

1. 「売上推移」タブがプレースホルダーのまま
2. `useRegisterData`に`compareLastYear=true`を渡していないため、前年同期データが取得されない

**修正内容**:

#### 4-1. useRegisterDataフックの変更（compareLastYear追加）

`fetchData`内のparamsに`compareLastYear: "true"`を追加する。

```tsx
// 変更前（params定義部分）
      const params = new URLSearchParams({
        type: initialType,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        view: "summary",
        groupBy,
        granularity,
      });

// 変更後
      const params = new URLSearchParams({
        type: initialType,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        view: "summary",
        groupBy,
        granularity,
        compareLastYear: "true",
      });
```

#### 4-2. RegisterDataViewerの変更

**import部分の変更**:

```tsx
// 変更前
import SalesOverviewTab from "./tabs/SalesOverviewTab";

// 変更後
import SalesOverviewTab from "./tabs/SalesOverviewTab";
import SalesTrendTab from "./tabs/SalesTrendTab";
```
```

**TabsContent部分の変更（売上推移タブ）**:

```tsx
// 変更前
          <TabsContent value="trend">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              売上推移（準備中）
            </div>
          </TabsContent>

// 変更後
          <TabsContent value="trend">
            {data ? (
              <SalesTrendTab data={data} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                データがありません
              </div>
            )}
          </TabsContent>
```

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
   - `/dashboard/register` にアクセスし、「売上分析」タブを開く
   - 第2層タブ「売上推移」をクリックし、グラフが表示されること
   - 売上推移グラフが棒グラフ（当年売上）で表示されること
   - 前年同期データがある場合、半透明の破線折れ線で重ね合わせ表示されること
   - 客数・客単価推移グラフが二軸折れ線で表示されること（左: 客数、右: 客単価）
   - 売上推移データテーブルに期間・売上金額・客数・客単価が表示されること
   - 定休日（データなし）の期間は売上0で表示されること
   - 期間セレクター（日/週/月/年）を切り替えるとグラフの粒度が変わること
   - 既存の「売上概要」タブが引き続き正常に動作すること

## 変更対象ファイル一覧

| ファイル                                                                        | 変更内容                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `app/dashboard/register/components/viewer/charts/SalesTrendChart.tsx`           | **新規作成**                                                   |
| `app/dashboard/register/components/viewer/charts/CustomerTrendChart.tsx`        | **新規作成**                                                   |
| `app/dashboard/register/components/viewer/tabs/SalesTrendTab.tsx`              | **新規作成**                                                   |
| `app/dashboard/register/components/viewer/hooks/useRegisterData.ts`            | compareLastYear追加、Z009客数取得の並列実行、返り値に客数追加  |
| `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`              | SalesTrendTab統合                                             |

## 備考

### 注意事項

- 既存の「売上概要」タブ（`SalesOverviewTab.tsx`）は変更しないこと
- 既存のグラフコンポーネント（`DayOfWeekChart.tsx`, `SalesBreakdownDonut.tsx`）は変更しないこと
- `useRegisterData`フックの変更は`fetchData`内のURLパラメータ追加のみ。フックの公開インターフェース（引数・返り値の型）は変更しない
- 客数の定義: Z009（時間帯別売上）のquantity合計。仕様書02のuseRegisterDataフックでZ009客数取得が実装済み
- 売上推移タブではtimeSeriesのtotalQuantityを直接使用する（Z001のquantityベース）。売上概要タブのKPIカードではZ009ベースの客数を使用する

### 参考

- 既存のグラフパターン: `app/dashboard/register/components/viewer/charts/DayOfWeekChart.tsx`（仕様書02タスク11）
- 型定義: `app/dashboard/register/types.ts`（TimeSeriesEntry, RegisterDataResponse, lastYearTimeSeries）
- shadcn/ui Chart: `app/components/ui/chart.tsx`（ChartContainer, ChartTooltip, ChartLegend）。内部でrechartsのComposedChart等を使用
- DataTableの型: `app/dashboard/register/components/viewer/DataTable.tsx`（ColumnDef）
