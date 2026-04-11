"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { useMachineNames } from "../hooks/useMachineNames";
import type { MachineInfo } from "../../../types";

interface MachineNamesTabProps {
  machines: MachineInfo[];
  onMachineNamesChange: () => Promise<void>;
}

export default function MachineNamesTab({
  machines,
  onMachineNamesChange,
}: MachineNamesTabProps) {
  const {
    machineNames,
    isLoading,
    createMachineName,
    updateMachineName,
    deleteMachineName,
  } = useMachineNames();

  const [newMachineNo, setNewMachineNo] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // 名称未登録のレジ番号のみを選択肢として表示
  const registeredNos = new Set(machineNames.map((mn) => mn.machineNo));
  const unregisteredMachines = machines.filter(
    (m) => !registeredNos.has(m.machineNo)
  );

  const handleCreate = async () => {
    if (!newMachineNo || !newName.trim()) return;
    const success = await createMachineName(newMachineNo, newName);
    if (success) {
      setNewMachineNo("");
      setNewName("");
      await onMachineNamesChange();
    }
  };

  // 空欄で保存するとCSV取り込み時のデフォルト名に戻る
  const handleUpdate = async (id: number) => {
    const success = await updateMachineName(id, editingName);
    if (success) {
      setEditingId(null);
      setEditingName("");
      await onMachineNamesChange();
    }
  };

  const startEditing = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <>
      {unregisteredMachines.length > 0 ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="machine-no">レジ番号</Label>
            <select
              id="machine-no"
              value={newMachineNo}
              onChange={(e) => setNewMachineNo(e.target.value)}
              className="w-full rounded-6 border border-solid-gray-420 px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {unregisteredMachines.map((m) => (
                <option key={m.machineNo} value={m.machineNo}>
                  レジ {m.machineNo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="machine-name">表示名</Label>
            <Input
              id="machine-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: 入口レジ"
            />
          </div>
          <Button onClick={handleCreate} size="sm">
            追加
          </Button>
        </div>
      ) : (
        <div className="text-sm text-solid-gray-536">
          全てのレジ番号に名称が登録済みです
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-sm text-solid-gray-536">
          読み込み中...
        </div>
      ) : machineNames.length === 0 ? (
        <div className="py-4 text-center text-sm text-solid-gray-536">
          レジ名称が登録されていません
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>レジ番号</TableHead>
              <TableHead>表示名</TableHead>
              <TableHead className="w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machineNames.map((mn) => (
              <TableRow key={mn.id}>
                <TableCell>{mn.machineNo}</TableCell>
                <TableCell>
                  {editingId === mn.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="空欄で初期名に戻す"
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(mn.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdate(mn.id)}
                      >
                        保存
                      </Button>
                    </div>
                  ) : (
                    mn.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEditing(mn.id, mn.name)}
                      aria-label={`${mn.name}を編集`}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={async () => {
                        const ok = await deleteMachineName(mn.id);
                        if (ok) await onMachineNamesChange();
                      }}
                      aria-label={`${mn.name}を削除`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
