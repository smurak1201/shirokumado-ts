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

/** 期間タイプからデフォルトの日付範囲を計算（baseDate: 基準日、省略時は今日） */
function getDefaultDateRange(
  periodType: PeriodType,
  baseDate?: Date
): { from: string; to: string } {
  const base = baseDate ?? new Date();
  const baseStr = base.toISOString().split("T")[0]!;

  switch (periodType) {
    case "day":
      return { from: baseStr, to: baseStr };
    case "week": {
      const d = new Date(base);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      const weekStart = d.toISOString().split("T")[0]!;
      d.setDate(d.getDate() + 6);
      const weekEnd = d.toISOString().split("T")[0]!;
      return { from: weekStart, to: weekEnd };
    }
    case "month": {
      const monthStart = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      const monthEnd = lastDay.toISOString().split("T")[0]!;
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

  // フィルタ操作
  setPeriodType: (type: PeriodType) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setMachineNo: (no: string | null) => void;
  navigatePeriod: (direction: "prev" | "next") => void;

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
}

export function useRegisterData(
  initialType: string = "Z005"
): UseRegisterDataReturn {
  const [periodType, setPeriodTypeState] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange("month"));
  const [machineNo, setMachineNo] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");

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

  // レジ一覧と最新データ日付を取得（初回のみ）
  useEffect(() => {
    fetchJson<MachinesResponse>("/api/register/machines")
      .then((res) => {
        setMachines(res.machines);
        if (res.latestDate) {
          const base = new Date(res.latestDate);
          latestDateRef.current = base;
          setDateRange(getDefaultDateRange("month", base));
        }
      })
      .catch((err) => toast.error(getUserFriendlyMessageJa(err)))
      .finally(() => setReady(true));
  }, []);

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
        compareLastYear: "true",
      });
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
  }, [initialType, dateRange, machineNo, granularity]);

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
        from: from.toISOString().split("T")[0]!,
        to: to.toISOString().split("T")[0]!,
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
    setPeriodType,
    setDateFrom: (date: string) => setDateRange((prev) => ({ ...prev, from: date })),
    setDateTo: (date: string) => setDateRange((prev) => ({ ...prev, to: date })),
    setMachineNo,
    navigatePeriod,
    data,
    machines,
    totalCustomers,
    previousCustomers,
    topProducts,
    dailyTimeSeries,
    dailyCustomerTimeSeries,
    isLoading,
    refetch: fetchData,
  };
}
