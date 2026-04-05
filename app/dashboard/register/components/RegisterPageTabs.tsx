"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import type { ImportSummary } from "../types";
import RegisterImportPage from "./RegisterImportPage";
import RegisterDataViewer from "./viewer/RegisterDataViewer";

interface RegisterPageTabsProps {
  initialSummary: ImportSummary;
}

export default function RegisterPageTabs({
  initialSummary,
}: RegisterPageTabsProps) {
  return (
    <Tabs defaultValue="analysis">
      <TabsList className="w-full">
        <TabsTrigger value="analysis" className="flex-1">
          売上分析
        </TabsTrigger>
        <TabsTrigger value="import" className="flex-1">
          データ取り込み
        </TabsTrigger>
      </TabsList>

      <TabsContent value="import">
        <RegisterImportPage initialSummary={initialSummary} />
      </TabsContent>

      <TabsContent value="analysis">
        <RegisterDataViewer />
      </TabsContent>
    </Tabs>
  );
}
