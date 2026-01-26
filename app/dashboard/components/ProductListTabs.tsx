"use client";

import type { TabType } from "../types";

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
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex space-x-8" role="tablist">
        <button
          onClick={() => onTabChange("list")}
          role="tab"
          aria-selected={activeTab === "list"}
          className={`relative whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          登録済み商品一覧
        </button>
        <button
          onClick={() => onTabChange("layout")}
          role="tab"
          aria-selected={activeTab === "layout"}
          className={`relative whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
            activeTab === "layout"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          配置変更
        </button>
      </nav>
    </div>
  );
}
