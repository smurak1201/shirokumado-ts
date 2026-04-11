import type { Granularity, PeriodType, TimeSeriesEntry } from "../types";

/** ローカルタイムの日付をYYYY-MM-DD形式にフォーマット（toISOString()はUTC変換で日付がずれるため使用しない） */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 期間タイプからデフォルトの日付範囲を計算（baseDate: 基準日、省略時は今日） */
export function getDefaultDateRange(
  periodType: PeriodType,
  baseDate?: Date
): { from: string; to: string } {
  const base = baseDate ?? new Date();
  const baseStr = formatLocalDate(base);

  switch (periodType) {
    case "day":
      return { from: baseStr, to: baseStr };
    case "week": {
      const d = new Date(base);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      const weekStart = formatLocalDate(d);
      d.setDate(d.getDate() + 6);
      const weekEnd = formatLocalDate(d);
      return { from: weekStart, to: weekEnd };
    }
    case "month": {
      const monthStart = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      const monthEnd = formatLocalDate(lastDay);
      return { from: monthStart, to: monthEnd };
    }
    case "year": {
      return { from: `${base.getFullYear()}-01-01`, to: `${base.getFullYear()}-12-31` };
    }
    case "custom":
      return { from: baseStr, to: baseStr };
  }
}

/** 期間タイプに対応するデフォルトの粒度 */
export function getDefaultGranularity(periodType: PeriodType): Granularity {
  switch (periodType) {
    case "day":
      return "day";
    case "week":
      return "day";
    case "month":
      return "day";
    case "year":
      return "month";
    case "custom":
      return "day";
  }
}

/** 前年の同じ期間のdateFrom/dateToを計算 */
export function getLastYearRange(
  dateFrom: string,
  dateTo: string
): { from: string; to: string } {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  from.setFullYear(from.getFullYear() - 1);
  to.setFullYear(to.getFullYear() - 1);
  return {
    from: from.toISOString().split("T")[0]!,
    to: to.toISOString().split("T")[0]!,
  };
}

/** dateFrom〜dateToの範囲で粒度に応じた期間ラベルを生成 */
export function generatePeriods(
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): string[] {
  const periods: string[] = [];
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  switch (granularity) {
    case "day": {
      const d = new Date(from);
      while (d <= to) {
        periods.push(d.toISOString().split("T")[0]!);
        d.setDate(d.getDate() + 1);
      }
      break;
    }
    case "week": {
      // 週の開始日（月曜）を起点に7日刻み
      const d = new Date(from);
      while (d <= to) {
        periods.push(d.toISOString().split("T")[0]!);
        d.setDate(d.getDate() + 7);
      }
      break;
    }
    case "month": {
      const d = new Date(from);
      while (d <= to) {
        const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        periods.push(label);
        d.setMonth(d.getMonth() + 1);
      }
      break;
    }
    case "year": {
      const d = new Date(from);
      while (d.getFullYear() <= to.getFullYear()) {
        periods.push(String(d.getFullYear()));
        d.setFullYear(d.getFullYear() + 1);
      }
      break;
    }
  }
  return periods;
}

/** 期間内の全ポイントを生成し、データがない日は0で埋める */
export function fillTimeSeries(
  timeSeries: TimeSeriesEntry[],
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): TimeSeriesEntry[] {
  const dataMap = new Map(timeSeries.map((e) => [e.period, e]));
  const periods = generatePeriods(dateFrom, dateTo, granularity);
  return periods.map(
    (period) => dataMap.get(period) ?? { period, totalAmount: 0, totalQuantity: 0 }
  );
}
