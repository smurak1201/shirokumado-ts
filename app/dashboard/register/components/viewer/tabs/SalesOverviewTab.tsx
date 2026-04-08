"use client";

import dynamic from "next/dynamic";
import type { RegisterDataResponse, AggregatedEntry, TimeSeriesEntry, Granularity } from "../../../types";
import KpiCards from "../KpiCards";
import TargetProgressBar from "../charts/TargetProgressBar";
import { useSalesTarget } from "../hooks/useSalesTarget";

const DayOfWeekChart = dynamic(() => import("../charts/DayOfWeekChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-8 bg-solid-gray-50" />,
});

const TopProductsDonut = dynamic(() => import("../charts/TopProductsDonut"), {
  ssr: false,
  loading: () => <div className="h-50 animate-pulse rounded-8 bg-solid-gray-50" />,
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
  /** 曜日別チャート用の日別客数timeSeries（Z009） */
  dailyCustomerTimeSeries?: TimeSeriesEntry[];
  granularity?: Granularity;
  /** フィルタの開始日（目標月の特定に使用） */
  dateFrom: string;
  /** 比較ラベル（省略時は「前年比」） */
  compareLabel?: string;
}

export default function SalesOverviewTab({
  data,
  totalCustomers,
  previousCustomers,
  topProducts,
  dailyTimeSeries,
  dailyCustomerTimeSeries,
  granularity,
  dateFrom,
  compareLabel,
}: SalesOverviewTabProps) {
  // フィルタの開始日から年月を取得（dateFromは"YYYY-MM-DD"形式）
  const filterDate = new Date(dateFrom);
  const targetYear = filterDate.getFullYear();
  const targetMonth = filterDate.getMonth() + 1;
  const { getTargetForMonth } = useSalesTarget(targetYear);
  const monthlyTarget = getTargetForMonth(targetMonth);

  return (
    <section className="space-y-6" aria-label="売上概要">
      {/* 売上目標プログレスバー（data.summary.totalAmountはZ005ベースの売上合計） */}
      {monthlyTarget && (
        <TargetProgressBar
          currentAmount={data.summary.totalAmount}
          targetAmount={monthlyTarget.amount}
          label={`${targetYear}年${targetMonth}月 売上目標（売上合計ベース）`}
        />
      )}

      {/* KPIカード */}
      <KpiCards
        summary={data.summary}
        totalCustomers={totalCustomers}
        previousPeriod={data.previousPeriod}
        previousCustomers={previousCustomers}
        granularity={granularity}
        periodCount={data.timeSeries.length}
        compareLabel={compareLabel}
      />

      {/* グラフエリア */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DayOfWeekChart timeSeries={dailyTimeSeries} customerTimeSeries={dailyCustomerTimeSeries} />
        <TopProductsDonut products={topProducts} />
      </div>

    </section>
  );
}
