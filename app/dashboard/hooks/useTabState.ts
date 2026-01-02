import { useState, useEffect, useMemo } from "react";
import type { Category, Product } from "../types";

/**
 * localStorage のキー定義
 * タブの状態をブラウザに保存する際に使用します
 */
const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab", // メインタブ（"list" または "layout"）
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab", // カテゴリータブ名
} as const;

/**
 * タブの種類
 */
type TabType = "list" | "layout";

/**
 * ダッシュボードのタブ状態を管理するカスタムフック
 *
 * 機能:
 * - タブの状態を localStorage に保存・復元
 * - ページリロード後も選択していたタブを保持
 *
 * @returns { activeTab, setActiveTab } - 現在のタブとタブを変更する関数
 */
export function useTabState() {
  // 初期値を localStorage から読み込む
  // サーバーサイドレンダリング時は window が存在しないため、typeof window チェックが必要
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      // 保存された値が有効なタブタイプか確認
      if (saved === "list" || saved === "layout") {
        return saved;
      }
    }
    // デフォルトは "list" タブ
    return "list";
  });

  // タブが変更されたら localStorage に保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab]);

  return { activeTab, setActiveTab };
}

/**
 * カテゴリータブの状態を管理するカスタムフック
 *
 * 機能:
 * - カテゴリータブの状態を localStorage に保存・復元
 * - 公開商品がある最初のカテゴリーを自動選択
 * - ページリロード後も選択していたカテゴリーを保持
 *
 * @param products - 商品一覧（公開状態の判定に使用）
 * @param categories - カテゴリー一覧
 * @returns { activeCategoryTab, setActiveCategoryTab, initialCategoryTab }
 */
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  /**
   * 初期カテゴリータブを決定
   * 優先順位:
   * 1. localStorage に保存されたカテゴリー（存在する場合）
   * 2. 公開商品がある最初のカテゴリー
   * 3. 最初のカテゴリー（ID順）
   */
  const initialCategoryTab = useMemo(() => {
    // localStorage から保存されたカテゴリータブを読み込む
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
      if (saved) {
        // 保存されたカテゴリーが現在も存在するか確認
        const categoryExists = categories.some((c) => c.name === saved);
        if (categoryExists) {
          return saved;
        }
      }
    }

    // 公開商品があるカテゴリーを探す
    const published = products.filter((p) => p.published);
    // カテゴリーをID順でソート（小さい順）
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    if (published.length > 0) {
      // 公開商品がある最初のカテゴリーを探す
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    // 公開商品がない場合は最初のカテゴリーを返す
    return sortedCategories[0]?.name || "";
  }, [products, categories]);

  // カテゴリータブの状態を管理
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(
    initialCategoryTab
  );

  // カテゴリータブが変更されたら localStorage に保存
  useEffect(() => {
    if (typeof window !== "undefined" && activeCategoryTab) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, activeCategoryTab);
    }
  }, [activeCategoryTab]);

  return { activeCategoryTab, setActiveCategoryTab, initialCategoryTab };
}
