import { useState, useEffect, useMemo } from "react";
import type { Category, Product, TabType } from "../types";

const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

/**
 * ダッシュボードのタブ状態を管理するカスタムフック
 *
 * タブの状態を localStorage に保存・復元し、ページリロード後も選択していたタブを保持します。
 * hydrationエラーを防ぐため、初期状態は常にデフォルト値を使用し、
 * クライアント側でのみlocalStorageから値を読み込みます。
 */
export function useTabState() {
  // 初期状態は常にデフォルト値を使用（サーバー/クライアントで一致させる）
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [isHydrated, setIsHydrated] = useState(false);

  // クライアント側でのみlocalStorageから値を読み込む
  // localStorageは外部システムであり、hydration対応のためマウント時に同期が必要
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (saved === "list" || saved === "layout") {
      setActiveTab(saved);
    }
  }, []);

  // localStorageに保存
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab, isHydrated]);

  return { activeTab, setActiveTab };
}

/**
 * カテゴリータブの状態を管理するカスタムフック
 *
 * カテゴリータブの状態を localStorage に保存・復元し、
 * 公開商品がある最初のカテゴリーを自動選択します。
 * hydrationエラーを防ぐため、初期状態は常にデフォルト値を使用し、
 * クライアント側でのみlocalStorageから値を読み込みます。
 */
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  // デフォルトのカテゴリータブを計算（サーバー/クライアントで一致させる）
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

  // クライアント側でのみlocalStorageから値を読み込む
  // localStorageは外部システムであり、hydration対応のためマウント時に同期が必要
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

  // localStorageに保存
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
