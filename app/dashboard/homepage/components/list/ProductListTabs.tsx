/**
 * @fileoverview 商品一覧のタブ切り替えコンポーネント
 *
 * ## 目的
 * 商品一覧ページのタブUI（「登録済み商品一覧」と「配置変更」）を提供します。
 *
 * ## 主な機能
 * - 2つのタブの表示: "list"（登録済み商品一覧）と "layout"（配置変更）
 * - タブのアクティブ状態管理
 * - タブ切り替え時のコールバック呼び出し
 *
 * ## 実装の特性
 * - Client Component: Tabs コンポーネントがユーザーインタラクションを扱うため
 * - シンプルなプレゼンテーショナルコンポーネント（状態は親で管理）
 * - shadcn/ui の Tabs コンポーネントを使用
 *
 * ## タブの種類
 * - "list": 登録済み商品一覧（検索・フィルタリング機能付き）
 * - "layout": 配置変更（ドラッグ&ドロップで順序変更）
 *
 * @see {@link ProductList} - 親コンポーネント
 */
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import type { TabType } from "../../types";

/**
 * ProductListTabs コンポーネントのprops
 *
 * @property {TabType} activeTab - 現在アクティブなタブ（"list" または "layout"）
 * @property {(tab: TabType) => void} onTabChange - タブ切り替え時のコールバック
 */
interface ProductListTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * 商品一覧のタブ切り替えコンポーネント
 *
 * 「登録済み商品一覧」と「配置変更」の2つのタブを表示し、
 * タブの切り替えを親コンポーネントに通知します。
 *
 * @param {ProductListTabsProps} props - コンポーネントのprops
 * @returns {JSX.Element} タブUI
 *
 * @example
 * ```tsx
 * <ProductListTabs
 *   activeTab="list"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 * ```
 */
export default function ProductListTabs({
  activeTab,
  onTabChange,
}: ProductListTabsProps) {
  return (
    <Tabs
      value={activeTab}
      // タブ切り替え時: 文字列を TabType にキャストして親コンポーネントに通知
      onValueChange={(value) => onTabChange(value as TabType)}
      className="mb-6"
    >
      <TabsList>
        {/* 登録済み商品一覧タブ: 商品の検索・フィルタリング・編集・削除 */}
        <TabsTrigger value="list">登録済み商品一覧</TabsTrigger>

        {/* 配置変更タブ: ドラッグ&ドロップで商品の表示順序を変更 */}
        <TabsTrigger value="layout">配置変更</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
