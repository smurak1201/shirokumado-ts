"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { HourlyEntry } from "../../../types";

interface HourlyChartProps {
  hourly: HourlyEntry[];
}

const chartConfig = {
  売上: {
    label: "売上",
    color: "var(--color-chart-1)",
  },
  客数: {
    label: "客数",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

export default function HourlyChart({ hourly }: HourlyChartProps) {
  const data = hourly.map((h) => ({
    time: `${h.startTime}`,
    売上: h.totalAmount,
    客数: h.totalQuantity,
  }));

  if (data.length === 0) return null;

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="時間帯別売上・客数">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">
        時間帯別 売上・客数（期間内平均）
      </h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}千円`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${v}人`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string } }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {name === "売上"
                          ? `${Number(value).toLocaleString("ja-JP")}円`
                          : `${Number(value).toLocaleString("ja-JP")}人`}
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar yAxisId="left" dataKey="売上" fill="var(--color-売上)" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="客数"
            stroke="var(--color-客数)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </section>
  );
}
