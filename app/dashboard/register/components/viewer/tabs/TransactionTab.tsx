"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { TransactionAnalysisResponse, TransactionEntry, Granularity } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const TransactionChart = dynamic(() => import("../charts/TransactionChart"), {
  ssr: false,
  loading: () => <div className="h-62.5 animate-pulse rounded-8 bg-solid-gray-50" />,
});

interface TransactionTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
  granularity: Granularity;
}

const transactionColumns: ColumnDef<TransactionEntry>[] = [
  { key: "itemName", label: "項目名" },
  {
    key: "totalQuantity",
    label: "件数",
    align: "right",
    format: (v) => (v as number).toLocaleString("ja-JP"),
  },
  {
    key: "totalAmount",
    label: "金額",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
  },
];

export default function TransactionTab({
  dateFrom,
  dateTo,
  machineNo,
  granularity,
}: TransactionTabProps) {
  const [data, setData] = useState<TransactionAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z002",
        dateFrom,
        dateTo,
        granularity,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<TransactionAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <div className="text-sm text-solid-gray-536">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-536">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIカード: 訂正合計 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
          <div className="mb-2 text-xs text-solid-gray-536">訂正合計件数</div>
          <div className="text-xl font-bold text-solid-gray-900">
            {data.correctionCount.toLocaleString("ja-JP")}件
          </div>
        </div>
        <div className="rounded-8 border border-solid-gray-200 bg-white p-4">
          <div className="mb-2 text-xs text-solid-gray-536">訂正合計金額</div>
          <div className="text-xl font-bold text-solid-gray-900">
            {data.correctionAmount.toLocaleString("ja-JP")}円
          </div>
        </div>
      </div>

      {/* 訂正推移グラフ */}
      <TransactionChart timeSeries={data.timeSeries} />

      {/* 取引キー全件テーブル（「訂正」を含む行をハイライト） */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">取引キー集計</h3>
        <DataTable
          columns={transactionColumns}
          data={data.transactions}
          highlightRow={(row) => row.itemName.includes("訂正")}
        />
      </div>
    </div>
  );
}
