"use client";

interface ImportProgressProps {
  current: number;
  total: number;
  errors: string[];
}

export default function ImportProgress({
  current,
  total,
  errors,
}: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          取り込み中... {current} / {total} ファイル
        </span>
        <span>{percentage}%</span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="取り込み進捗"
      >
        <div
          className="h-full rounded-full bg-gray-900 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-1 text-sm font-medium text-red-800">
            エラー ({errors.length}件)
          </p>
          <ul className="space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-xs text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
