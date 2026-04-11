"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse, Granularity } from "../../../types";
import { fillTimeSeries, getLastYearRange } from "../../../lib/date";
import { formatJpy, formatPersons } from "../../../lib/format";
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
    format: (v) => formatJpy(v as number),
  },
  {
    key: "lastYearAmount",
    label: "前年売上",
    align: "right",
    format: (v) => (v !== null ? formatJpy(v as number) : "--"),
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
    format: (v) => formatPersons(v as number),
  },
  {
    key: "unitPrice",
    label: "客単価",
    align: "right",
    format: (v) => formatJpy(v as number),
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
