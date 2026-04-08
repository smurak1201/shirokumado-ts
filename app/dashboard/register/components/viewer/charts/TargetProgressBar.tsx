// app/dashboard/register/components/viewer/charts/TargetProgressBar.tsx（新規作成）
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

  const percentage = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100
  );
  const isAchieved = currentAmount >= targetAmount;

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
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAchieved ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-solid-gray-536">
        <span>実績: {formatAmount(currentAmount)}円</span>
        <span>目標: {formatAmount(targetAmount)}円</span>
      </div>
    </div>
  );
}
