"use client";

import {
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { ProductEntry } from "../../../types";
import { formatJpy, formatJpyAxis } from "../../../lib/format";

interface ProductParetoChartProps {
  products: ProductEntry[];
}

/** ABCランクの色（基準線と統一） */
const RANK_COLORS: Record<string, string> = {
  A: "#259d63",
  B: "#fb5b01",
  C: "var(--color-chart-1)",
};

const chartConfig = {
  A: { label: "Aランク（〜70%）", color: RANK_COLORS.A },
  B: { label: "Bランク（〜90%）", color: RANK_COLORS.B },
  C: { label: "Cランク（90%〜）", color: RANK_COLORS.C },
  累積構成比: { label: "累積構成比", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

interface ParetoDataItem {
  label: string;
  fullName: string;
  売上: number;
  累積構成比: number;
  rank: "A" | "B" | "C";
}

export default function ProductParetoChart({ products }: ProductParetoChartProps) {
  const top10 = products.slice(0, 10);

  if (top10.length === 0) return null;

  const data: ParetoDataItem[] = top10.map((p, i) => ({
    label: `${i + 1}`,
    fullName: p.itemName,
    売上: p.totalAmount,
    累積構成比: p.cumulativeRatio,
    rank: p.rank,
  }));

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="ABC分析パレート図">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">
        ABC分析（売上TOP10 パレート図）
      </h3>
      <ChartContainer config={chartConfig} className="h-87.5 w-full">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="left" tickFormatter={formatJpyAxis} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => v === 25 || v === 75 ? "" : `${v}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => {
                  const entry = (item as { payload?: ParetoDataItem }).payload;
                  if (name === "累積構成比") {
                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-xs"
                          style={{ backgroundColor: "var(--color-chart-4)" }}
                        />
                        <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                          <span className="text-muted-foreground">累積構成比</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {`${Number(value).toFixed(1)}%`}
                          </span>
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: RANK_COLORS[entry?.rank ?? "C"] }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                        <span className="text-muted-foreground">売上</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatJpy(value as number | string)}
                        </span>
                      </div>
                    </>
                  );
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload as ParetoDataItem | undefined;
                  return item ? `${label}位: ${item.fullName}` : label;
                }}
              />
            }
          />
          <ReferenceLine
            yAxisId="right"
            y={70}
            stroke={RANK_COLORS.A}
            strokeDasharray="5 5"
            label={{ value: "A (70%)", position: "right", fill: RANK_COLORS.A, fontSize: 11 }}
          />
          <ReferenceLine
            yAxisId="right"
            y={90}
            stroke={RANK_COLORS.B}
            strokeDasharray="5 5"
            label={{ value: "B (90%)", position: "right", fill: RANK_COLORS.B, fontSize: 11 }}
          />
          <Bar yAxisId="left" dataKey="売上" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={RANK_COLORS[entry.rank]} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="累積構成比"
            stroke="var(--color-累積構成比)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
      {/* ABCランク別の商品名対応表 */}
      <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-x-6 gap-y-1 px-3 text-sm">
        {(["A", "B", "C"] as const).map((rank) => {
          const items = data.filter((d) => d.rank === rank);
          if (items.length === 0) return null;
          return (
            <div key={rank} className="flex items-start gap-2">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: RANK_COLORS[rank] }} />
              <div>
                <div className="font-medium text-solid-gray-700">{chartConfig[rank].label}</div>
                {items.map((d) => (
                  <div key={d.label} className="text-solid-gray-536">
                    {d.label}. {d.fullName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 self-start">
          <div className="h-0.5 w-5 rounded" style={{ backgroundColor: "var(--color-chart-4)" }} />
          <span className="text-solid-gray-700">累積構成比</span>
        </div>
      </div>
    </section>
  );
}
