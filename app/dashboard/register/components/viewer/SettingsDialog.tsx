"use client";

import { Settings } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import MachineNamesTab from "./settings/MachineNamesTab";
import DisplaySettingsTab from "./settings/DisplaySettingsTab";
import type { MachineInfo } from "../../types";

interface SettingsDialogProps {
  machines: MachineInfo[];
  onMachineNamesChange: () => Promise<void>;
}

export default function SettingsDialog({
  machines,
  onMachineNamesChange,
}: SettingsDialogProps) {
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

          <TabsContent value="machine-names" className="min-h-72 space-y-4">
            <MachineNamesTab
              machines={machines}
              onMachineNamesChange={onMachineNamesChange}
            />
          </TabsContent>

          <TabsContent value="display" className="min-h-72">
            <DisplaySettingsTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
