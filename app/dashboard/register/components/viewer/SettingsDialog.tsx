// 設定Dialog: レジ名称管理と表示設定をタブで切り替え
"use client";

import { useState } from "react";
import { Settings, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useMachineNames } from "./hooks/useMachineNames";
import { useDashboardSettings } from "./hooks/useDashboardSettings";
import { PERIOD_LABELS, ANALYSIS_TABS } from "../../types";
import type { MachineInfo, PeriodType } from "../../types";

// カスタム期間はデフォルトとして選択不可（期間指定が必要なため）
const SELECTABLE_PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year"];

interface SettingsDialogProps {
  machines: MachineInfo[];
  onMachineNamesChange: () => Promise<void>;
}

export default function SettingsDialog({ machines, onMachineNamesChange }: SettingsDialogProps) {
  const {
    machineNames,
    isLoading: isMachineNamesLoading,
    createMachineName,
    updateMachineName,
    deleteMachineName,
  } = useMachineNames();

  const {
    defaults,
    isLoading: isSettingsLoading,
    updateSetting,
  } = useDashboardSettings();

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="設定">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="machine-names">
          <TabsList className="w-full">
            <TabsTrigger value="machine-names" className="flex-1">
              レジ名称
            </TabsTrigger>
            <TabsTrigger value="display" className="flex-1">
              表示設定
            </TabsTrigger>
          </TabsList>

          {/* レジ名称タブ */}
          <TabsContent value="machine-names" className="space-y-4">
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

            {isMachineNamesLoading ? (
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
                            onClick={async () => { const ok = await deleteMachineName(mn.id); if (ok) await onMachineNamesChange(); }}
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
          </TabsContent>

          {/* 表示設定タブ */}
          <TabsContent value="display">
            {isSettingsLoading ? (
              <div className="py-4 text-center text-sm text-solid-gray-536">
                読み込み中...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>デフォルト期間タイプ</Label>
                  <Select
                    value={defaults.defaultPeriodType}
                    onValueChange={(v) => updateSetting("defaultPeriodType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SELECTABLE_PERIOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PERIOD_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-solid-gray-536">
                    ダッシュボードを開いた際の初期期間タイプ
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>デフォルト表示タブ</Label>
                  <Select
                    value={defaults.defaultTab}
                    onValueChange={(v) => updateSetting("defaultTab", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYSIS_TABS.map((tab) => (
                        <SelectItem key={tab.value} value={tab.value}>
                          {tab.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-solid-gray-536">
                    ダッシュボードを開いた際の初期表示タブ
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
