"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { ProductAnalysisResponse, ProductEntry } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

const ProductParetoChart = dynamic(() => import("../charts/ProductParetoChart"), {
  ssr: false,
  loading: () => <div className="h-87.5 animate-pulse rounded-8 bg-solid-gray-50" />,
});

interface ProductAnalysisTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

const productColumns: ColumnDef<ProductEntry>[] = [
  { key: "rank", label: "ランク" },
  { key: "itemName", label: "商品名" },
  {
    key: "totalQuantity",
    label: "数量",
    align: "right",
    format: (v) => (v as number).toLocaleString("ja-JP"),
  },
  {
    key: "totalAmount",
    label: "金額",
    align: "right",
    format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
  },
  {
    key: "cumulativeRatio",
    label: "累積構成比",
    align: "right",
    format: (v) => `${(v as number).toFixed(1)}%`,
  },
];

export default function ProductAnalysisTab({
  dateFrom,
  dateTo,
  machineNo,
}: ProductAnalysisTabProps) {
  const [data, setData] = useState<ProductAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "Z004_PRODUCT",
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<ProductAnalysisResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, machineNo]);

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
      <ProductParetoChart products={data.products} />

      <div>
        <h3 className="mb-2 text-sm font-medium text-solid-gray-700">商品一覧（ABC分析）</h3>
        <DataTable columns={productColumns} data={data.products} />
      </div>
    </div>
  );
}
