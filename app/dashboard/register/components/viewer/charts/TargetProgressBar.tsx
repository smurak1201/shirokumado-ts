"use client";

interface TargetProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  label: string;
}

export default function TargetProgressBar({
  currentAmount,
  targetAmount,
  label,
}: TargetProgressBarProps) {
  if (targetAmount <= 0) return null;

  const percentage = Math.round((currentAmount / targetAmount) * 100);
  const isAchieved = currentAmount >= targetAmount;
  const isExceeded = percentage > 100;

  // 超過時: バー全体を実績%とし、目標部分と超過部分を色分け
  // 未達時: バー全体を100%とし、実績部分のみ表示
  const targetBarWidth = isExceeded
    ? Math.round((100 / percentage) * 100)
    : percentage;
  const exceededBarWidth = isExceeded ? 100 - targetBarWidth : 0;

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("ja-JP");
  };

  return (
    <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-solid-gray-700">{label}</span>
        <span
          className={`text-sm font-semibold ${isAchieved ? "text-green-600" : "text-solid-gray-600"}`}
        >
          {percentage}%
        </span>
      </div>
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-solid-gray-100">
        {isExceeded ? (
          <div className="flex h-full">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${targetBarWidth}%` }}
            />
            <div
              className="h-full rounded-r-full bg-blue-500 transition-all duration-500"
              style={{ width: `${exceededBarWidth}%` }}
            />
          </div>
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAchieved ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {isExceeded && (
        <div className="mb-1 flex items-center gap-3 text-xs text-solid-gray-536">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            目標まで
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            超過分
          </span>
        </div>
      )}
      <div className="flex justify-between text-xs text-solid-gray-536">
        <span>実績: {formatAmount(currentAmount)}円</span>
        <span>目標: {formatAmount(targetAmount)}円</span>
      </div>
    </div>
  );
}
