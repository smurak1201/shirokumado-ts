"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { TimeSeriesEntry } from "../../../types";

interface DayOfWeekChartProps {
  timeSeries: TimeSeriesEntry[];
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

const chartConfig = {
  avgAmount: {
    label: "平均売上",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

/** 時系列データを曜日ごとに集計 */
function aggregateByDayOfWeek(
  timeSeries: TimeSeriesEntry[]
): Array<{ day: string; avgAmount: number; avgQuantity: number }> {
  const buckets = Array.from({ length: 7 }, () => ({
    totalAmount: 0,
    totalQuantity: 0,
    count: 0,
  }));

  for (const entry of timeSeries) {
    const date = new Date(entry.period);
    // getDay()は日曜=0なので、月曜始まり(0-6)に変換
    const dayIndex = (date.getDay() + 6) % 7;
    const bucket = buckets[dayIndex]!;
    bucket.totalAmount += entry.totalAmount;
    bucket.totalQuantity += entry.totalQuantity;
    bucket.count += 1;
  }

  return buckets.map((b, i) => ({
    day: DAY_LABELS[i]!,
    avgAmount: b.count > 0 ? Math.round(b.totalAmount / b.count) : 0,
    avgQuantity: b.count > 0 ? Math.round(b.totalQuantity / b.count) : 0,
  }));
}

export default function DayOfWeekChart({ timeSeries }: DayOfWeekChartProps) {
  const data = aggregateByDayOfWeek(timeSeries);

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="曜日別売上">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">曜日別売上（平均）</h3>
      <ChartContainer config={chartConfig} className="h-62.5 w-full">
        <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}千円`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string } }).payload?.fill }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <Bar dataKey="avgAmount" fill="var(--color-avgAmount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>

      {/* 曜日別テーブル */}
      <table className="mt-4 w-full text-base">
        <caption className="sr-only">曜日別平均売上と客数</caption>
        <thead>
          <tr className="border-b border-solid-gray-100 text-sm text-solid-gray-536">
            <th className="w-1/3 pb-2 text-center font-normal">曜日</th>
            <th className="w-1/3 pb-2 text-center font-normal">平均売上</th>
            <th className="w-1/3 pb-2 text-center font-normal">平均客数</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day} className="border-b border-solid-gray-50">
              <td className="py-2 text-center font-medium text-solid-gray-536">{d.day}</td>
              <td className="py-2 text-right tabular-nums text-solid-gray-700">
                {d.avgAmount > 0 ? `${d.avgAmount.toLocaleString("ja-JP")}円` : "-"}
              </td>
              <td className="py-2 text-right tabular-nums text-solid-gray-700">
                {d.avgQuantity > 0 ? `${d.avgQuantity.toLocaleString("ja-JP")}人` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
