"use client";

import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import { ANALYSIS_TABS, PERIOD_LABELS } from "../../../types";
import type { PeriodType } from "../../../types";

// カスタム期間はデフォルトとして選択不可（期間指定が必要なため）
const SELECTABLE_PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year"];

export default function DisplaySettingsTab() {
  const { defaults, isLoading, updateSetting } = useDashboardSettings();

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-solid-gray-536">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>デフォルト期間タイプ</Label>
        <Select
          value={defaults.defaultPeriodType}
          onValueChange={(v) => updateSetting("defaultPeriodType", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SELECTABLE_PERIOD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {PERIOD_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-solid-gray-536">
          ダッシュボードを開いた際の初期期間タイプ
        </p>
      </div>

      <div className="space-y-2">
        <Label>デフォルト表示タブ</Label>
        <Select
          value={defaults.defaultTab}
          onValueChange={(v) => updateSetting("defaultTab", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANALYSIS_TABS.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-solid-gray-536">
          ダッシュボードを開いた際の初期表示タブ
        </p>
      </div>
    </div>
  );
}
