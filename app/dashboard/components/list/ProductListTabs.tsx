"use client";

import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import type { TabType } from "../../types";

interface ProductListTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * 商品一覧のタブ切り替えコンポーネント
 *
 * 「登録済み商品一覧」と「配置変更」のタブを表示します。
 */
export default function ProductListTabs({
  activeTab,
  onTabChange,
}: ProductListTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabType)}
      className="mb-6"
    >
      <TabsList>
        <TabsTrigger value="list">登録済み商品一覧</TabsTrigger>
        <TabsTrigger value="layout">配置変更</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
