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
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type="datetime-local"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={ariaLabel}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
