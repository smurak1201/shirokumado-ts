"use client";

import type { DataSummary } from "../../types";

interface KpiCardsProps {
  summary: DataSummary;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousPeriod?: { totalAmount: number; totalQuantity: number };
  previousCustomers?: number;
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
function ChangeIndicator({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-xs text-gray-400">--</span>;
  const isPositive = rate > 0;
  const color = isPositive ? "text-[#259D63]" : rate < 0 ? "text-[#FE3939]" : "text-gray-400";
  const arrow = isPositive ? "+" : "";
  return <span className={`text-xs font-medium ${color}`}>前年比 {arrow}{rate}%</span>;
}

export default function KpiCards({
  summary,
  totalCustomers,
  previousPeriod,
  previousCustomers,
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
      sub: `日平均: ${formatAmount(summary.avgAmount)}円`,
    },
    {
      label: "客数合計",
      value: `${formatAmount(totalCustomers)}人`,
      change: previousCustomers
        ? calcChangeRate(totalCustomers, previousCustomers)
        : null,
      sub: `日平均: ${formatAmount(summary.avgQuantity)}人`,
    },
    {
      label: "客単価",
      value: `${formatAmount(avgUnitPrice)}円`,
      change: prevAvgUnitPrice ? calcChangeRate(avgUnitPrice, prevAvgUnitPrice) : null,
      sub: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-1 text-xs text-gray-500">{card.label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{card.value}</span>
            <ChangeIndicator rate={card.change} />
          </div>
          {card.sub && (
            <div className="mt-1 text-xs text-gray-400">{card.sub}</div>
          )}
        </div>
      ))}

      {/* トップ/ボトム */}
      {summary.maxAmount.period && (
        <div className="col-span-1 rounded-lg border border-gray-200 bg-white p-4 sm:col-span-3">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span>
              最高売上: <strong className="text-base text-gray-800">{summary.maxAmount.period}</strong>{" "}
              <span className="text-base font-medium text-gray-700">({formatAmount(summary.maxAmount.value)}円)</span>
            </span>
            <span>
              最低売上: <strong className="text-base text-gray-800">{summary.minAmount.period}</strong>{" "}
              <span className="text-base font-medium text-gray-700">({formatAmount(summary.minAmount.value)}円)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
