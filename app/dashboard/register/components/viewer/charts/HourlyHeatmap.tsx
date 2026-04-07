"use client";

import { Fragment } from "react";
import type { HourlyHeatmapEntry } from "../../../types";

type HeatmapMode = "amount" | "quantity";

interface HourlyHeatmapProps {
  heatmap: HourlyHeatmapEntry[];
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];
// 月曜始まりの表示順に対応するdayOfWeek値（0=日,1=月,...6=土）
const DAY_OF_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const MODE_CONFIG = {
  amount: {
    title: "曜日 x 時間帯ヒートマップ（売上）",
    ariaLabel: "曜日別時間帯ヒートマップ（売上）",
    getValue: (h: HourlyHeatmapEntry) => h.totalAmount,
    formatCell: (value: number) => `${(value / 1000).toFixed(0)}k`,
    formatTooltip: (dayLabel: string, time: string, value: number) =>
      `${dayLabel} ${time}: ${value.toLocaleString("ja-JP")}円`,
    colorClasses: {
      zero: "bg-solid-gray-50",
      levels: [
        "bg-blue-100",
        "bg-blue-200",
        "bg-blue-300",
        "bg-blue-400",
        "bg-blue-600 text-white",
      ],
    },
  },
  quantity: {
    title: "曜日 x 時間帯ヒートマップ（客数）",
    ariaLabel: "曜日別時間帯ヒートマップ（客数）",
    getValue: (h: HourlyHeatmapEntry) => h.totalQuantity,
    formatCell: (value: number) => `${value}`,
    formatTooltip: (dayLabel: string, time: string, value: number) =>
      `${dayLabel} ${time}: ${value.toLocaleString("ja-JP")}人`,
    colorClasses: {
      zero: "bg-solid-gray-50",
      levels: [
        "bg-orange-100",
        "bg-orange-200",
        "bg-orange-300",
        "bg-orange-400",
        "bg-orange-600 text-white",
      ],
    },
  },
} as const;

function getIntensityClass(
  value: number,
  maxValue: number,
  mode: HeatmapMode
): string {
  const { zero, levels } = MODE_CONFIG[mode].colorClasses;
  if (maxValue === 0 || value === 0) return zero;
  const ratio = value / maxValue;
  if (ratio < 0.2) return levels[0];
  if (ratio < 0.4) return levels[1];
  if (ratio < 0.6) return levels[2];
  if (ratio < 0.8) return levels[3];
  return levels[4];
}

function SingleHeatmap({
  heatmap,
  mode,
}: {
  heatmap: HourlyHeatmapEntry[];
  mode: HeatmapMode;
}) {
  const config = MODE_CONFIG[mode];

  const timeSlots = [...new Set(heatmap.map((h) => h.startTime))].sort();

  const maxValue = Math.max(...heatmap.map(config.getValue), 1);

  const matrix = new Map<string, number>();
  for (const h of heatmap) {
    matrix.set(`${h.dayOfWeek}-${h.startTime}`, config.getValue(h));
  }

  return (
    <section
      className="rounded-8 border border-solid-gray-200 bg-white p-4"
      aria-label={config.ariaLabel}
    >
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">
        {config.title}
      </h3>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{
            gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(2.5rem, 1fr))`,
          }}
        >
          <div className="p-1" />
          {timeSlots.map((time) => (
            <div
              key={time}
              className="p-1 text-center text-xs text-solid-gray-536"
            >
              {time}
            </div>
          ))}

          {DAY_LABELS.map((dayLabel, dayIndex) => (
            <Fragment key={dayIndex}>
              <div className="flex items-center p-1 text-xs font-medium text-solid-gray-600">
                {dayLabel}
              </div>
              {timeSlots.map((time) => {
                const dow = DAY_OF_WEEK_ORDER[dayIndex];
                const value = matrix.get(`${dow}-${time}`) ?? 0;
                return (
                  <div
                    key={`${dow}-${time}`}
                    className={`flex items-center justify-center rounded-4 p-1 text-xs ${getIntensityClass(value, maxValue, mode)}`}
                    title={config.formatTooltip(dayLabel, time, value)}
                  >
                    {value > 0 ? config.formatCell(value) : ""}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex items-center gap-2 text-xs text-solid-gray-536">
        <span>低</span>
        <div className="flex gap-0.5">
          <div className={`h-4 w-4 rounded-4 ${config.colorClasses.zero}`} />
          {config.colorClasses.levels.map((cls) => (
            <div key={cls} className={`h-4 w-4 rounded-4 ${cls}`} />
          ))}
        </div>
        <span>高</span>
      </div>
    </section>
  );
}

export default function HourlyHeatmap({ heatmap }: HourlyHeatmapProps) {
  if (heatmap.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SingleHeatmap heatmap={heatmap} mode="amount" />
      <SingleHeatmap heatmap={heatmap} mode="quantity" />
    </div>
  );
}
