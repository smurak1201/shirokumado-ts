// app/dashboard/register/components/viewer/hooks/usePeriodPresets.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";

interface PeriodPreset {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
}

interface PresetsResponse {
  presets: PeriodPreset[];
}

interface PresetCreateResponse {
  preset: PeriodPreset;
}

export function usePeriodPresets() {
  const [presets, setPresets] = useState<PeriodPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJson<PresetsResponse>("/api/register/presets");
      setPresets(data.presets);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const createPreset = useCallback(
    async (name: string, dateFrom: string, dateTo: string): Promise<boolean> => {
      try {
        const data = await fetchJson<PresetCreateResponse>(
          "/api/register/presets",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, dateFrom, dateTo }),
          }
        );
        setPresets((prev) => [data.preset, ...prev]);
        toast.success("プリセットを保存しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const deletePreset = useCallback(async (id: number): Promise<boolean> => {
    try {
      await fetchJson(`/api/register/presets?id=${id}`, {
        method: "DELETE",
      });
      setPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success("プリセットを削除しました");
      return true;
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      return false;
    }
  }, []);

  return { presets, isLoading, createPreset, deletePreset };
}
