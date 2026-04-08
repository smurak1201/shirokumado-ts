"use client";

import { X, Calendar } from "lucide-react";

interface PeriodPreset {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
}

interface PeriodPresetsProps {
  presets: PeriodPreset[];
  isLoading: boolean;
  onApply: (dateFrom: string, dateTo: string) => void;
  onDelete: (id: number) => void;
}

export default function PeriodPresets({
  presets,
  isLoading,
  onApply,
  onDelete,
}: PeriodPresetsProps) {
  const handleApply = (dateFrom: string, dateTo: string) => {
    // APIから返る日付はISO形式のため、YYYY-MM-DD部分を抽出
    onApply(dateFrom.slice(0, 10), dateTo.slice(0, 10));
  };

  if (isLoading || presets.length === 0) return null;

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
              onDelete(preset.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onDelete(preset.id);
              }
            }}
            aria-label={`${preset.name}を削除`}
          >
            <X className="h-3 w-3 text-solid-gray-420" />
          </span>
        </button>
      ))}
    </div>
  );
}
