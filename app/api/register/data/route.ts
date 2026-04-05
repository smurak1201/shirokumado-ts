import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import type {
  RegisterDataResponse,
  RegisterDataByMachineResponse,
  Granularity,
  GroupBy,
  TimeSeriesEntry,
  AggregatedEntry,
  DataSummary,
  PeriodStat,
} from "@/app/dashboard/register/types";

export const dynamic = "force-dynamic";

// レジデータは取り込み後に変更されないため、ブラウザキャッシュで再リクエストを抑制
const CACHE_MAX_AGE = 300; // 5分

function cachedSuccess<T>(data: T) {
  const res = apiSuccess(data);
  res.headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE}`);
  return res;
}

/** 期間内の全日付を生成（定休日を0埋めするため） */
function generateDateRange(from: Date, to: Date): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  while (current <= to) {
    dates.push(current.toISOString().split("T")[0]!);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** 日付を粒度に応じたキーに変換 */
function toGranularityKey(dateStr: string, granularity: Granularity): string {
  const date = new Date(dateStr);
  switch (granularity) {
    case "day":
      return dateStr;
    case "week": {
      // ISO週番号の月曜日を基準
      const d = new Date(date);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toISOString().split("T")[0]!;
    }
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "year":
      return `${date.getFullYear()}`;
  }
}

/** 粒度に応じた期間キーの全リストを生成 */
function generatePeriodKeys(
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): string[] {
  const allDates = generateDateRange(new Date(dateFrom), new Date(dateTo));
  const keySet = new Set<string>();
  for (const d of allDates) {
    keySet.add(toGranularityKey(d, granularity));
  }
  return [...keySet].sort();
}

/** 前年同期の日付範囲を計算 */
function getLastYearRange(
  dateFrom: string,
  dateTo: string
): { from: Date; to: Date } {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  from.setFullYear(from.getFullYear() - 1);
  to.setFullYear(to.getFullYear() - 1);
  return { from, to };
}

/** timeSeriesから統計を計算 */
function calculateSummary(
  timeSeries: TimeSeriesEntry[],
  totalAmount: number,
  totalQuantity: number,
  recordCount: number
): DataSummary {
  // 0を除外したエントリ（定休日を除く）
  const nonZeroAmount = timeSeries.filter((e) => e.totalAmount > 0);
  const nonZeroQuantity = timeSeries.filter((e) => e.totalQuantity > 0);
  const periodCount = timeSeries.length || 1;

  const maxAmountEntry = nonZeroAmount.reduce<PeriodStat>(
    (max, e) => (e.totalAmount > max.value ? { period: e.period, value: e.totalAmount } : max),
    { period: "", value: 0 }
  );
  const minAmountEntry = nonZeroAmount.reduce<PeriodStat>(
    (min, e) => (e.totalAmount < min.value ? { period: e.period, value: e.totalAmount } : min),
    { period: nonZeroAmount[0]?.period ?? "", value: nonZeroAmount[0]?.totalAmount ?? 0 }
  );
  const maxQuantityEntry = nonZeroQuantity.reduce<PeriodStat>(
    (max, e) => (e.totalQuantity > max.value ? { period: e.period, value: e.totalQuantity } : max),
    { period: "", value: 0 }
  );
  const minQuantityEntry = nonZeroQuantity.reduce<PeriodStat>(
    (min, e) => (e.totalQuantity < min.value ? { period: e.period, value: e.totalQuantity } : min),
    { period: nonZeroQuantity[0]?.period ?? "", value: nonZeroQuantity[0]?.totalQuantity ?? 0 }
  );

  return {
    totalAmount,
    totalQuantity,
    recordCount,
    avgAmount: Math.round(totalAmount / periodCount),
    avgQuantity: Math.round(totalQuantity / periodCount),
    maxAmount: maxAmountEntry,
    minAmount: minAmountEntry,
    maxQuantity: maxQuantityEntry,
    minQuantity: minQuantityEntry,
  };
}

/** Z001 売上明細データを取得 */
async function fetchZ001Data(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ itemName: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerSalesSummary.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z001)"
  ).then((rows) =>
    rows.map((r) => ({
      itemName: r.itemName,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** Z004 商品売上データを取得 */
async function fetchZ004Data(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ itemName: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerProductSale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z004)"
  ).then((rows) =>
    rows.map((r) => ({
      itemName: r.itemName,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** 行データから時系列を構築（粒度に応じて集約、0埋め） */
function buildTimeSeries(
  rows: Array<{ amount: number; quantity: number; date: Date }>,
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): TimeSeriesEntry[] {
  const periodKeys = generatePeriodKeys(dateFrom, dateTo, granularity);
  const map = new Map<string, { totalAmount: number; totalQuantity: number }>();

  for (const key of periodKeys) {
    map.set(key, { totalAmount: 0, totalQuantity: 0 });
  }

  for (const row of rows) {
    const dateStr = row.date.toISOString().split("T")[0]!;
    const key = toGranularityKey(dateStr, granularity);
    const entry = map.get(key);
    if (entry) {
      entry.totalAmount += row.amount;
      entry.totalQuantity += row.quantity;
    }
  }

  return periodKeys.map((key) => ({
    period: key,
    totalAmount: map.get(key)?.totalAmount ?? 0,
    totalQuantity: map.get(key)?.totalQuantity ?? 0,
  }));
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const machineNo = searchParams.get("machineNo") || null;
  const groupBy = (searchParams.get("groupBy") || "combined") as GroupBy;
  const granularity = (searchParams.get("granularity") || "day") as Granularity;
  const compareLastYear = searchParams.get("compareLastYear") === "true";

  if (!type || !dateFrom || !dateTo) {
    throw new ValidationError("type, dateFrom, dateTo は必須です");
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ValidationError("日付の形式が不正です");
  }

  if (type === "Z004") {
    const z004Rows = await fetchZ004Data(from, to, machineNo);

    // 商品別集計
    const itemMap = new Map<string, { q: number; a: number }>();
    for (const r of z004Rows) {
      const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
      existing.q += r.quantity;
      existing.a += r.amount;
      itemMap.set(r.itemName, existing);
    }
    const aggregated: AggregatedEntry[] = [];
    for (const [name, val] of itemMap) {
      aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
    }
    // 金額降順でソート
    aggregated.sort((a, b) => b.totalAmount - a.totalAmount);

    const timeSeries = buildTimeSeries(
      z004Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      dateFrom,
      dateTo,
      granularity
    );

    const totalAmount = z004Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z004Rows.reduce((s, r) => s + r.quantity, 0);

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z004Rows.length),
    };

    return cachedSuccess(response);
  }

  if (type === "Z001" || type === "Z009") {
    if (groupBy === "machine") {
      // レジ別集計
      const z001Rows = await fetchZ001Data(from, to, null);
      const machineNos = [...new Set(z001Rows.map((r) => r.machineNo))];

      const byMachine: Record<string, RegisterDataResponse> = {};

      for (const mNo of machineNos) {
        const machineRows = z001Rows.filter((r) => r.machineNo === mNo);
        const timeSeries = buildTimeSeries(
          machineRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
          dateFrom,
          dateTo,
          granularity
        );

        const totalAmount = machineRows.reduce((s, r) => s + r.amount, 0);
        const totalQuantity = machineRows.reduce((s, r) => s + r.quantity, 0);

        const aggregated: AggregatedEntry[] = [];
        const itemMap = new Map<string, { q: number; a: number }>();
        for (const r of machineRows) {
          const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
          existing.q += r.quantity;
          existing.a += r.amount;
          itemMap.set(r.itemName, existing);
        }
        for (const [name, val] of itemMap) {
          aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
        }

        byMachine[mNo] = {
          aggregated,
          timeSeries,
          summary: calculateSummary(timeSeries, totalAmount, totalQuantity, machineRows.length),
        };
      }

      const response: RegisterDataByMachineResponse = { byMachine };
      return cachedSuccess(response);
    }

    // 合算集計
    const z001Rows = await fetchZ001Data(from, to, machineNo);

    // 項目別集計
    const itemMap = new Map<string, { q: number; a: number }>();
    for (const r of z001Rows) {
      const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
      existing.q += r.quantity;
      existing.a += r.amount;
      itemMap.set(r.itemName, existing);
    }
    const aggregated: AggregatedEntry[] = [];
    for (const [name, val] of itemMap) {
      aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
    }

    // 時系列（日別売上推移用）
    const timeSeries = buildTimeSeries(
      z001Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      dateFrom,
      dateTo,
      granularity
    );

    const totalAmount = z001Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z001Rows.reduce((s, r) => s + r.quantity, 0);

    // 前年同期比
    let previousPeriod: { totalAmount: number; totalQuantity: number } | undefined;
    const lastYear = getLastYearRange(dateFrom, dateTo);
    const prevRows = await fetchZ001Data(lastYear.from, lastYear.to, machineNo);
    if (prevRows.length > 0) {
      previousPeriod = {
        totalAmount: prevRows.reduce((s, r) => s + r.amount, 0),
        totalQuantity: prevRows.reduce((s, r) => s + r.quantity, 0),
      };
    }

    // 前年同期
    let lastYearTimeSeries: TimeSeriesEntry[] | undefined;
    if (compareLastYear) {
      const ly = getLastYearRange(dateFrom, dateTo);
      const lyDateFrom = ly.from.toISOString().split("T")[0]!;
      const lyDateTo = ly.to.toISOString().split("T")[0]!;
      const lyRows = await fetchZ001Data(ly.from, ly.to, machineNo);
      lastYearTimeSeries = buildTimeSeries(
        lyRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
        lyDateFrom,
        lyDateTo,
        granularity
      );
    }

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z001Rows.length),
      previousPeriod,
      lastYearTimeSeries,
    };

    return cachedSuccess(response);
  }

  throw new ValidationError(`未対応のデータ種別です: ${type}`);
});
