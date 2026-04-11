"use client";

import {
  LineChart,
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
import { formatJpy, formatJpyAxis, formatPeriodShortLabel } from "../../../lib/format";

interface SalesTrendChartProps {
  timeSeries: TimeSeriesEntry[];
  lastYearTimeSeries?: TimeSeriesEntry[];
}

interface ChartDataEntry {
  period: string;
  amount: number;
  lastYearAmount?: number;
}

const chartConfig = {
  amount: {
    label: "当年売上",
    color: "var(--color-chart-1)",
  },
  lastYearAmount: {
    label: "前年売上",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

/** 当年と前年のデータをインデックスベースでマージ */
function mergeTimeSeries(
  current: TimeSeriesEntry[],
  lastYear?: TimeSeriesEntry[]
): ChartDataEntry[] {
  return current.map((entry, i) => ({
    period: entry.period,
    amount: entry.totalAmount,
    lastYearAmount: lastYear?.[i]?.totalAmount,
  }));
}

export default function SalesTrendChart({
  timeSeries,
  lastYearTimeSeries,
}: SalesTrendChartProps) {
  const data = mergeTimeSeries(timeSeries, lastYearTimeSeries);

  if (data.length === 0) return null;

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="売上推移">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">売上推移</h3>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickFormatter={formatPeriodShortLabel} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatJpyAxis} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: (item as { payload?: { fill?: string }; color?: string }).payload?.fill || (item as { color?: string }).color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {formatJpy(value as number | string)}
                      </span>
                    </div>
                  </>
                )}
              />
            }
            labelFormatter={formatPeriodShortLabel}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="amount"
            stroke="var(--color-amount)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {lastYearTimeSeries && (
            <Line
              dataKey="lastYearAmount"
              stroke="var(--color-lastYearAmount)"
              strokeOpacity={0.7}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ChartContainer>
    </section>
  );
}
