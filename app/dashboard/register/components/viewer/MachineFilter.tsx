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
    <div className="ml-auto flex flex-wrap items-center gap-3">
      {/* 合算/レジ別 切り替え */}
      <div className="flex gap-2" role="group" aria-label="表示モード">
        <button
          type="button"
          onClick={() => onGroupByChange("combined")}
          aria-pressed={groupBy === "combined"}
          className={`rounded-6 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue ${
            groupBy === "combined"
              ? "bg-solid-gray-900 text-white"
              : "bg-solid-gray-50 text-solid-gray-700 hover:bg-solid-gray-100"
          }`}
        >
          合算
        </button>
        <button
          type="button"
          onClick={() => onGroupByChange("machine")}
          aria-pressed={groupBy === "machine"}
          className={`rounded-6 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue ${
            groupBy === "machine"
              ? "bg-solid-gray-900 text-white"
              : "bg-solid-gray-50 text-solid-gray-700 hover:bg-solid-gray-100"
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
          aria-label="レジ選択"
          className="rounded-6 border border-solid-gray-420 px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
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
