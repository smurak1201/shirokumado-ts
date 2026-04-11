"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import {
  ANALYSIS_TABS,
  type PeriodType,
  type AnalysisTabValue,
} from "@/app/dashboard/register/types";

const PERIOD_TYPES: readonly PeriodType[] = ["day", "week", "month", "year", "custom"];

function isPeriodType(v: string | undefined): v is PeriodType {
  return v !== undefined && (PERIOD_TYPES as readonly string[]).includes(v);
}

function isAnalysisTab(v: string | undefined): v is AnalysisTabValue {
  return v !== undefined && ANALYSIS_TABS.some((t) => t.value === v);
}

interface DashboardSetting {
  id: number;
  key: string;
  value: string;
}

interface SettingsResponse {
  settings: DashboardSetting[];
}

interface SettingSingleResponse {
  setting: DashboardSetting;
}

export interface DashboardDefaults {
  defaultPeriodType: PeriodType;
  defaultTab: AnalysisTabValue;
}

const DEFAULT_VALUES: DashboardDefaults = {
  defaultPeriodType: "month",
  defaultTab: "overview",
};

export function useDashboardSettings() {
  const [defaults, setDefaults] = useState<DashboardDefaults>(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJson<SettingsResponse>("/api/register/settings");
      const settingsMap = new Map(
        data.settings.map((s) => [s.key, s.value])
      );
      const rawPeriod = settingsMap.get("defaultPeriodType");
      const rawTab = settingsMap.get("defaultTab");
      setDefaults({
        defaultPeriodType: isPeriodType(rawPeriod)
          ? rawPeriod
          : DEFAULT_VALUES.defaultPeriodType,
        defaultTab: isAnalysisTab(rawTab) ? rawTab : DEFAULT_VALUES.defaultTab,
      });
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: string, value: string): Promise<boolean> => {
      try {
        await fetchJson<SettingSingleResponse>("/api/register/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
        setDefaults((prev) => ({ ...prev, [key]: value }));
        toast.success("設定を保存しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  return { defaults, isLoading, updateSetting };
}
