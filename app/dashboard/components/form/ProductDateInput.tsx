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
}

/**
 * 日付入力フィールドコンポーネント
 *
 * 公開日・終了日の入力に使用する日時入力フィールドを提供します。
 * 値が設定されている場合はクリアボタンが表示されます。
 */
export default function ProductDateInput({
  id,
  label,
  value,
  onChange,
  onClear,
  ariaLabel,
}: ProductDateInputProps) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative min-w-0">
        <Input
          type="datetime-local"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 pr-10"
        />
        {value && (
          <Button
            type="button"
            onClick={onClear}
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            aria-label={ariaLabel}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
