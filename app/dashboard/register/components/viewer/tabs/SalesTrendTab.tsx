"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse } from "../../../types";
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
}: SalesTrendTabProps) {
  const tableRows = buildTableRows(data);

  return (
    <div className="space-y-6">
      <KpiCards
        summary={data.summary}
        totalCustomers={totalCustomers}
        previousPeriod={data.previousPeriod}
        previousCustomers={previousCustomers}
      />

      <SalesTrendChart
        timeSeries={data.timeSeries}
        lastYearTimeSeries={data.lastYearTimeSeries}
      />

      <CustomerTrendChart timeSeries={data.timeSeries} />

      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">売上推移データ</h3>
        <DataTable columns={trendColumns} data={tableRows} />
      </div>
    </div>
  );
}
