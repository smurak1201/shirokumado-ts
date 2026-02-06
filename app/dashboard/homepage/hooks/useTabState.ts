/**
 * タブ状態管理フック
 *
 * localStorageでタブ状態を永続化。
 * Next.js hydrationエラー防止のため、初期状態は常にデフォルト値を使用し、
 * マウント後にlocalStorageから読み込む。
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import type { Category, Product, TabType } from "../types";

const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

export function useTabState() {
  const [activeTab, setActiveTab] = useState<TabType>("list");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (saved === "list" || saved === "layout") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
      setActiveTab(saved);
    }
  }, []);

  const handleSetActiveTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  }, []);

  return { activeTab, setActiveTab: handleSetActiveTab };
}

export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  // 公開商品があるカテゴリーを優先的に選択
  const defaultCategoryTab = useMemo(() => {
    const published = products.filter((p) => p.published);
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

    if (published.length > 0) {
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    return sortedCategories[0]?.name || "";
  }, [products, categories]);

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(
    defaultCategoryTab
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
    if (saved) {
      const categoryExists = categories.some((c) => c.name === saved);
      if (categoryExists) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
        setActiveCategoryTab(saved);
      }
    }
  }, [categories]);

  const handleSetActiveCategoryTab = useCallback((tab: string) => {
    setActiveCategoryTab(tab);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, tab);
  }, []);

  return {
    activeCategoryTab,
    setActiveCategoryTab: handleSetActiveCategoryTab,
    initialCategoryTab: defaultCategoryTab,
  };
}
