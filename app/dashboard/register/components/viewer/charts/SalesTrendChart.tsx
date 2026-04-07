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
import type { TimeSeriesEntry } from "../../../types";

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

/** X軸ラベルを短縮表示（日: MM/DD、月: MM月、年: YYYY） */
function formatXLabel(period: string): string {
  if (period.length === 10) {
    return `${period.slice(5, 7)}/${period.slice(8, 10)}`;
  }
  if (period.length === 7) {
    return `${parseInt(period.slice(5, 7), 10)}月`;
  }
  return period;
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
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickFormatter={formatXLabel} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}千円`} />
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
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
              />
            }
            labelFormatter={formatXLabel}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
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
        </ComposedChart>
      </ChartContainer>
    </section>
  );
}
