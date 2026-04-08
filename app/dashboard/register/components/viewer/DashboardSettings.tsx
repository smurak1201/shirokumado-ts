// app/dashboard/register/components/viewer/DashboardSettings.tsx（新規作成）
"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useDashboardSettings } from "./hooks/useDashboardSettings";
import { PERIOD_LABELS, ANALYSIS_TABS } from "@/app/dashboard/register/types";
import type { PeriodType } from "@/app/dashboard/register/types";

// カスタム期間はデフォルトとして選択不可（期間指定が必要なため）
const SELECTABLE_PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year"];

export default function DashboardSettings() {
  const { defaults, isLoading, updateSetting } = useDashboardSettings();

  const handlePeriodTypeChange = (value: string) => {
    updateSetting("defaultPeriodType", value);
  };

  const handleTabChange = (value: string) => {
    updateSetting("defaultTab", value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings2 className="h-3 w-3" />
          表示設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>ダッシュボード初期表示設定</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-solid-gray-536">
            読み込み中...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>デフォルト期間タイプ</Label>
              <Select
                value={defaults.defaultPeriodType}
                onValueChange={handlePeriodTypeChange}
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
                onValueChange={handleTabChange}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
