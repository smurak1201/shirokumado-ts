"use client";

import type { MachineInfo } from "../../types";

interface MachineFilterProps {
  machines: MachineInfo[];
  machineNo: string | null;
  onMachineNoChange: (no: string | null) => void;
}

export default function MachineFilter({
  machines,
  machineNo,
  onMachineNoChange,
}: MachineFilterProps) {
  if (machines.length === 0) return null;

  return (
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
  );
}
