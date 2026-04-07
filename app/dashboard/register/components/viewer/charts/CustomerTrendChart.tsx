"use client";

import {
  ComposedChart,
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
import type { TimeSeriesEntry } from "../../../types";

interface CustomerTrendChartProps {
  timeSeries: TimeSeriesEntry[];
}

interface ChartDataEntry {
  period: string;
  customers: number;
  unitPrice: number;
}

const chartConfig = {
  customers: {
    label: "客数",
    color: "var(--color-chart-1)",
  },
  unitPrice: {
    label: "客単価",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

/** timeSeriesから客数・客単価データを生成 */
function buildChartData(timeSeries: TimeSeriesEntry[]): ChartDataEntry[] {
  return timeSeries.map((entry) => ({
    period: entry.period,
    customers: entry.totalQuantity,
    unitPrice:
      entry.totalQuantity > 0
        ? Math.round(entry.totalAmount / entry.totalQuantity)
        : 0,
  }));
}

/** X軸ラベルを短縮表示 */
function formatXLabel(period: string): string {
  if (period.length === 10) {
    return `${period.slice(5, 7)}/${period.slice(8, 10)}`;
  }
  if (period.length === 7) {
    return `${parseInt(period.slice(5, 7), 10)}月`;
  }
  return period;
}

export default function CustomerTrendChart({
  timeSeries,
}: CustomerTrendChartProps) {
  const data = buildChartData(timeSeries);

  if (data.length === 0) return null;

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="客数・客単価推移">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">客数・客単価推移</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickFormatter={formatXLabel} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${v}`}
            label={{ value: "客数（人）", angle: -90, position: "insideLeft", offset: -5 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}千円`}
            label={{ value: "客単価（円）", angle: 90, position: "insideRight", offset: -5 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}{name === "customers" ? "人" : "円"}
                      </span>
                    </div>
                  </>
                )}
              />
            }
            labelFormatter={formatXLabel}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="customers"
            stroke="var(--color-customers)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="unitPrice"
            stroke="var(--color-unitPrice)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </section>
  );
}
