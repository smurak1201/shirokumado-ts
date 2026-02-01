/**
 * 日付入力フィールドコンポーネント
 *
 * 日付と時刻を分離した入力フィールドを提供。
 * 日付のみ入力した場合、デフォルト時刻を自動設定。
 */

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

interface ProductDateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  ariaLabel: string;
  defaultTime?: string;
}

export default function ProductDateInput({
  id,
  label,
  value,
  onChange,
  onClear,
  ariaLabel,
  defaultTime = "00:00",
}: ProductDateInputProps) {
  const [datePart, timePart] = value ? value.split("T") : ["", ""];

  const handleDateChange = (newDate: string) => {
    if (newDate) {
      const time = timePart || defaultTime;
      onChange(`${newDate}T${time}`);
    } else {
      onClear();
    }
  };

  const handleTimeChange = (newTime: string) => {
    if (datePart && newTime) {
      onChange(`${datePart}T${newTime}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex gap-2">
        <Input
          type="date"
          id={id}
          value={datePart}
          onChange={(e) => handleDateChange(e.target.value)}
          className="flex-1"
        />

        <Input
          type="time"
          id={`${id}-time`}
          value={timePart}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={!datePart}
          className="w-24"
        />

        {value && (
          <Button
            type="button"
            onClick={onClear}
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label={ariaLabel}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
