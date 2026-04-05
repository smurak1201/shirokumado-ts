"use client";

import type { PeriodType } from "../../types";
import { PERIOD_LABELS } from "../../types";

interface PeriodSelectorProps {
  periodType: PeriodType;
  dateFrom: string;
  dateTo: string;
  onPeriodTypeChange: (type: PeriodType) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
}

const PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year", "custom"];

/** 表示用の期間ラベル */
function formatPeriodLabel(periodType: PeriodType, dateFrom: string, dateTo: string): string {
  const from = new Date(dateFrom);
  switch (periodType) {
    case "day":
      return from.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    case "week":
      return `${new Date(dateFrom).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })} - ${new Date(dateTo).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}`;
    case "month":
      return from.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
    case "year":
      return `${from.getFullYear()}年`;
    case "custom":
      return `${dateFrom} - ${dateTo}`;
  }
}

export default function PeriodSelector({
  periodType,
  dateFrom,
  dateTo,
  onPeriodTypeChange,
  onDateFromChange,
  onDateToChange,
  onNavigate,
}: PeriodSelectorProps) {
  return (
    <div className="space-y-3">
      {/* 期間タイプ切り替えボタン */}
      <div className="flex flex-wrap gap-1">
        {PERIOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onPeriodTypeChange(type)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
              periodType === type
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {PERIOD_LABELS[type]}
          </button>
        ))}
      </div>

      {/* ナビゲーション + 期間表示 */}
      <div className="flex items-center gap-3">
        {periodType !== "custom" && (
          <button
            type="button"
            onClick={() => onNavigate("prev")}
            className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95"
            aria-label="前の期間"
          >
            &lt;
          </button>
        )}

        <span className="text-sm font-medium text-gray-800">
          {formatPeriodLabel(periodType, dateFrom, dateTo)}
        </span>

        {periodType !== "custom" && (
          <button
            type="button"
            onClick={() => onNavigate("next")}
            className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95"
            aria-label="次の期間"
          >
            &gt;
          </button>
        )}
      </div>

      {/* カスタム期間の日付入力 */}
      {periodType === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
          <span className="text-sm text-gray-500">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}
