// app/dashboard/register/components/viewer/hooks/useSalesTarget.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";

export interface SalesTarget {
  id: number;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
}

interface TargetsResponse {
  targets: SalesTarget[];
}

interface TargetSingleResponse {
  target: SalesTarget;
}

export function useSalesTarget(initialYear: number) {
  const [year, setYear] = useState(initialYear);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTargets = useCallback(async (targetYear: number) => {
    try {
      setIsLoading(true);
      const data = await fetchJson<TargetsResponse>(
        `/api/register/targets?year=${targetYear}`
      );
      setTargets(data.targets);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets(year);
  }, [year, fetchTargets]);

  const changeYear = useCallback((newYear: number) => {
    setYear(newYear);
  }, []);

  const createTarget = useCallback(
    async (month: number, amount: number): Promise<boolean> => {
      try {
        const data = await fetchJson<TargetSingleResponse>(
          "/api/register/targets",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, month, amount }),
          }
        );
        setTargets((prev) =>
          [...prev, data.target].sort((a, b) => a.month - b.month)
        );
        toast.success(`${year}年${month}月の目標を設定しました`);
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    [year]
  );

  const updateTarget = useCallback(
    async (id: number, amount: number): Promise<boolean> => {
      try {
        const data = await fetchJson<TargetSingleResponse>(
          "/api/register/targets",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, amount }),
          }
        );
        setTargets((prev) =>
          prev.map((t) => (t.id === id ? data.target : t))
        );
        toast.success("目標金額を更新しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const deleteTarget = useCallback(async (id: number): Promise<boolean> => {
    try {
      await fetchJson(`/api/register/targets?id=${id}`, {
        method: "DELETE",
      });
      setTargets((prev) => prev.filter((t) => t.id !== id));
      toast.success("目標を削除しました");
      return true;
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      return false;
    }
  }, []);

  /** 指定月の目標を取得（なければnull） */
  const getTargetForMonth = useCallback(
    (month: number): SalesTarget | null => {
      return targets.find((t) => t.month === month) ?? null;
    },
    [targets]
  );

  return {
    year,
    targets,
    isLoading,
    changeYear,
    createTarget,
    updateTarget,
    deleteTarget,
    getTargetForMonth,
  };
}
