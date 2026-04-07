"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse } from "../../../types";
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
