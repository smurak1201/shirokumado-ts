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
