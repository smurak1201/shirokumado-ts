"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse, AggregatedEntry } from "../../../types";
import KpiCards from "../KpiCards";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const DayOfWeekChart = dynamic(() => import("../charts/DayOfWeekChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-lg bg-gray-100" />,
});

const TopProductsDonut = dynamic(() => import("../charts/TopProductsDonut"), {
  ssr: false,
  loading: () => <div className="h-50 animate-pulse rounded-lg bg-gray-100" />,
});

interface SalesOverviewTabProps {
  data: RegisterDataResponse;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousCustomers?: number;
  /** Z004から取得した上位10商品 */
  topProducts: AggregatedEntry[];
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
  topProducts,
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
        <TopProductsDonut products={topProducts} />
      </div>

      {/* 項目別テーブル */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">項目別集計</h3>
        <DataTable columns={aggregatedColumns} data={data.aggregated} />
      </div>
    </div>
  );
}
