"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse, TimeSeriesEntry, Granularity } from "../../../types";
import KpiCards from "../KpiCards";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const SalesTrendChart = dynamic(() => import("../charts/SalesTrendChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-50" />,
});

const CustomerTrendChart = dynamic(() => import("../charts/CustomerTrendChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-50" />,
});

interface SalesTrendTabProps {
  data: RegisterDataResponse;
  totalCustomers: number;
  previousCustomers?: number;
  dateFrom: string;
  dateTo: string;
  granularity: Granularity;
  /** 比較ラベル（省略時は「前年比」） */
  compareLabel?: string;
}

/** 期間内の全ポイントを生成し、データがない日は0で埋める */
function fillTimeSeries(
  timeSeries: TimeSeriesEntry[],
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): TimeSeriesEntry[] {
  const dataMap = new Map(timeSeries.map((e) => [e.period, e]));
  const periods = generatePeriods(dateFrom, dateTo, granularity);
  return periods.map((period) => dataMap.get(period) ?? { period, totalAmount: 0, totalQuantity: 0 });
}

/** dateFrom〜dateToの範囲で粒度に応じた期間ラベルを生成 */
function generatePeriods(dateFrom: string, dateTo: string, granularity: Granularity): string[] {
  const periods: string[] = [];
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  switch (granularity) {
    case "day": {
      const d = new Date(from);
      while (d <= to) {
        periods.push(d.toISOString().split("T")[0]!);
        d.setDate(d.getDate() + 1);
      }
      break;
    }
    case "week": {
      // 週の開始日（月曜）を起点に7日刻み
      const d = new Date(from);
      while (d <= to) {
        periods.push(d.toISOString().split("T")[0]!);
        d.setDate(d.getDate() + 7);
      }
      break;
    }
    case "month": {
      const d = new Date(from);
      while (d <= to) {
        const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        periods.push(label);
        d.setMonth(d.getMonth() + 1);
      }
      break;
    }
    case "year": {
      const d = new Date(from);
      while (d.getFullYear() <= to.getFullYear()) {
        periods.push(String(d.getFullYear()));
        d.setFullYear(d.getFullYear() + 1);
      }
      break;
    }
  }
  return periods;
}

/** 前年の同じ期間のdateFrom/dateToを計算 */
function getLastYearRange(dateFrom: string, dateTo: string): { from: string; to: string } {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  from.setFullYear(from.getFullYear() - 1);
  to.setFullYear(to.getFullYear() - 1);
  return {
    from: from.toISOString().split("T")[0]!,
    to: to.toISOString().split("T")[0]!,
  };
}

interface TrendTableRow {
  period: string;
  amount: number;
  lastYearAmount: number | null;
  yoyRate: number | null;
  customers: number;
  unitPrice: number;
}

/** 時系列データからテーブル行を生成（前年データ含む） */
function buildTableRows(data: RegisterDataResponse): TrendTableRow[] {
  return data.timeSeries.map((entry, i) => {
    const lastYear = data.lastYearTimeSeries?.[i];
    const lastYearAmount = lastYear?.totalAmount ?? null;
    const yoyRate =
      lastYearAmount !== null && lastYearAmount > 0
        ? Math.round(((entry.totalAmount - lastYearAmount) / lastYearAmount) * 1000) / 10
        : null;

    return {
      period: entry.period,
      amount: entry.totalAmount,
      lastYearAmount,
      yoyRate,
      customers: entry.totalQuantity,
      unitPrice:
        entry.totalQuantity > 0
          ? Math.round(entry.totalAmount / entry.totalQuantity)
          : 0,
    };
  });
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
    key: "lastYearAmount",
    label: "前年売上",
    align: "right",
    format: (v) => (v !== null ? `${(v as number).toLocaleString("ja-JP")}円` : "--"),
  },
  {
    key: "yoyRate",
    label: "前年比",
    align: "right",
    format: (v) => {
      if (v === null) return "--";
      const rate = v as number;
      const sign = rate > 0 ? "+" : "";
      return `${sign}${rate}%`;
    },
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

export default function SalesTrendTab({
  data,
  totalCustomers,
  previousCustomers,
  dateFrom,
  dateTo,
  granularity,
  compareLabel,
}: SalesTrendTabProps) {
  // 期間全体を0埋めした時系列データ
  const filledTimeSeries = fillTimeSeries(data.timeSeries, dateFrom, dateTo, granularity);

  // 前年も同じ期間分を0埋め
  const lastYearRange = getLastYearRange(dateFrom, dateTo);
  const filledLastYear = data.lastYearTimeSeries
    ? fillTimeSeries(data.lastYearTimeSeries, lastYearRange.from, lastYearRange.to, granularity)
    : undefined;

  const filledData: RegisterDataResponse = {
    ...data,
    timeSeries: filledTimeSeries,
    lastYearTimeSeries: filledLastYear,
  };

  const tableRows = buildTableRows(filledData);

  return (
    <div className="space-y-6">
      <KpiCards
        summary={data.summary}
        totalCustomers={totalCustomers}
        previousPeriod={data.previousPeriod}
        previousCustomers={previousCustomers}
        granularity={granularity}
        periodCount={data.timeSeries.length}
        compareLabel={compareLabel}
      />

      <SalesTrendChart
        timeSeries={filledTimeSeries}
        lastYearTimeSeries={filledLastYear}
      />

      <CustomerTrendChart timeSeries={filledTimeSeries} />

      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">売上推移データ</h3>
        <DataTable columns={trendColumns} data={tableRows} />
      </div>
    </div>
  );
}
