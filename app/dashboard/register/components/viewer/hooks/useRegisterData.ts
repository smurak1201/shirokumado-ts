"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type {
  RegisterDataResponse,
  MachinesResponse,
  MachineInfo,
  AggregatedEntry,
  TimeSeriesEntry,
  PeriodType,
  Granularity,
} from "../../../types";

/** ローカルタイムの日付をYYYY-MM-DD形式にフォーマット（toISOString()はUTC変換で日付がずれるため使用しない） */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 期間タイプからデフォルトの日付範囲を計算（baseDate: 基準日、省略時は今日） */
function getDefaultDateRange(
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
function getDefaultGranularity(periodType: PeriodType): Granularity {
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

export interface UseRegisterDataReturn {
  // フィルタ状態
  periodType: PeriodType;
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  granularity: Granularity;
  /** カスタム比較期間（null=比較なし） */
  compareRange: { from: string; to: string } | null;

  // フィルタ操作
  setPeriodType: (type: PeriodType) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setMachineNo: (no: string | null) => void;
  navigatePeriod: (direction: "prev" | "next") => void;
  setCompareRange: (range: { from: string; to: string } | null) => void;

  // データ
  data: RegisterDataResponse | null;
  machines: MachineInfo[];
  totalCustomers: number;
  previousCustomers: number;
  topProducts: AggregatedEntry[];
  /** 曜日別チャート用の日別timeSeries（granularityがdayでない場合に別途取得） */
  dailyTimeSeries: TimeSeriesEntry[];
  /** 曜日別チャート用の日別客数timeSeries（Z009） */
  dailyCustomerTimeSeries: TimeSeriesEntry[];
  isLoading: boolean;

  // 手動リフレッシュ
  refetch: () => void;
  refetchMachines: () => Promise<void>;
}

export function useRegisterData(
  initialType: string = "Z005"
): UseRegisterDataReturn {
  const [periodType, setPeriodTypeState] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange("month"));
  const [machineNo, setMachineNo] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [compareRange, setCompareRange] = useState<{ from: string; to: string } | null>(null);

  const [data, setData] = useState<RegisterDataResponse | null>(null);
  const [machines, setMachines] = useState<MachineInfo[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [previousCustomers, setPreviousCustomers] = useState(0);
  const [topProducts, setTopProducts] = useState<AggregatedEntry[]>([]);
  const [dailyTimeSeries, setDailyTimeSeries] = useState<TimeSeriesEntry[]>([]);
  const [dailyCustomerTimeSeries, setDailyCustomerTimeSeries] = useState<TimeSeriesEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const latestDateRef = useRef<Date | undefined>(undefined);

  // レジ一覧を取得
  const fetchMachines = useCallback(async () => {
    try {
      const res = await fetchJson<MachinesResponse>("/api/register/machines");
      setMachines(res.machines);
      return res;
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
      return null;
    }
  }, []);

  // 初回: レジ一覧と最新データ日付を取得
  useEffect(() => {
    fetchMachines()
      .then((res) => {
        if (res?.latestDate) {
          const base = new Date(res.latestDate);
          latestDateRef.current = base;
          setDateRange(getDefaultDateRange("month", base));
        }
      })
      .finally(() => setReady(true));
  }, [fetchMachines]);

  // データ取得
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: initialType,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        view: "summary",
        groupBy: "combined",
        granularity,
      });
      // カスタムモード: 比較プリセット選択時のみ比較データを取得
      // 週/月/年モード: 常に前年同期を取得
      if (compareRange) {
        params.set("compareFrom", compareRange.from);
        params.set("compareTo", compareRange.to);
      } else if (periodType !== "custom") {
        params.set("compareLastYear", "true");
      }
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<RegisterDataResponse>(
        `/api/register/data?${params}`
      );
      setData(result);

      // Z009（客数）とZ004（商品売上）を並列取得
      const commonParams = {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        view: "summary",
        groupBy: "combined",
        granularity,
      };

      const z009Params = new URLSearchParams({ ...commonParams, type: "Z009", granularity: "day" });
      const z004Params = new URLSearchParams({ ...commonParams, type: "Z004" });
      // Z009にも比較期間パラメータを渡す（客数の比較に必要）
      if (compareRange) {
        z009Params.set("compareFrom", compareRange.from);
        z009Params.set("compareTo", compareRange.to);
      } else if (periodType !== "custom") {
        z009Params.set("compareLastYear", "true");
      }
      if (machineNo) {
        z009Params.set("machineNo", machineNo);
        z004Params.set("machineNo", machineNo);
      }

      // granularityがdayでない場合、曜日別チャート用に日別データも取得
      const needsDailyFetch = granularity !== "day";
      const dailyParams = needsDailyFetch
        ? new URLSearchParams({
            type: initialType,
            dateFrom: dateRange.from,
            dateTo: dateRange.to,
            view: "summary",
            groupBy: "combined",
            granularity: "day",
          })
        : null;
      if (dailyParams && machineNo) dailyParams.set("machineNo", machineNo);

      const fetches: Promise<RegisterDataResponse>[] = [
        fetchJson<RegisterDataResponse>(`/api/register/data?${z009Params}`),
        fetchJson<RegisterDataResponse>(`/api/register/data?${z004Params}`),
      ];
      if (dailyParams) {
        fetches.push(
          fetchJson<RegisterDataResponse>(`/api/register/data?${dailyParams}`)
        );
      }

      const results = await Promise.all(fetches);
      const z009Result = results[0]!;
      const z004Result = results[1]!;

      setTotalCustomers(z009Result.summary.totalQuantity);
      setPreviousCustomers(z009Result.previousPeriod?.totalQuantity ?? 0);
      setTopProducts(z004Result.aggregated.slice(0, 10));
      setDailyTimeSeries(
        needsDailyFetch ? results[2]!.timeSeries : result.timeSeries
      );
      setDailyCustomerTimeSeries(z009Result.timeSeries);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [initialType, dateRange, machineNo, granularity, compareRange, periodType]);

  // レジ一覧取得完了後にデータ取得開始（デバウンス付き）
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [ready, fetchData]);

  // 期間タイプ変更（最新データの日付を基準にする）
  const setPeriodType = useCallback((type: PeriodType) => {
    setPeriodTypeState(type);
    if (type !== "custom") {
      setDateRange(getDefaultDateRange(type, latestDateRef.current));
      setGranularity(getDefaultGranularity(type));
    }
  }, []);

  // 期間ナビゲーション（前/次）
  const navigatePeriod = useCallback(
    (direction: "prev" | "next") => {
      const offset = direction === "prev" ? -1 : 1;
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);

      switch (periodType) {
        case "day":
          from.setDate(from.getDate() + offset);
          to.setDate(to.getDate() + offset);
          break;
        case "week":
          from.setDate(from.getDate() + offset * 7);
          to.setDate(to.getDate() + offset * 7);
          break;
        case "month":
          from.setMonth(from.getMonth() + offset);
          to.setDate(1);
          to.setMonth(to.getMonth() + offset + 1);
          to.setDate(0);
          break;
        case "year":
          from.setFullYear(from.getFullYear() + offset);
          to.setFullYear(to.getFullYear() + offset);
          break;
        default:
          return;
      }

      setDateRange({
        from: formatLocalDate(from),
        to: formatLocalDate(to),
      });
    },
    [dateRange, periodType]
  );

  return {
    periodType,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    machineNo,
    granularity,
    compareRange,
    setPeriodType,
    setDateFrom: (date: string) => setDateRange((prev) => ({ ...prev, from: date })),
    setDateTo: (date: string) => setDateRange((prev) => ({ ...prev, to: date })),
    setMachineNo,
    navigatePeriod,
    setCompareRange,
    data,
    machines,
    totalCustomers,
    previousCustomers,
    topProducts,
    dailyTimeSeries,
    dailyCustomerTimeSeries,
    isLoading,
    refetch: fetchData,
    refetchMachines: async () => {
      try {
        const res = await fetchJson<MachinesResponse>(
          "/api/register/machines",
          { cache: "no-store" }
        );
        setMachines(res.machines);
      } catch (err) {
        toast.error(getUserFriendlyMessageJa(err));
      }
    },
  };
}
