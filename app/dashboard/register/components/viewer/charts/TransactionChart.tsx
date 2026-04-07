"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { TimeSeriesEntry } from "../../../types";

interface TransactionChartProps {
  timeSeries: TimeSeriesEntry[];
}

const chartConfig = {
  訂正金額: {
    label: "訂正金額",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig;

export default function TransactionChart({ timeSeries }: TransactionChartProps) {
  const hasData = timeSeries.some((e) => e.totalAmount !== 0 || e.totalQuantity !== 0);
  if (!hasData) return null;

  const data = timeSeries.map((e) => ({
    period: e.period,
    訂正金額: Math.abs(e.totalAmount),
  }));

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="訂正金額の推移">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">訂正金額の推移</h3>
      <ChartContainer config={chartConfig} className="h-62.5 w-full">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}千円`} />
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
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <Bar dataKey="訂正金額" fill="var(--color-訂正金額)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </section>
  );
}
