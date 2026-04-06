"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { AggregatedEntry } from "../../../types";

interface DepartmentBarChartProps {
  departments: AggregatedEntry[];
}

const chartConfig = {
  totalAmount: {
    label: "売上合計",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

function formatAmount(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

export default function DepartmentBarChart({ departments }: DepartmentBarChartProps) {
  // 金額降順でソート
  const sorted = [...departments].sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="部門別売上">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">部門別売上合計</h3>
      <ChartContainer config={chartConfig} className="w-full" style={{ height: sorted.length * 48 + 20 }}>
        <BarChart
          accessibilityLayer
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 100, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="itemName"
            width={140}
            tickLine={false}
            axisLine={false}
            className="text-sm"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${Number(value).toLocaleString("ja-JP")}円`}
              />
            }
          />
          <Bar
            dataKey="totalAmount"
            fill="var(--color-totalAmount)"
            radius={[0, 4, 4, 0]}
            label={{
              position: "right",
              className: "fill-solid-gray-600 text-sm",
              formatter: (v: number) => `${formatAmount(v)}円`,
            }}
          />
        </BarChart>
      </ChartContainer>
    </section>
  );
}
