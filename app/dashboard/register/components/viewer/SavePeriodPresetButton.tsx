"use client";

import { useState } from "react";
import { Save } from "lucide-react";
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

interface SavePeriodPresetButtonProps {
  currentDateFrom: string;
  currentDateTo: string;
  onSave: (name: string, dateFrom: string, dateTo: string) => Promise<boolean>;
}

export default function SavePeriodPresetButton({
  currentDateFrom,
  currentDateTo,
  onSave,
}: SavePeriodPresetButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSave = async () => {
    if (!newName.trim()) return;
    const success = await onSave(newName, currentDateFrom, currentDateTo);
    if (success) {
      setNewName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Save className="h-3 w-3" />
          この期間を保存
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
          <div className="text-sm text-solid-gray-536">
            保存する期間: {currentDateFrom} ~ {currentDateTo}
          </div>
          <Button onClick={handleSave} className="w-full">
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
