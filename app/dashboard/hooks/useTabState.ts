import { useState, useEffect, useMemo } from "react";
import type { Category, Product } from "../types";

const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

type TabType = "list" | "layout";

/**
 * ダッシュボードのタブ状態を管理するカスタムフック
 */
export function useTabState() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      if (saved === "list" || saved === "layout") {
        return saved;
      }
    }
    return "list";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab]);

  return { activeTab, setActiveTab };
}

/**
 * カテゴリータブの状態を管理するカスタムフック
 */
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  const initialCategoryTab = useMemo(() => {
    // localStorageから保存されたカテゴリータブを読み込む
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
      if (saved) {
        // 保存されたカテゴリーが存在するか確認
        const categoryExists = categories.some((c) => c.name === saved);
        if (categoryExists) {
          return saved;
        }
      }
    }

    const published = products.filter((p) => p.published);
    // カテゴリーをID順でソート（小さい順）
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
    initialCategoryTab
  );

  useEffect(() => {
    if (typeof window !== "undefined" && activeCategoryTab) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, activeCategoryTab);
    }
  }, [activeCategoryTab]);

  return { activeCategoryTab, setActiveCategoryTab, initialCategoryTab };
}
