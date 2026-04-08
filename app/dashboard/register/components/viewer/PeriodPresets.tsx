// app/dashboard/register/components/viewer/PeriodPresets.tsx（新規作成）
"use client";

import { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
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
import { usePeriodPresets } from "./hooks/usePeriodPresets";

interface PeriodPresetsProps {
  currentDateFrom: string;
  currentDateTo: string;
  onApply: (dateFrom: string, dateTo: string) => void;
}

export default function PeriodPresets({
  currentDateFrom,
  currentDateTo,
  onApply,
}: PeriodPresetsProps) {
  const { presets, isLoading, createPreset, deletePreset } =
    usePeriodPresets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSave = async () => {
    if (!newName.trim()) return;
    const success = await createPreset(newName, currentDateFrom, currentDateTo);
    if (success) {
      setNewName("");
      setIsDialogOpen(false);
    }
  };

  const handleApply = (dateFrom: string, dateTo: string) => {
    // APIから返る日付はISO形式のため、YYYY-MM-DD部分を抽出
    onApply(dateFrom.slice(0, 10), dateTo.slice(0, 10));
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-solid-gray-200 bg-white px-3 py-1 text-sm hover:bg-solid-gray-50"
          onClick={() => handleApply(preset.dateFrom, preset.dateTo)}
        >
          <Calendar className="h-3 w-3 text-solid-gray-420" />
          <span>{preset.name}</span>
          <span
            role="button"
            tabIndex={0}
            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              deletePreset(preset.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                deletePreset(preset.id);
              }
            }}
            aria-label={`${preset.name}を削除`}
          >
            <X className="h-3 w-3 text-solid-gray-420" />
          </span>
        </button>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3 w-3" />
            保存
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>期間プリセットを保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">プリセット名</Label>
              <Input
                id="preset-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例: 夏祭りイベント"
              />
            </div>
            <div className="text-sm text-solid-gray-536">
              保存する期間: {currentDateFrom} ~ {currentDateTo}
            </div>
            <Button onClick={handleSave} className="w-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
