"use client";

import type { ReactNode } from "react";
import type { PeriodType } from "../../types";
import { PERIOD_LABELS } from "../../types";

interface ComparePreset {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
}

interface PeriodSelectorProps {
  periodType: PeriodType;
  dateFrom: string;
  dateTo: string;
  onPeriodTypeChange: (type: PeriodType) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
  /** カスタムモード時に終了日の横に表示するアクション */
  saveAction?: ReactNode;
  /** 比較用プリセット一覧 */
  comparePresets?: ComparePreset[];
  /** 選択中の比較プリセットID（null=比較なし） */
  selectedComparePresetId?: number | null;
  /** 比較プリセット選択時のコールバック */
  onComparePresetChange?: (presetId: number | null) => void;
}

const PERIOD_TYPES: PeriodType[] = ["week", "month", "year", "custom"];

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
  saveAction,
  comparePresets = [],
  selectedComparePresetId = null,
  onComparePresetChange,
}: PeriodSelectorProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="期間タイプ">
        {PERIOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onPeriodTypeChange(type)}
            aria-pressed={periodType === type}
            className={`rounded-6 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue ${
              periodType === type
                ? "bg-solid-gray-900 text-white"
                : "bg-solid-gray-50 text-solid-gray-700 hover:bg-solid-gray-100"
            }`}
          >
            {PERIOD_LABELS[type]}
          </button>
        ))}
      </div>

      {periodType === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-6 border border-solid-gray-420 px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
          />
          <span className="text-sm text-solid-gray-536">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-6 border border-solid-gray-420 px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
          />
          {saveAction}
          {comparePresets.length > 0 && onComparePresetChange && (
            <select
              value={selectedComparePresetId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onComparePresetChange(val ? Number(val) : null);
              }}
              className="rounded-6 border border-solid-gray-420 bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
              aria-label="比較期間"
            >
              <option value="">比較なし</option>
              {comparePresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（{p.dateFrom.slice(0, 10)} ~ {p.dateTo.slice(0, 10)}）
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("prev")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-6 bg-solid-gray-50 text-solid-gray-700 hover:bg-solid-gray-100 cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
            aria-label="前の期間"
          >
            &lt;
          </button>
          <span className="min-w-28 text-center text-sm font-medium text-solid-gray-800">
            {formatPeriodLabel(periodType, dateFrom, dateTo)}
          </span>
          <button
            type="button"
            onClick={() => onNavigate("next")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-6 bg-solid-gray-50 text-solid-gray-700 hover:bg-solid-gray-100 cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
            aria-label="次の期間"
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
}
