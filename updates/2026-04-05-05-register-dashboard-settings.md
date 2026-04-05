# 売上分析ダッシュボード: 設定・管理機能（Phase 5）

**日付**: 2026-04-05
**ブランチ**: feature/register-dashboard
**対象**: 期間プリセット、レジ名称管理、売上目標設定、ダッシュボード初期表示設定
**ステータス**: 未着手
**完了日**: -

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: 期間プリセットAPI + フック + UI](#タスク1-期間プリセットapi--フック--ui)
  - [タスク2: レジ名称管理API + フック + UI](#タスク2-レジ名称管理api--フック--ui)
  - [タスク3: 売上目標API + フック + UI + プログレスバー](#タスク3-売上目標api--フック--ui--プログレスバー)
  - [タスク4: ダッシュボード設定API + フック + UI](#タスク4-ダッシュボード設定api--フック--ui)
  - [タスク5: RegisterDataViewer + SalesOverviewTab変更（統合）](#タスク5-registerdataviewer--salesoverviewtab変更統合)
  - [タスク6: 動作確認・ビルドテスト](#タスク6-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

## 進捗状況

| #   | タスク                                         | 対応課題 | 優先度 | ステータス | 備考                  |
| --- | ---------------------------------------------- | :------: | :----: | :--------: | --------------------- |
| 1   | 期間プリセットAPI + フック + UI                |   1      |   高   |    [ ]     |                       |
| 2   | レジ名称管理API + フック + UI                  |   2      |   高   |    [ ]     | タスク1と並列実行可能 |
| 3   | 売上目標API + フック + UI + プログレスバー     |   3      |   高   |    [ ]     |                       |
| 4   | ダッシュボード設定API + フック + UI            |   4      |   中   |    [ ]     |                       |
| 5   | RegisterDataViewer + SalesOverviewTab変更      |  1,3,4   |   高   |    [ ]     |                       |
| 6   | 動作確認・ビルドテスト                         |    -     |   -    |    [ ]     |                       |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

## 改修の目的

### 背景

売上分析ダッシュボードの分析タブ（売上概要、売上推移、時間帯分析など）は仕様書02~04で構築済み。本仕様書では、ダッシュボードの管理・設定機能を実装する。

### 課題

- **課題1**: よく使う期間（イベント期間など）を毎回手入力する必要がある
- **課題2**: レジ番号だけでは、どのレジがどこに設置されているか判別しにくい
- **課題3**: 売上目標に対する達成率を確認する手段がない
- **課題4**: ダッシュボードを開くたびに期間やタブを手動で切り替える必要がある

### 設計方針

- **方針1**: 各設定機能はDialog内で完結させ、分析画面のレイアウトを崩さない
- **方針2**: APIは既存の `withErrorHandling` + `apiSuccess` パターンに統一する
- **方針3**: DBテーブルは仕様書02のタスク1で定義済みの `RegisterPeriodPreset`、`RegisterMachineName`、`RegisterSalesTarget`、`RegisterDashboardSetting` を使用する
- **方針4**: フロント側のフックは `useRegisterData.ts`（仕様書02のタスク6）のパターンに合わせる

## タスク詳細

### タスク1: 期間プリセットAPI + フック + UI

**対象ファイル**:

- `app/api/register/presets/route.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/hooks/usePeriodPresets.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/PeriodPresets.tsx`（**新規作成**）

**問題点**:

よく使う分析期間（例: 「夏祭りイベント」2024/8/1-8/3）を毎回手入力する必要があり、繰り返し分析する際に手間がかかる。

**修正内容**:

1. `GET /api/register/presets` で全プリセット一覧を取得するAPIを作成する
2. `POST /api/register/presets` で新規プリセットを保存するAPIを作成する
3. `DELETE /api/register/presets?id=N` でプリセットを削除するAPIを作成する
4. `usePeriodPresets` フックでプリセットのCRUD操作を管理する
5. `PeriodPresets` コンポーネントで、バッジ形式のプリセット一覧と保存Dialogを表示する

<details>
<summary>app/api/register/presets/route.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/api/register/presets/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const presets = await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.findMany({
        orderBy: { createdAt: "desc" },
      }),
    "GET /api/register/presets"
  );

  return apiSuccess({ presets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { name, dateFrom, dateTo } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("プリセット名を入力してください");
  }
  if (!dateFrom || !dateTo) {
    throw new ValidationError("開始日と終了日を指定してください");
  }
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw new ValidationError("開始日は終了日より前に設定してください");
  }

  const preset = await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.create({
        data: {
          name: name.trim(),
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
        },
      }),
    "POST /api/register/presets"
  );

  return apiSuccess({ preset }, 201);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なプリセットIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/presets"
  );

  return apiSuccess({ success: true });
});
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/hooks/usePeriodPresets.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/dashboard/register/components/viewer/hooks/usePeriodPresets.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";

interface PeriodPreset {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
}

interface PresetsResponse {
  presets: PeriodPreset[];
}

interface PresetCreateResponse {
  preset: PeriodPreset;
}

export function usePeriodPresets() {
  const [presets, setPresets] = useState<PeriodPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJson<PresetsResponse>("/api/register/presets");
      setPresets(data.presets);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const createPreset = useCallback(
    async (name: string, dateFrom: string, dateTo: string): Promise<boolean> => {
      try {
        const data = await fetchJson<PresetCreateResponse>(
          "/api/register/presets",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, dateFrom, dateTo }),
          }
        );
        setPresets((prev) => [data.preset, ...prev]);
        toast.success("プリセットを保存しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const deletePreset = useCallback(async (id: number): Promise<boolean> => {
    try {
      await fetchJson(`/api/register/presets?id=${id}`, {
        method: "DELETE",
      });
      setPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success("プリセットを削除しました");
      return true;
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      return false;
    }
  }, []);

  return { presets, isLoading, createPreset, deletePreset };
}
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/PeriodPresets.tsx（新規作成）（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/PeriodPresets.tsx（新規作成）
"use client";

import { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
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
import { usePeriodPresets } from "./hooks/usePeriodPresets";

interface PeriodPresetsProps {
  currentDateFrom: string;
  currentDateTo: string;
  onApply: (dateFrom: string, dateTo: string) => void;
}

export default function PeriodPresets({
  currentDateFrom,
  currentDateTo,
  onApply,
}: PeriodPresetsProps) {
  const { presets, isLoading, createPreset, deletePreset } =
    usePeriodPresets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSave = async () => {
    if (!newName.trim()) return;
    const success = await createPreset(newName, currentDateFrom, currentDateTo);
    if (success) {
      setNewName("");
      setIsDialogOpen(false);
    }
  };

  const handleApply = (dateFrom: string, dateTo: string) => {
    // APIから返る日付はISO形式のため、YYYY-MM-DD部分を抽出
    onApply(dateFrom.slice(0, 10), dateTo.slice(0, 10));
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50"
          onClick={() => handleApply(preset.dateFrom, preset.dateTo)}
        >
          <Calendar className="h-3 w-3 text-gray-400" />
          <span>{preset.name}</span>
          <span
            role="button"
            tabIndex={0}
            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              deletePreset(preset.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                deletePreset(preset.id);
              }
            }}
            aria-label={`${preset.name}を削除`}
          >
            <X className="h-3 w-3 text-gray-400" />
          </span>
        </button>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3 w-3" />
            保存
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>期間プリセットを保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">プリセット名</Label>
              <Input
                id="preset-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例: 夏祭りイベント"
              />
            </div>
            <div className="text-sm text-gray-500">
              保存する期間: {currentDateFrom} ~ {currentDateTo}
            </div>
            <Button onClick={handleSave} className="w-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

</details>

---

### タスク2: レジ名称管理API + フック + UI

**対象ファイル**:

- `app/api/register/machines/names/route.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/hooks/useMachineNames.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/MachineNameSettings.tsx`（**新規作成**）

**問題点**:

レジ番号（例: 14）だけでは、どのレジがどこに設置されているか判別しにくい。表示名（例: "入口レジ"）を登録する手段がない。

**修正内容**:

1. `GET /api/register/machines/names` で全レジ名称一覧を取得するAPIを作成する
2. `POST /api/register/machines/names` で新規登録するAPIを作成する
3. `PUT /api/register/machines/names` で名称変更するAPIを作成する
4. `DELETE /api/register/machines/names?id=N` で削除するAPIを作成する
5. `useMachineNames` フックでCRUD操作を管理する
6. `MachineNameSettings` コンポーネントで歯車アイコンからDialog表示し、テーブルで一覧管理する。レジ番号はDBに取り込み済みのレジ番号一覧（`machines` props）からセレクトボックスで選択する方式とする（手入力ではない）

<details>
<summary>app/api/register/machines/names/route.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/api/register/machines/names/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const names = await safePrismaOperation(
    () =>
      prisma.registerMachineName.findMany({
        orderBy: { machineNo: "asc" },
      }),
    "GET /api/register/machines/names"
  );

  return apiSuccess({ names });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { machineNo, name } = body;

  if (!machineNo || typeof machineNo !== "string" || machineNo.trim().length === 0) {
    throw new ValidationError("レジ番号を入力してください");
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("表示名を入力してください");
  }

  const created = await safePrismaOperation(
    () =>
      prisma.registerMachineName.create({
        data: {
          machineNo: machineNo.trim(),
          name: name.trim(),
        },
      }),
    "POST /api/register/machines/names"
  );

  return apiSuccess({ name: created }, 201);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { id, name } = body;

  if (!id || typeof id !== "number") {
    throw new ValidationError("有効なIDを指定してください");
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("表示名を入力してください");
  }

  const updated = await safePrismaOperation(
    () =>
      prisma.registerMachineName.update({
        where: { id },
        data: { name: name.trim() },
      }),
    "PUT /api/register/machines/names"
  );

  return apiSuccess({ name: updated });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerMachineName.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/machines/names"
  );

  return apiSuccess({ success: true });
});
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/hooks/useMachineNames.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/dashboard/register/components/viewer/hooks/useMachineNames.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";

interface MachineName {
  id: number;
  machineNo: string;
  name: string;
  createdAt: string;
}

interface MachineNamesResponse {
  names: MachineName[];
}

interface MachineNameSingleResponse {
  name: MachineName;
}

export function useMachineNames() {
  const [machineNames, setMachineNames] = useState<MachineName[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachineNames = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJson<MachineNamesResponse>(
        "/api/register/machines/names"
      );
      setMachineNames(data.names);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachineNames();
  }, [fetchMachineNames]);

  const createMachineName = useCallback(
    async (machineNo: string, name: string): Promise<boolean> => {
      try {
        const data = await fetchJson<MachineNameSingleResponse>(
          "/api/register/machines/names",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ machineNo, name }),
          }
        );
        setMachineNames((prev) =>
          [...prev, data.name].sort((a, b) =>
            a.machineNo.localeCompare(b.machineNo)
          )
        );
        toast.success("レジ名称を登録しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const updateMachineName = useCallback(
    async (id: number, name: string): Promise<boolean> => {
      try {
        const data = await fetchJson<MachineNameSingleResponse>(
          "/api/register/machines/names",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, name }),
          }
        );
        setMachineNames((prev) =>
          prev.map((mn) => (mn.id === id ? data.name : mn))
        );
        toast.success("レジ名称を更新しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const deleteMachineName = useCallback(async (id: number): Promise<boolean> => {
    try {
      await fetchJson(`/api/register/machines/names?id=${id}`, {
        method: "DELETE",
      });
      setMachineNames((prev) => prev.filter((mn) => mn.id !== id));
      toast.success("レジ名称を削除しました");
      return true;
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      return false;
    }
  }, []);

  return {
    machineNames,
    isLoading,
    createMachineName,
    updateMachineName,
    deleteMachineName,
  };
}
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/MachineNameSettings.tsx（新規作成）（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/MachineNameSettings.tsx（新規作成）
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
import { useMachineNames } from "./hooks/useMachineNames";
import type { MachineInfo } from "../../../types";

interface MachineNameSettingsProps {
  /** DB内の取り込み済みレジ番号一覧（GET /api/register/machines から取得） */
  machines: MachineInfo[];
}

export default function MachineNameSettings({
  machines,
}: MachineNameSettingsProps) {
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
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    const success = await updateMachineName(id, editingName);
    if (success) {
      setEditingId(null);
      setEditingName("");
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
        <Button variant="ghost" size="icon" aria-label="レジ名称設定">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>レジ名称管理</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 新規登録フォーム */}
          {unregisteredMachines.length > 0 ? (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="machine-no">レジ番号</Label>
                <select
                  id="machine-no"
                  value={newMachineNo}
                  onChange={(e) => setNewMachineNo(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <div className="text-sm text-gray-500">
              全てのレジ番号に名称が登録済みです
            </div>
          )}

          {/* 一覧テーブル */}
          {isLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">
              読み込み中...
            </div>
          ) : machineNames.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
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
                          onClick={() => deleteMachineName(mn.id)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

</details>

---

### タスク3: 売上目標API + フック + UI + プログレスバー

**対象ファイル**:

- `app/api/register/targets/route.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/hooks/useSalesTarget.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/SalesTargetSettings.tsx`（**新規作成**）
- `app/dashboard/register/components/viewer/charts/TargetProgressBar.tsx`（**新規作成**）

**問題点**:

月別の売上目標を設定し、達成率を確認する手段がない。

**修正内容**:

1. `GET /api/register/targets?year=2024` で該当年の月別目標一覧を取得するAPIを作成する
2. `POST /api/register/targets` で新規目標を登録するAPIを作成する
3. `PUT /api/register/targets` で目標金額を変更するAPIを作成する
4. `DELETE /api/register/targets?id=N` で目標を削除するAPIを作成する
5. `useSalesTarget` フックで年別の目標管理を行う
6. `SalesTargetSettings` コンポーネントで年セレクタ付きの12ヶ月分入力フォームをDialog内に表示する
7. `TargetProgressBar` コンポーネントで売上概要タブに達成率プログレスバーを表示する

<details>
<summary>app/api/register/targets/route.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/api/register/targets/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get("year");

  if (!yearStr || isNaN(Number(yearStr))) {
    throw new ValidationError("有効な年を指定してください");
  }

  const year = Number(yearStr);

  const targets = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.findMany({
        where: { year },
        orderBy: { month: "asc" },
      }),
    "GET /api/register/targets"
  );

  return apiSuccess({ targets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { year, month, amount } = body;

  if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
    throw new ValidationError("有効な年を指定してください");
  }
  if (!month || typeof month !== "number" || month < 1 || month > 12) {
    throw new ValidationError("有効な月を指定してください（1-12）");
  }
  if (amount === undefined || typeof amount !== "number" || amount < 0) {
    throw new ValidationError("有効な目標金額を指定してください");
  }

  const target = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.create({
        data: { year, month, amount },
      }),
    "POST /api/register/targets"
  );

  return apiSuccess({ target }, 201);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { id, amount } = body;

  if (!id || typeof id !== "number") {
    throw new ValidationError("有効なIDを指定してください");
  }
  if (amount === undefined || typeof amount !== "number" || amount < 0) {
    throw new ValidationError("有効な目標金額を指定してください");
  }

  const target = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.update({
        where: { id },
        data: { amount },
      }),
    "PUT /api/register/targets"
  );

  return apiSuccess({ target });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/targets"
  );

  return apiSuccess({ success: true });
});
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/hooks/useSalesTarget.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/dashboard/register/components/viewer/hooks/useSalesTarget.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";

export interface SalesTarget {
  id: number;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
}

interface TargetsResponse {
  targets: SalesTarget[];
}

interface TargetSingleResponse {
  target: SalesTarget;
}

export function useSalesTarget(initialYear: number) {
  const [year, setYear] = useState(initialYear);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTargets = useCallback(async (targetYear: number) => {
    try {
      setIsLoading(true);
      const data = await fetchJson<TargetsResponse>(
        `/api/register/targets?year=${targetYear}`
      );
      setTargets(data.targets);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets(year);
  }, [year, fetchTargets]);

  const changeYear = useCallback((newYear: number) => {
    setYear(newYear);
  }, []);

  const createTarget = useCallback(
    async (month: number, amount: number): Promise<boolean> => {
      try {
        const data = await fetchJson<TargetSingleResponse>(
          "/api/register/targets",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, month, amount }),
          }
        );
        setTargets((prev) =>
          [...prev, data.target].sort((a, b) => a.month - b.month)
        );
        toast.success(`${year}年${month}月の目標を設定しました`);
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    [year]
  );

  const updateTarget = useCallback(
    async (id: number, amount: number): Promise<boolean> => {
      try {
        const data = await fetchJson<TargetSingleResponse>(
          "/api/register/targets",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, amount }),
          }
        );
        setTargets((prev) =>
          prev.map((t) => (t.id === id ? data.target : t))
        );
        toast.success("目標金額を更新しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  const deleteTarget = useCallback(async (id: number): Promise<boolean> => {
    try {
      await fetchJson(`/api/register/targets?id=${id}`, {
        method: "DELETE",
      });
      setTargets((prev) => prev.filter((t) => t.id !== id));
      toast.success("目標を削除しました");
      return true;
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      return false;
    }
  }, []);

  /** 指定月の目標を取得（なければnull） */
  const getTargetForMonth = useCallback(
    (month: number): SalesTarget | null => {
      return targets.find((t) => t.month === month) ?? null;
    },
    [targets]
  );

  return {
    year,
    targets,
    isLoading,
    changeYear,
    createTarget,
    updateTarget,
    deleteTarget,
    getTargetForMonth,
  };
}
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/SalesTargetSettings.tsx（新規作成）（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/SalesTargetSettings.tsx（新規作成）
"use client";

import { useState } from "react";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useSalesTarget } from "./hooks/useSalesTarget";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function SalesTargetSettings() {
  const currentYear = new Date().getFullYear();
  const {
    year,
    targets,
    isLoading,
    changeYear,
    createTarget,
    updateTarget,
    deleteTarget,
    getTargetForMonth,
  } = useSalesTarget(currentYear);

  // 各月の入力値を管理（未保存の入力用）
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  const handleSave = async (month: number) => {
    const inputValue = editValues[month];
    if (inputValue === undefined || inputValue === "") return;

    const amount = Number(inputValue);
    if (isNaN(amount) || amount < 0) return;

    const existing = getTargetForMonth(month);
    if (existing) {
      await updateTarget(existing.id, amount);
    } else {
      await createTarget(month, amount);
    }
    // 保存後に入力値をクリア
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[month];
      return next;
    });
  };

  const handleDelete = async (month: number) => {
    const existing = getTargetForMonth(month);
    if (existing) {
      await deleteTarget(existing.id);
    }
  };

  const getDisplayValue = (month: number): string => {
    if (editValues[month] !== undefined) return editValues[month];
    const target = getTargetForMonth(month);
    return target ? String(target.amount) : "";
  };

  const handleChange = (month: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [month]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Target className="h-3 w-3" />
          売上目標
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>月別売上目標設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 年セレクタ */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeYear(year - 1)}
              aria-label="前年"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{year}年</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeYear(year + 1)}
              aria-label="翌年"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 12ヶ月分の入力 */}
          {isLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">
              読み込み中...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {MONTHS.map((month) => {
                const existing = getTargetForMonth(month);
                return (
                  <div key={month} className="flex items-center gap-2">
                    <Label className="w-10 shrink-0 text-right text-sm">
                      {month}月
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={getDisplayValue(month)}
                      onChange={(e) => handleChange(month, e.target.value)}
                      onBlur={() => handleSave(month)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(month);
                      }}
                      placeholder="目標額"
                      className="h-8 text-sm"
                    />
                    {existing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(month)}
                        aria-label={`${month}月の目標を削除`}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/charts/TargetProgressBar.tsx（新規作成）（クリックで展開）</summary>

```tsx
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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span
          className={`text-sm font-semibold ${isAchieved ? "text-green-600" : "text-gray-600"}`}
        >
          {percentage}%
        </span>
      </div>
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAchieved ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>実績: {formatAmount(currentAmount)}円</span>
        <span>目標: {formatAmount(targetAmount)}円</span>
      </div>
    </div>
  );
}
```

</details>

---

### タスク4: ダッシュボード設定API + フック + UI

**対象ファイル**:

- `app/api/register/settings/route.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/hooks/useDashboardSettings.ts`（**新規作成**）
- `app/dashboard/register/components/viewer/DashboardSettings.tsx`（**新規作成**）

**問題点**:

ダッシュボードを開くたびにデフォルトの期間タイプやタブを手動で切り替える必要がある。

**修正内容**:

1. `GET /api/register/settings` で全設定をkey-value配列として取得するAPIを作成する
2. `PUT /api/register/settings` で設定を更新（upsert）するAPIを作成する
3. `useDashboardSettings` フックで設定の取得・更新を管理する
4. `DashboardSettings` コンポーネントでDialog内にデフォルト期間タイプとデフォルトタブのセレクトを表示する

設定キーは以下の2つを使用する:
- `defaultPeriodType`: デフォルト期間タイプ（`day` / `week` / `month` / `year`）
- `defaultTab`: デフォルト表示タブ（`overview` / `trend` / `hourly` / `product` / `department` / `transaction` / `raw`）

<details>
<summary>app/api/register/settings/route.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/api/register/settings/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_KEYS = ["defaultPeriodType", "defaultTab"] as const;
type SettingKey = (typeof VALID_KEYS)[number];

function isValidKey(key: string): key is SettingKey {
  return (VALID_KEYS as readonly string[]).includes(key);
}

export const GET = withErrorHandling(async () => {
  const settings = await safePrismaOperation(
    () => prisma.registerDashboardSetting.findMany(),
    "GET /api/register/settings"
  );

  return apiSuccess({ settings });
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { key, value } = body;

  if (!key || typeof key !== "string" || !isValidKey(key)) {
    throw new ValidationError(
      `有効な設定キーを指定してください（${VALID_KEYS.join(", ")}）`
    );
  }
  if (value === undefined || typeof value !== "string") {
    throw new ValidationError("設定値を文字列で指定してください");
  }

  // upsert: 存在すれば更新、なければ作成
  const setting = await safePrismaOperation(
    () =>
      prisma.registerDashboardSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    "PUT /api/register/settings"
  );

  return apiSuccess({ setting });
});
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/hooks/useDashboardSettings.ts（新規作成）（クリックで展開）</summary>

```typescript
// app/dashboard/register/components/viewer/hooks/useDashboardSettings.ts（新規作成）
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { PeriodType, AnalysisTabValue } from "@/app/dashboard/register/types";

interface DashboardSetting {
  id: number;
  key: string;
  value: string;
}

interface SettingsResponse {
  settings: DashboardSetting[];
}

interface SettingSingleResponse {
  setting: DashboardSetting;
}

export interface DashboardDefaults {
  defaultPeriodType: PeriodType;
  defaultTab: AnalysisTabValue;
}

const DEFAULT_VALUES: DashboardDefaults = {
  defaultPeriodType: "month",
  defaultTab: "overview",
};

export function useDashboardSettings() {
  const [defaults, setDefaults] = useState<DashboardDefaults>(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJson<SettingsResponse>("/api/register/settings");
      const settingsMap = new Map(
        data.settings.map((s) => [s.key, s.value])
      );
      setDefaults({
        defaultPeriodType:
          (settingsMap.get("defaultPeriodType") as PeriodType) ??
          DEFAULT_VALUES.defaultPeriodType,
        defaultTab:
          (settingsMap.get("defaultTab") as AnalysisTabValue) ??
          DEFAULT_VALUES.defaultTab,
      });
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: string, value: string): Promise<boolean> => {
      try {
        await fetchJson<SettingSingleResponse>("/api/register/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
        setDefaults((prev) => ({ ...prev, [key]: value }));
        toast.success("設定を保存しました");
        return true;
      } catch (error) {
        toast.error(getUserFriendlyMessageJa(error));
        return false;
      }
    },
    []
  );

  return { defaults, isLoading, updateSetting };
}
```

</details>

<details>
<summary>app/dashboard/register/components/viewer/DashboardSettings.tsx（新規作成）（クリックで展開）</summary>

```tsx
// app/dashboard/register/components/viewer/DashboardSettings.tsx（新規作成）
"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useDashboardSettings } from "./hooks/useDashboardSettings";
import { PERIOD_LABELS, ANALYSIS_TABS } from "@/app/dashboard/register/types";
import type { PeriodType, AnalysisTabValue } from "@/app/dashboard/register/types";

// カスタム期間はデフォルトとして選択不可（期間指定が必要なため）
const SELECTABLE_PERIOD_TYPES: PeriodType[] = ["day", "week", "month", "year"];

export default function DashboardSettings() {
  const { defaults, isLoading, updateSetting } = useDashboardSettings();

  const handlePeriodTypeChange = (value: string) => {
    updateSetting("defaultPeriodType", value);
  };

  const handleTabChange = (value: string) => {
    updateSetting("defaultTab", value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings2 className="h-3 w-3" />
          表示設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>ダッシュボード初期表示設定</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-gray-500">
            読み込み中...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>デフォルト期間タイプ</Label>
              <Select
                value={defaults.defaultPeriodType}
                onValueChange={handlePeriodTypeChange}
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
              <p className="text-xs text-gray-500">
                ダッシュボードを開いた際の初期期間タイプ
              </p>
            </div>

            <div className="space-y-2">
              <Label>デフォルト表示タブ</Label>
              <Select
                value={defaults.defaultTab}
                onValueChange={handleTabChange}
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
              <p className="text-xs text-gray-500">
                ダッシュボードを開いた際の初期表示タブ
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

</details>

---

### タスク5: RegisterDataViewer + SalesOverviewTab変更（統合）

**対象ファイル**:

- `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`（既存・変更）
- `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`（既存・変更）

**問題点**:

タスク1~4で作成した設定機能がダッシュボードに統合されていない。

**修正内容**:

1. `RegisterDataViewer.tsx` にPeriodPresets、MachineNameSettings、SalesTargetSettings、DashboardSettingsを配置する
2. `useDashboardSettings` で取得した初期値をフィルタとタブの初期状態に反映する
3. `SalesOverviewTab.tsx` にTargetProgressBarを追加する

**RegisterDataViewer.tsx の変更**:

import文に以下を追加する:

```tsx
// 変更前（既存のimport文の後に追加）

// 変更後
import PeriodPresets from "./PeriodPresets";
import MachineNameSettings from "./MachineNameSettings";
import SalesTargetSettings from "./SalesTargetSettings";
import DashboardSettings from "./DashboardSettings";
import { useDashboardSettings } from "./hooks/useDashboardSettings";
```

フィルタバー領域に設定コンポーネントとPeriodPresetsを追加する。`useRegisterData`フックの返り値（`dateFrom`, `dateTo`, `setDateFrom`, `setDateTo`）を使用する:

```tsx
// 変更前（フィルタバー内、MachineFilterの閉じタグの後）
          />
        </div>
      </div>

// 変更後（MachineFilterの後に設定ボタン群を追加、フィルタバーの外にPeriodPresetsを追加）
          />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MachineNameSettings machines={machines} />
            <SalesTargetSettings />
            <DashboardSettings />
          </div>
          <PeriodPresets
            currentDateFrom={dateFrom}
            currentDateTo={dateTo}
            onApply={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
          />
        </div>
      </div>
```

`useDashboardSettings`から取得した`defaults`を使って、フィルタの初期値を設定する。具体的には、`useEffect`で`defaults`のロード完了後に初回のみ反映する:

```tsx
// RegisterDataViewer.tsx 内に追加
const { defaults, isLoading: isSettingsLoading } = useDashboardSettings();
const [hasAppliedDefaults, setHasAppliedDefaults] = useState(false);

useEffect(() => {
  if (!isSettingsLoading && !hasAppliedDefaults) {
    setPeriodType(defaults.defaultPeriodType);
    setHasAppliedDefaults(true);
  }
}, [isSettingsLoading, hasAppliedDefaults, defaults, setPeriodType]);
```

**注意**: `useRegisterData`フックには`setFilter`は存在しない。フィルタの変更には個別のセッター（`setPeriodType`, `setDateFrom`, `setDateTo`等）を使用すること。

Tabsのdefaultタブについては、`useDashboardSettings`の`defaults.defaultTab`をTabsの`defaultValue`に渡す:

```tsx
// 変更前
        <Tabs defaultValue="overview">

// 変更後
        <Tabs defaultValue={defaults.defaultTab}>
```

**SalesOverviewTab.tsx の変更**:

propsにフィルタ期間の情報を追加する（目標月をフィルタ期間と連動させるため）:

```tsx
// 変更前
interface SalesOverviewTabProps {
  data: RegisterDataResponse;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousCustomers?: number;
}

// 変更後
interface SalesOverviewTabProps {
  data: RegisterDataResponse;
  /** Z009から取得した客数合計 */
  totalCustomers: number;
  previousCustomers?: number;
  /** フィルタの開始日（目標月の特定に使用） */
  dateFrom: string;
}
```

import文に以下を追加する:

```tsx
// 変更後（既存のimport文の後に追加）
import TargetProgressBar from "../charts/TargetProgressBar";
import { useSalesTarget } from "../hooks/useSalesTarget";
```

コンポーネント内で `useSalesTarget` を呼び出し、フィルタの開始日に対応する年月の目標があればプログレスバーを表示する:

```tsx
// SalesOverviewTab コンポーネント内に追加
// フィルタの開始日から年月を取得（dateFromは"YYYY-MM-DD"形式）
const filterDate = new Date(dateFrom);
const targetYear = filterDate.getFullYear();
const targetMonth = filterDate.getMonth() + 1;
const { getTargetForMonth } = useSalesTarget(targetYear);
const monthlyTarget = getTargetForMonth(targetMonth);
```

KPIカードの上部にTargetProgressBarを配置する:

```tsx
// 変更前（KPIカード群の前）
      {/* KPIカード */}
      <KpiCards

// 変更後
      {/* 売上目標プログレスバー */}
      {monthlyTarget && (
        <TargetProgressBar
          currentAmount={data.summary.totalAmount}
          targetAmount={monthlyTarget.amount}
          label={`${targetYear}年${targetMonth}月 売上目標`}
        />
      )}

      {/* KPIカード */}
      <KpiCards
```

**RegisterDataViewer.tsx からSalesOverviewTabに`dateFrom`を渡す**:

```tsx
// 変更前
              <SalesOverviewTab
                data={data}
                totalCustomers={totalCustomers}
                previousCustomers={previousCustomers}
              />

// 変更後
              <SalesOverviewTab
                data={data}
                totalCustomers={totalCustomers}
                previousCustomers={previousCustomers}
                dateFrom={dateFrom}
              />
```

---

### タスク6: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **期間プリセット**
   - 売上分析タブのフィルタバーで期間を選択し、「保存」ボタンからプリセットを作成できる
   - 保存済みプリセットのバッジをクリックすると、フィルタの期間が切り替わる
   - バッジのxアイコンをクリックするとプリセットが削除される

2. **レジ名称管理**
   - 歯車アイコンからDialogを開き、レジ番号と表示名を登録できる
   - 編集ボタンで名称を変更できる
   - 削除ボタンで名称を削除できる
   - レジフィルターのセレクトボックスに登録した名称が表示される

3. **売上目標**
   - 「売上目標」ボタンからDialogを開き、年を切り替えて12ヶ月分の目標額を入力できる
   - 入力欄からフォーカスが外れると自動保存される
   - 売上概要タブに目標達成率のプログレスバーが表示される

4. **ダッシュボード初期表示設定**
   - 「表示設定」ボタンからDialogを開き、デフォルト期間タイプとデフォルトタブを変更できる
   - ページをリロードすると、設定した期間タイプとタブで初期表示される

## 変更対象ファイル一覧

| ファイル                                                                     | 変更内容               |
| ---------------------------------------------------------------------------- | ---------------------- |
| `app/api/register/presets/route.ts`                                          | **新規作成**           |
| `app/api/register/machines/names/route.ts`                                   | **新規作成**           |
| `app/api/register/targets/route.ts`                                          | **新規作成**           |
| `app/api/register/settings/route.ts`                                         | **新規作成**           |
| `app/dashboard/register/components/viewer/hooks/usePeriodPresets.ts`         | **新規作成**           |
| `app/dashboard/register/components/viewer/hooks/useMachineNames.ts`          | **新規作成**           |
| `app/dashboard/register/components/viewer/hooks/useSalesTarget.ts`           | **新規作成**           |
| `app/dashboard/register/components/viewer/hooks/useDashboardSettings.ts`     | **新規作成**           |
| `app/dashboard/register/components/viewer/PeriodPresets.tsx`                 | **新規作成**           |
| `app/dashboard/register/components/viewer/MachineNameSettings.tsx`           | **新規作成**           |
| `app/dashboard/register/components/viewer/SalesTargetSettings.tsx`           | **新規作成**           |
| `app/dashboard/register/components/viewer/DashboardSettings.tsx`             | **新規作成**           |
| `app/dashboard/register/components/viewer/charts/TargetProgressBar.tsx`      | **新規作成**           |
| `app/dashboard/register/components/viewer/RegisterDataViewer.tsx`            | 設定コンポーネント追加 |
| `app/dashboard/register/components/viewer/tabs/SalesOverviewTab.tsx`         | TargetProgressBar追加  |

## 備考

### 前提条件

- 本仕様書は仕様書02（基盤 + 売上概要タブ）のタスク1（セットアップ）でDBテーブルが作成済みであることを前提とする。`RegisterPeriodPreset`、`RegisterMachineName`、`RegisterSalesTarget`、`RegisterDashboardSetting` の4テーブルがPrismaスキーマに定義され、マイグレーション済みであること
- `RegisterDataViewer.tsx`と`SalesOverviewTab.tsx`は仕様書02のタスク12で作成済みであること
- `types.ts`（`PeriodType`、`AnalysisTabValue`、`PERIOD_LABELS`、`ANALYSIS_TABS`）は仕様書02のタスク2で作成済みであること

### 注意事項

- 既存のレジフィルター（`MachineFilter.tsx`）のレジ名称表示機能は仕様書02で既に対応済み。本仕様書では `MachineFilter.tsx` を変更しない
- API Routeでは `export const dynamic = "force-dynamic"` を必ず設定する（キャッシュ防止）
- shadcn/ui の Dialog、Select、Table、Input、Label、Button は仕様書02で導入済みのため、追加インストールは不要

### 並列実行可能なタスク

- タスク1（期間プリセット）とタスク2（レジ名称管理）は並列実行可能
