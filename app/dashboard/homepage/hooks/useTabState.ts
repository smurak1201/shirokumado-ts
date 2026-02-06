/**
 * タブ状態管理フック
 *
 * localStorageでタブ状態を永続化。
 * Next.js hydrationエラー防止のため、初期状態は常にデフォルト値を使用し、
 * マウント後にlocalStorageから読み込む。
 */
import { useMemo } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { Category, Product, TabType } from "../types";

const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

const TAB_VALUES: TabType[] = ["list", "layout"];

export function useTabState() {
  const [activeTab, setActiveTab] = useLocalStorageState<TabType>(
    STORAGE_KEYS.ACTIVE_TAB,
    "list",
    { validate: (v) => TAB_VALUES.includes(v as TabType) }
  );

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

  const [activeCategoryTab, setActiveCategoryTab] =
    useLocalStorageState<string>(
      STORAGE_KEYS.ACTIVE_CATEGORY_TAB,
      defaultCategoryTab,
      { validate: (v) => categories.some((c) => c.name === v) }
    );

  return {
    activeCategoryTab,
    setActiveCategoryTab,
    initialCategoryTab: defaultCategoryTab,
  };
}
