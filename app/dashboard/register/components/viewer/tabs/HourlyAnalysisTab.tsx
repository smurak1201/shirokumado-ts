"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { HourlyAnalysisResponse } from "../../../types";

const HourlyChart = dynamic(() => import("../charts/HourlyChart"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-50" />,
});

const HourlyHeatmap = dynamic(() => import("../charts/HourlyHeatmap"), {
  ssr: false,
  loading: () => <div className="h-75 animate-pulse rounded-8 bg-solid-gray-50" />,
});

interface HourlyAnalysisTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

export default function HourlyAnalysisTab({
  dateFrom,
  dateTo,
  machineNo,
}: HourlyAnalysisTabProps) {
  const [data, setData] = useState<HourlyAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z009_DETAIL",
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<HourlyAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <div className="text-sm text-solid-gray-536">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-536">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HourlyChart hourly={data.hourly} />
      <HourlyHeatmap heatmap={data.heatmap} />
    </div>
  );
}
