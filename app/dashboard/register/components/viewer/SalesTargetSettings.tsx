// app/dashboard/register/components/viewer/SalesTargetSettings.tsx（新規作成）
"use client";

import { useState } from "react";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useSalesTarget } from "./hooks/useSalesTarget";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function SalesTargetSettings() {
  const currentYear = new Date().getFullYear();
  const {
    year,
    isLoading,
    changeYear,
    createTarget,
    updateTarget,
    deleteTarget,
    getTargetForMonth,
  } = useSalesTarget(currentYear);

  // 各月の入力値を管理（未保存の入力用）
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  const handleSave = async (month: number) => {
    const inputValue = editValues[month];
    if (inputValue === undefined || inputValue === "") return;

    const amount = Number(inputValue);
    if (isNaN(amount) || amount < 0) return;

    const existing = getTargetForMonth(month);
    if (existing) {
      await updateTarget(existing.id, amount);
    } else {
      await createTarget(month, amount);
    }
    // 保存後に入力値をクリア
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[month];
      return next;
    });
  };

  const handleDelete = async (month: number) => {
    const existing = getTargetForMonth(month);
    if (existing) {
      await deleteTarget(existing.id);
    }
  };

  const getDisplayValue = (month: number): string => {
    if (editValues[month] !== undefined) return editValues[month];
    const target = getTargetForMonth(month);
    return target ? String(target.amount) : "";
  };

  const handleChange = (month: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [month]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Target className="h-3 w-3" />
          売上目標
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>月別売上目標設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 年セレクタ */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeYear(year - 1)}
              aria-label="前年"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{year}年</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeYear(year + 1)}
              aria-label="翌年"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 12ヶ月分の入力 */}
          {isLoading ? (
            <div className="py-4 text-center text-sm text-solid-gray-536">
              読み込み中...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {MONTHS.map((month) => {
                const existing = getTargetForMonth(month);
                return (
                  <div key={month} className="flex items-center gap-2">
                    <Label className="w-10 shrink-0 text-right text-sm">
                      {month}月
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={getDisplayValue(month)}
                      onChange={(e) => handleChange(month, e.target.value)}
                      onBlur={() => handleSave(month)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(month);
                      }}
                      placeholder="目標額"
                      className="h-8 text-sm"
                    />
                    {existing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(month)}
                        aria-label={`${month}月の目標を削除`}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
