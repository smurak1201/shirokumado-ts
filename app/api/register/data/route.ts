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
  HourlyAnalysisResponse,
  HourlyEntry,
  HourlyHeatmapEntry,
  ProductAnalysisResponse,
  ProductEntry,
  TransactionAnalysisResponse,
  TransactionEntry,
  RawDataResponse,
  RawDataEntry,
} from "@/app/dashboard/register/types";

export const dynamic = "force-dynamic";

// レジデータは取り込み後に変更されないため、ブラウザキャッシュで再リクエストを抑制
const CACHE_MAX_AGE = 300; // 5分

function cachedSuccess<T>(data: T) {
  const res = apiSuccess(data);
  res.headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE}`);
  return res;
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
  // 売上ゼロの期間を除外（max/min計算用）
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
  Array<{ itemCode: string; itemName: string; quantity: number; amount: number; date: Date; machineNo: string }>
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
      itemCode: r.itemCode,
      itemName: r.itemName,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** Z005 部門売上データを取得 */
async function fetchZ005Data(
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
      prisma.registerDepartmentSale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z005)"
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

/** Z009 時間帯別売上データを取得 */
async function fetchZ009Data(
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<
  Array<{ startTime: string; endTime: string; quantity: number; amount: number; date: Date; machineNo: string }>
> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  return safePrismaOperation(
    () =>
      prisma.registerHourlySale.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z009)"
  ).then((rows) =>
    rows.map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
      quantity: r.quantity,
      amount: r.amount,
      date: r.settlement.date,
      machineNo: r.settlement.machineNo,
    }))
  );
}

/** Z002 取引キーデータを取得 */
async function fetchZ002Data(
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
      prisma.registerTransactionKey.findMany({
        where,
        include: { settlement: { select: { date: true, machineNo: true } } },
      }),
    "GET /api/register/data (Z002)"
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


/** 明細データを取得（全種別対応） */
async function fetchRawData(
  type: string,
  dateFrom: Date,
  dateTo: Date,
  machineNo: string | null
): Promise<RawDataEntry[]> {
  const where = {
    settlement: {
      date: { gte: dateFrom, lte: dateTo },
      ...(machineNo ? { machineNo } : {}),
    },
  };

  const settlementSelect = { date: true, time: true, machineNo: true } as const;

  switch (type) {
    case "Z001": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerSalesSummary.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z001)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0]!,
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z002": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerTransactionKey.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z002)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0]!,
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z004": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerProductSale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z004)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0]!,
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemCode: r.itemCode,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z005": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerDepartmentSale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z005)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0]!,
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: r.itemName,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    case "Z009": {
      const rows = await safePrismaOperation(
        () =>
          prisma.registerHourlySale.findMany({
            where,
            include: { settlement: { select: settlementSelect } },
            orderBy: [{ settlement: { date: "asc" } }, { recordNo: "asc" }],
          }),
        "GET /api/register/data (raw Z009)"
      );
      return rows.map((r) => ({
        date: r.settlement.date.toISOString().split("T")[0]!,
        time: r.settlement.time,
        machineNo: r.settlement.machineNo,
        recordNo: r.recordNo,
        itemName: `${r.startTime}-${r.endTime}`,
        startTime: r.startTime,
        endTime: r.endTime,
        quantity: r.quantity,
        amount: r.amount,
      }));
    }
    default:
      return [];
  }
}

/** 行データから時系列を構築（粒度に応じて集約、実データのみ） */
function buildTimeSeries(
  rows: Array<{ amount: number; quantity: number; date: Date }>,
  granularity: Granularity
): TimeSeriesEntry[] {
  const map = new Map<string, { totalAmount: number; totalQuantity: number }>();

  for (const row of rows) {
    const dateStr = row.date.toISOString().split("T")[0]!;
    const key = toGranularityKey(dateStr, granularity);
    const entry = map.get(key) ?? { totalAmount: 0, totalQuantity: 0 };
    entry.totalAmount += row.amount;
    entry.totalQuantity += row.quantity;
    map.set(key, entry);
  }

  return [...map.keys()].sort().map((key) => ({
    period: key,
    totalAmount: map.get(key)!.totalAmount,
    totalQuantity: map.get(key)!.totalQuantity,
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

  if (type === "Z005") {
    if (groupBy === "machine") {
      // レジ別集計
      const z005Rows = await fetchZ005Data(from, to, null);
      const machineNos = [...new Set(z005Rows.map((r) => r.machineNo))];

      const byMachine: Record<string, RegisterDataResponse> = {};

      for (const mNo of machineNos) {
        const machineRows = z005Rows.filter((r) => r.machineNo === mNo);
        const timeSeries = buildTimeSeries(
          machineRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
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
    const z005Rows = await fetchZ005Data(from, to, machineNo);

    // 部門別集計
    const itemMap = new Map<string, { q: number; a: number }>();
    for (const r of z005Rows) {
      const existing = itemMap.get(r.itemName) ?? { q: 0, a: 0 };
      existing.q += r.quantity;
      existing.a += r.amount;
      itemMap.set(r.itemName, existing);
    }
    const aggregated: AggregatedEntry[] = [];
    for (const [name, val] of itemMap) {
      aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
    }

    const timeSeries = buildTimeSeries(
      z005Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      granularity
    );

    const totalAmount = z005Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z005Rows.reduce((s, r) => s + r.quantity, 0);

    // 前年同期比
    let previousPeriod: { totalAmount: number; totalQuantity: number } | undefined;
    const lastYear = getLastYearRange(dateFrom, dateTo);
    const prevRows = await fetchZ005Data(lastYear.from, lastYear.to, machineNo);
    if (prevRows.length > 0) {
      previousPeriod = {
        totalAmount: prevRows.reduce((s, r) => s + r.amount, 0),
        totalQuantity: prevRows.reduce((s, r) => s + r.quantity, 0),
      };
    }

    // 前年同期時系列
    let lastYearTimeSeries: TimeSeriesEntry[] | undefined;
    if (compareLastYear) {
      const ly = getLastYearRange(dateFrom, dateTo);
      const lyRows = await fetchZ005Data(ly.from, ly.to, machineNo);
      lastYearTimeSeries = buildTimeSeries(
        lyRows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
        granularity
      );
    }

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z005Rows.length),
      previousPeriod,
      lastYearTimeSeries,
    };

    return cachedSuccess(response);
  }

  if (type === "Z009") {
    const z009Rows = await fetchZ009Data(from, to, machineNo);

    // 時間帯別集計
    const itemMap = new Map<string, { q: number; a: number }>();
    for (const r of z009Rows) {
      const label = `${r.startTime}-${r.endTime}`;
      const existing = itemMap.get(label) ?? { q: 0, a: 0 };
      existing.q += r.quantity;
      existing.a += r.amount;
      itemMap.set(label, existing);
    }
    const aggregated: AggregatedEntry[] = [];
    for (const [name, val] of itemMap) {
      aggregated.push({ itemName: name, totalQuantity: val.q, totalAmount: val.a });
    }

    const timeSeries = buildTimeSeries(
      z009Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      granularity
    );

    const totalAmount = z009Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z009Rows.reduce((s, r) => s + r.quantity, 0);

    // 前年同期比
    let previousPeriod: { totalAmount: number; totalQuantity: number } | undefined;
    const lastYear = getLastYearRange(dateFrom, dateTo);
    const prevRows = await fetchZ009Data(lastYear.from, lastYear.to, machineNo);
    if (prevRows.length > 0) {
      previousPeriod = {
        totalAmount: prevRows.reduce((s, r) => s + r.amount, 0),
        totalQuantity: prevRows.reduce((s, r) => s + r.quantity, 0),
      };
    }

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z009Rows.length),
      previousPeriod,
    };

    return cachedSuccess(response);
  }

  if (type === "Z001") {
    // Z001は分析には使用しないが、個別参照用に残す
    const z001Rows = await fetchZ001Data(from, to, machineNo);

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

    const timeSeries = buildTimeSeries(
      z001Rows.map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      granularity
    );

    const totalAmount = z001Rows.reduce((s, r) => s + r.amount, 0);
    const totalQuantity = z001Rows.reduce((s, r) => s + r.quantity, 0);

    const response: RegisterDataResponse = {
      aggregated,
      timeSeries,
      summary: calculateSummary(timeSeries, totalAmount, totalQuantity, z001Rows.length),
    };

    return cachedSuccess(response);
  }

  // Z009_DETAIL: 時間帯分析タブ用
  if (type === "Z009_DETAIL") {
    const rows = await fetchZ009Data(from, to, machineNo);

    // 時間帯別集計（期間内平均）
    const hourlyMap = new Map<string, { totalQuantity: number; totalAmount: number; count: number }>();
    for (const r of rows) {
      const key = `${r.startTime}-${r.endTime}`;
      const entry = hourlyMap.get(key) ?? { totalQuantity: 0, totalAmount: 0, count: 0 };
      entry.totalQuantity += r.quantity;
      entry.totalAmount += r.amount;
      entry.count += 1;
      hourlyMap.set(key, entry);
    }

    // 日数を計算（平均に使用）
    const dateSet = new Set(rows.map((r) => r.date.toISOString().split("T")[0]));
    const dayCount = dateSet.size || 1;

    const hourly: HourlyEntry[] = [...hourlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [startTime, endTime] = key.split("-");
        return {
          startTime: startTime!,
          endTime: endTime!,
          totalQuantity: Math.round(val.totalQuantity / dayCount),
          totalAmount: Math.round(val.totalAmount / dayCount),
        };
      });

    // 曜日x時間帯ヒートマップ（曜日ごとの出現日数で割って平均値を算出）
    const heatmapMap = new Map<string, { totalAmount: number; totalQuantity: number }>();
    const dayOfWeekCounts = new Map<number, number>();
    const seenDates = new Map<number, Set<string>>();
    for (const r of rows) {
      const dayOfWeek = r.date.getDay();
      const key = `${dayOfWeek}-${r.startTime}`;
      const entry = heatmapMap.get(key) ?? { totalAmount: 0, totalQuantity: 0 };
      entry.totalAmount += r.amount;
      entry.totalQuantity += r.quantity;
      heatmapMap.set(key, entry);

      const dateStr = r.date.toISOString().split("T")[0]!;
      const seen = seenDates.get(dayOfWeek) ?? new Set<string>();
      seen.add(dateStr);
      seenDates.set(dayOfWeek, seen);
    }
    for (const [dow, dates] of seenDates) {
      dayOfWeekCounts.set(dow, dates.size);
    }

    const heatmap: HourlyHeatmapEntry[] = [...heatmapMap.entries()]
      .map(([key, val]) => {
        const [dow, startTime] = key.split("-");
        const dowNum = parseInt(dow!, 10);
        const count = dayOfWeekCounts.get(dowNum) ?? 1;
        return {
          dayOfWeek: dowNum,
          startTime: startTime!,
          totalAmount: Math.round(val.totalAmount / count),
          totalQuantity: Math.round(val.totalQuantity / count),
        };
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

    const response: HourlyAnalysisResponse = { hourly, heatmap };
    return cachedSuccess(response);
  }

  // Z004_PRODUCT: 商品分析タブ用（既存Z004はRegisterDataResponse形式で売上概要に使用中）
  if (type === "Z004_PRODUCT") {
    const rows = await fetchZ004Data(from, to, machineNo);

    // 商品別集計（商品コードが未設定（全桁0）の場合は商品名でグループ化）
    const productMap = new Map<string, { itemCode: string; itemName: string; quantity: number; amount: number }>();
    for (const r of rows) {
      const isCodeEmpty = /^0+$/.test(r.itemCode);
      const key = isCodeEmpty ? r.itemName : r.itemCode;
      const entry = productMap.get(key) ?? { itemCode: r.itemCode, itemName: r.itemName, quantity: 0, amount: 0 };
      entry.quantity += r.quantity;
      entry.amount += r.amount;
      productMap.set(key, entry);
    }

    // 金額降順でソート
    const sorted = [...productMap.entries()]
      .map(([, val]) => ({
        itemCode: val.itemCode,
        itemName: val.itemName,
        totalQuantity: val.quantity,
        totalAmount: val.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // ABC分析: 累積構成比を計算してランク付け
    const totalAmount = sorted.reduce((sum, p) => sum + p.totalAmount, 0);
    let cumulative = 0;
    const products: ProductEntry[] = sorted.map((p) => {
      cumulative += p.totalAmount;
      const ratio = totalAmount > 0 ? Math.round((cumulative / totalAmount) * 1000) / 10 : 0;
      const rank: "A" | "B" | "C" = ratio <= 70 ? "A" : ratio <= 90 ? "B" : "C";
      return { ...p, rank, cumulativeRatio: ratio };
    });

    const response: ProductAnalysisResponse = { products };
    return cachedSuccess(response);
  }

  // Z002: 取引管理タブ用
  if (type === "Z002") {
    const rows = await fetchZ002Data(from, to, machineNo);

    // 項目別集計
    const txMap = new Map<string, { quantity: number; amount: number }>();
    for (const r of rows) {
      const entry = txMap.get(r.itemName) ?? { quantity: 0, amount: 0 };
      entry.quantity += r.quantity;
      entry.amount += r.amount;
      txMap.set(r.itemName, entry);
    }

    const transactions: TransactionEntry[] = [...txMap.entries()]
      .map(([name, val]) => ({
        itemName: name,
        totalQuantity: val.quantity,
        totalAmount: val.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 訂正関連の集計
    const correctionRows = transactions.filter((t) => t.itemName.includes("訂正"));
    const correctionCount = correctionRows.reduce((sum, t) => sum + t.totalQuantity, 0);
    const correctionAmount = correctionRows.reduce((sum, t) => sum + t.totalAmount, 0);

    // 訂正件数・金額の時系列推移
    const correctionTimeSeries = buildTimeSeries(
      rows
        .filter((r) => r.itemName.includes("訂正"))
        .map((r) => ({ amount: r.amount, quantity: r.quantity, date: r.date })),
      granularity
    );

    const response: TransactionAnalysisResponse = {
      transactions,
      timeSeries: correctionTimeSeries,
      correctionCount,
      correctionAmount,
    };
    return cachedSuccess(response);
  }

  // RAW: 明細データタブ用
  if (type === "RAW_Z001" || type === "RAW_Z002" || type === "RAW_Z004" || type === "RAW_Z005" || type === "RAW_Z009") {
    const rawType = type.replace("RAW_", "");
    const rawRows = await fetchRawData(rawType, from, to, machineNo);
    const response: RawDataResponse = { rows: rawRows };
    return cachedSuccess(response);
  }

  throw new ValidationError(`未対応のデータ種別です: ${type}`);
});
