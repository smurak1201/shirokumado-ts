"use client";

import type { GroupBy, MachineInfo } from "../../types";

interface MachineFilterProps {
  machines: MachineInfo[];
  machineNo: string | null;
  groupBy: GroupBy;
  onMachineNoChange: (no: string | null) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
}

export default function MachineFilter({
  machines,
  machineNo,
  groupBy,
  onMachineNoChange,
  onGroupByChange,
}: MachineFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 合算/レジ別 切り替え */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onGroupByChange("combined")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
            groupBy === "combined"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          合算
        </button>
        <button
          type="button"
          onClick={() => onGroupByChange("machine")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
            groupBy === "machine"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          レジ別
        </button>
      </div>

      {/* レジ番号選択（合算モード時のみ表示） */}
      {groupBy === "combined" && machines.length > 0 && (
        <select
          value={machineNo ?? ""}
          onChange={(e) => onMachineNoChange(e.target.value || null)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">全レジ</option>
          {machines.map((m) => (
            <option key={m.machineNo} value={m.machineNo}>
              {m.name ? `${m.machineNo} - ${m.name}` : `レジ ${m.machineNo}`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
