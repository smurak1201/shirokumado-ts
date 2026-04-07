"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import type { AggregatedEntry } from "../../../types";

interface TopProductsDonutProps {
  products: AggregatedEntry[];
}

// デジタル庁デザインシステム準拠のパレット（600番台を基本に使用）
const COLORS = [
  "#3460FB",  // Blue 600
  "#008BF2",  // LightBlue 600
  "#259D63",  // Green 600
  "#FB5B01",  // Orange 600
  "#00A3BF",  // Cyan 600
  "#FE3939",  // Red 600
  "#0055AD",  // LightBlue 900
  "#115A36",  // Green 900
  "#AC3E00",  // Orange 900
  "#006F83",  // Cyan 900
];

function formatAmount(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

export default function TopProductsDonut({ products }: TopProductsDonutProps) {
  if (products.length === 0) return null;

  const total = products.reduce((sum, e) => sum + e.totalAmount, 0);

  const chartConfig = products.reduce<Record<string, { label: string; color: string }>>(
    (acc, entry, i) => {
      acc[entry.itemName] = {
        label: entry.itemName,
        color: COLORS[i]!,
      };
      return acc;
    },
    {}
  ) satisfies ChartConfig;

  return (
    <section className="rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="売上上位10商品">
      <h3 className="mb-4 text-sm font-medium text-solid-gray-700">売上上位10商品</h3>
      <ChartContainer config={chartConfig} className="mx-auto h-62.5 w-full">
        <PieChart>
          <Pie
            data={products}
            dataKey="totalAmount"
            nameKey="itemName"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            cornerRadius={3}
            startAngle={90}
            endAngle={-270}
          >
            {products.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
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
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                  </>
                )}
                nameKey="itemName"
              />
            }
          />
        </PieChart>
      </ChartContainer>

      {/* 凡例テーブル */}
      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">商品別売上ランキング</caption>
        <thead>
          <tr className="border-b border-solid-gray-100 text-sm text-solid-gray-536">
            <th className="pb-2 text-center font-normal">#</th>
            <th className="pb-2 text-center font-normal">商品名</th>
            <th className="pb-2 text-center font-normal">単価</th>
            <th className="pb-2 text-center font-normal">個数</th>
            <th className="pb-2 text-center font-normal">売上合計</th>
            <th className="pb-2 text-center font-normal">割合</th>
          </tr>
        </thead>
        <tbody>
          {products.map((entry, i) => {
            const pct = total > 0 ? Math.round((entry.totalAmount / total) * 100) : 0;
            return (
              <tr key={entry.itemName} className="border-b border-solid-gray-50">
                <td className="py-2 text-center text-solid-gray-536">{i + 1}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="truncate text-solid-gray-700">{entry.itemName}</span>
                  </div>
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-solid-gray-700">
                  {entry.totalQuantity > 0
                    ? `${formatAmount(Math.round(entry.totalAmount / entry.totalQuantity))}円`
                    : "-"}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-solid-gray-700">
                  {formatAmount(entry.totalQuantity)}
                </td>
                <td className="py-2 text-right tabular-nums text-solid-gray-700">
                  {formatAmount(entry.totalAmount)}円
                </td>
                <td className="py-2 text-right tabular-nums text-solid-gray-536">
                  {pct}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-solid-gray-200">
            <td colSpan={4} className="py-2 font-medium text-solid-gray-536">
              上位10商品 合計
            </td>
            <td className="py-2 text-right tabular-nums font-medium text-solid-gray-700">
              {formatAmount(total)}円
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
