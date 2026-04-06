"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse, AggregatedEntry, TimeSeriesEntry } from "../../../types";
import KpiCards from "../KpiCards";

const DayOfWeekChart = dynamic(() => import("../charts/DayOfWeekChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-lg bg-gray-100" />,
});

const TopProductsDonut = dynamic(() => import("../charts/TopProductsDonut"), {
  ssr: false,
  loading: () => <div className="h-50 animate-pulse rounded-lg bg-gray-100" />,
});

const DepartmentBarChart = dynamic(() => import("../charts/DepartmentBarChart"), {
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
  /** 曜日別チャート用の日別timeSeries */
  dailyTimeSeries: TimeSeriesEntry[];
}

export default function SalesOverviewTab({
  data,
  totalCustomers,
  previousCustomers,
  topProducts,
  dailyTimeSeries,
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
        <DayOfWeekChart timeSeries={dailyTimeSeries} />
        <TopProductsDonut products={topProducts} />
      </div>

      {/* 部門別横棒グラフ */}
      <DepartmentBarChart departments={data.aggregated} />
    </div>
  );
}
