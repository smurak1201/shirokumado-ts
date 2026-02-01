/**
 * タブ状態管理フック
 *
 * localStorageでタブ状態を永続化。
 * Next.js hydrationエラー防止のため、初期状態は常にデフォルト値を使用し、
 * マウント後にlocalStorageから読み込む。
 */
import { useState, useEffect, useMemo } from "react";
import type { Category, Product, TabType } from "../types";

const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

export function useTabState() {
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (saved === "list" || saved === "layout") {
      setActiveTab(saved);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab, isHydrated]);

  return { activeTab, setActiveTab };
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
    if (saved) {
      const categoryExists = categories.some((c) => c.name === saved);
      if (categoryExists) {
        setActiveCategoryTab(saved);
      }
    }
  }, [categories]);

  useEffect(() => {
    if (isHydrated && activeCategoryTab) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, activeCategoryTab);
    }
  }, [activeCategoryTab, isHydrated]);

  return {
    activeCategoryTab,
    setActiveCategoryTab,
    initialCategoryTab: defaultCategoryTab,
  };
}
