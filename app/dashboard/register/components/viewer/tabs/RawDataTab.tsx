"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { RawDataResponse, RawDataEntry, RegisterDataType } from "../../../types";
import DataTable from "../DataTable";
import type { ColumnDef } from "../DataTable";

interface RawDataTabProps {
  dateFrom: string;
  dateTo: string;
  machineNo: string | null;
}

const DATA_TYPE_OPTIONS: { value: RegisterDataType; label: string }[] = [
  { value: "Z001", label: "Z001 - 売上明細" },
  { value: "Z002", label: "Z002 - 取引キー" },
  { value: "Z004", label: "Z004 - 商品売上" },
  { value: "Z005", label: "Z005 - 部門売上" },
  { value: "Z009", label: "Z009 - 時間帯別売上" },
];

const baseColumns: ColumnDef<RawDataEntry>[] = [
  { key: "date", label: "日付" },
  { key: "time", label: "時刻" },
  { key: "machineNo", label: "レジ番号" },
  { key: "recordNo", label: "No", align: "right" },
];

/** 種別に応じたカラム定義を返す */
function getColumnsForType(type: RegisterDataType): ColumnDef<RawDataEntry>[] {
  switch (type) {
    case "Z004":
      return [
        ...baseColumns,
        { key: "itemCode", label: "商品コード" },
        { key: "itemName", label: "商品名" },
        {
          key: "quantity",
          label: "数量",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
    case "Z009":
      return [
        ...baseColumns,
        { key: "startTime", label: "開始時刻" },
        { key: "endTime", label: "終了時刻" },
        {
          key: "quantity",
          label: "客数",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
    default:
      return [
        ...baseColumns,
        { key: "itemName", label: "項目名" },
        {
          key: "quantity",
          label: "数量",
          align: "right",
          format: (v) => (v as number).toLocaleString("ja-JP"),
        },
        {
          key: "amount",
          label: "金額",
          align: "right",
          format: (v) => `${(v as number).toLocaleString("ja-JP")}円`,
        },
      ];
  }
}

export default function RawDataTab({
  dateFrom,
  dateTo,
  machineNo,
}: RawDataTabProps) {
  const [selectedType, setSelectedType] = useState<RegisterDataType>("Z001");
  const [data, setData] = useState<RawDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: `RAW_${selectedType}`,
        dateFrom,
        dateTo,
      });
      if (machineNo) params.set("machineNo", machineNo);

      const result = await fetchJson<RawDataResponse>(
        `/api/register/data?${params}`
      );
      setData(result);
    } catch (err) {
      toast.error(getUserFriendlyMessageJa(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, dateFrom, dateTo, machineNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = getColumnsForType(selectedType);

  return (
    <div className="space-y-4">
      {/* 種別セレクトボックス */}
      <div className="flex items-center gap-3">
        <label htmlFor="raw-data-type" className="text-sm font-medium text-solid-gray-700">データ種別:</label>
        <select
          id="raw-data-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as RegisterDataType)}
          className="rounded-6 border border-solid-gray-420 px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
        >
          {DATA_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
          <div className="text-sm text-solid-gray-536">読み込み中...</div>
        </div>
      )}

      {/* データテーブル */}
      {!isLoading && data && (
        <div>
          <div className="mb-2 text-xs text-solid-gray-536">{data.rows.length}件</div>
          <DataTable columns={columns} data={data.rows} />
        </div>
      )}
    </div>
  );
}
