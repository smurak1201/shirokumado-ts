"use client";

import { Fragment } from "react";
import type { HourlyHeatmapEntry } from "../../../types";

interface HourlyHeatmapProps {
  heatmap: HourlyHeatmapEntry[];
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** 金額に応じた背景色クラスを返す（濃さ5段階） */
function getIntensityClass(value: number, maxValue: number): string {
  if (maxValue === 0 || value === 0) return "bg-solid-gray-50";
  const ratio = value / maxValue;
  if (ratio < 0.2) return "bg-blue-100";
  if (ratio < 0.4) return "bg-blue-200";
  if (ratio < 0.6) return "bg-blue-300";
  if (ratio < 0.8) return "bg-blue-400";
  return "bg-blue-600 text-white";
}

export default function HourlyHeatmap({ heatmap }: HourlyHeatmapProps) {
  if (heatmap.length === 0) return null;

  // 時間帯のリストを取得（ソート済み）
  const timeSlots = [...new Set(heatmap.map((h) => h.startTime))].sort();

  // 最大値を取得（色の正規化に使用）
  const maxAmount = Math.max(...heatmap.map((h) => h.totalAmount), 1);

  // 曜日x時間帯のマトリクスを構築
  const matrix = new Map<string, number>();
  for (const h of heatmap) {
    matrix.set(`${h.dayOfWeek}-${h.startTime}`, h.totalAmount);
  }

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="曜日別時間帯ヒートマップ">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">
        曜日 x 時間帯ヒートマップ（売上）
      </h3>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(2.5rem, 1fr))` }}>
          {/* ヘッダー行: 時間帯 */}
          <div className="p-1" />
          {timeSlots.map((time) => (
            <div
              key={time}
              className="p-1 text-center text-xs text-solid-gray-536"
            >
              {time}
            </div>
          ))}

          {/* データ行: 曜日ごと */}
          {DAY_LABELS.map((dayLabel, dayIndex) => (
            <Fragment key={dayIndex}>
              <div
                className="flex items-center p-1 text-xs font-medium text-solid-gray-600"
              >
                {dayLabel}
              </div>
              {timeSlots.map((time) => {
                const value = matrix.get(`${dayIndex}-${time}`) ?? 0;
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className={`flex items-center justify-center rounded-4 p-1 text-xs ${getIntensityClass(value, maxAmount)}`}
                    title={`${dayLabel} ${time}: ${value.toLocaleString("ja-JP")}円`}
                  >
                    {value > 0 ? `${(value / 1000).toFixed(0)}k` : ""}
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
          <div className="h-4 w-4 rounded-4 bg-solid-gray-50" />
          <div className="h-4 w-4 rounded-4 bg-blue-100" />
          <div className="h-4 w-4 rounded-4 bg-blue-200" />
          <div className="h-4 w-4 rounded-4 bg-blue-300" />
          <div className="h-4 w-4 rounded-4 bg-blue-400" />
          <div className="h-4 w-4 rounded-4 bg-blue-600" />
        </div>
        <span>高</span>
      </div>
    </section>
  );
}
