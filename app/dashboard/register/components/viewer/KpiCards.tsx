"use client";

import type { DataSummary, Granularity } from "../../types";

interface KpiCardsProps {
  summary: DataSummary;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousPeriod?: { totalAmount: number; totalQuantity: number };
  previousCustomers?: number;
  /** 平均ラベルの切り替えに使用（省略時は「日平均」） */
  granularity?: Granularity;
  /** timeSeriesのエントリ数（客数平均の計算に使用） */
  periodCount?: number;
  /** 比較ラベル（省略時は「前年比」） */
  compareLabel?: string;
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
function ChangeIndicator({ rate, label }: { rate: number | null; label: string }) {
  if (rate === null) return <span className="text-sm text-solid-gray-536">--</span>;
  const isPositive = rate > 0;
  const color = isPositive ? "text-success-1" : rate < 0 ? "text-error-1" : "text-solid-gray-536";
  const arrow = isPositive ? "+" : "";
  return <span className={`text-sm font-bold ${color}`}>{label} {arrow}{rate}%</span>;
}

const AVG_LABELS: Record<Granularity, string> = {
  day: "日平均",
  week: "週平均",
  month: "月平均",
  year: "年平均",
};

export default function KpiCards({
  summary,
  totalCustomers,
  previousPeriod,
  previousCustomers,
  granularity = "day",
  periodCount = 1,
  compareLabel = "前年比",
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
      sub: `${AVG_LABELS[granularity]}: ${formatAmount(summary.avgAmount)}円`,
    },
    {
      label: "客数合計",
      value: `${formatAmount(totalCustomers)}人`,
      change: previousCustomers
        ? calcChangeRate(totalCustomers, previousCustomers)
        : null,
      sub: `${AVG_LABELS[granularity]}: ${formatAmount(Math.round(totalCustomers / periodCount))}人`,
    },
    {
      label: "客単価",
      value: `${formatAmount(avgUnitPrice)}円`,
      change: prevAvgUnitPrice ? calcChangeRate(avgUnitPrice, prevAvgUnitPrice) : null,
      sub: null,
    },
  ];

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-8 border border-solid-gray-200 bg-white p-4"
        >
          <dt className="mb-2 text-sm text-solid-gray-536">{card.label}</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-solid-gray-900">{card.value}</span>
            <ChangeIndicator rate={card.change} label={compareLabel} />
          </dd>
          {card.sub && (
            <dd className="mt-2 text-sm text-solid-gray-536">{card.sub}</dd>
          )}
        </div>
      ))}

      {/* トップ/ボトム */}
      {summary.maxAmount.period && (
        <div className="col-span-1 rounded-8 border border-solid-gray-200 bg-white p-4 sm:col-span-3">
          <dd className="flex flex-wrap gap-6 text-sm text-solid-gray-536">
            <span>
              最高売上: <strong className="text-base text-solid-gray-800">{summary.maxAmount.period}</strong>{" "}
              <span className="text-base font-medium text-solid-gray-700">({formatAmount(summary.maxAmount.value)}円)</span>
            </span>
            <span>
              最低売上: <strong className="text-base text-solid-gray-800">{summary.minAmount.period}</strong>{" "}
              <span className="text-base font-medium text-solid-gray-700">({formatAmount(summary.minAmount.value)}円)</span>
            </span>
          </dd>
        </div>
      )}
    </dl>
  );
}
