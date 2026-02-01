/**
 * @fileoverview タブ状態管理カスタムフック - localStorage連携とhydration対応
 *
 * ## 目的
 * - ダッシュボードのタブ選択状態を永続化
 * - ページリロード後も選択していたタブを保持
 * - Next.js App RouterのSSR/hydrationエラーを防ぐ
 *
 * ## 主な機能
 * - メインタブ（一覧/レイアウト）の状態管理
 * - カテゴリータブの状態管理と自動選択
 * - localStorageへの保存・復元
 * - hydration対応（サーバー/クライアント間の状態不一致を防ぐ）
 *
 * ## 使用場所
 * - app/dashboard/homepage/page.tsx
 * - ダッシュボードのタブ切り替えUI
 *
 * ## 実装の特性
 * - **Client Component専用**: localStorageに依存
 * - **hydration対応**: 初期状態はサーバー/クライアントで一致させる
 * - **外部システム同期**: useEffectでlocalStorageと同期
 *
 * ## hydration問題とその対策
 * - **問題**: localStorageはブラウザ専用APIで、サーバー側では使用不可
 * - **結果**: サーバー側とクライアント側で初期状態が異なるとhydrationエラー
 * - **対策**: 初期状態は常にデフォルト値を使用し、マウント後にlocalStorageから読み込む
 *
 * ## UX上の理由
 * - **状態永続化**: ページリロード後も同じタブが表示される（ユーザーの作業継続性）
 * - **自動選択**: 公開商品があるカテゴリーを優先的に表示（コンテンツファースト）
 *
 * ## パフォーマンス最適化
 * - useMemo: カテゴリータブのデフォルト値を計算結果をキャッシュ
 * - isHydrated: hydration完了後のみlocalStorageに保存（不要な保存を防ぐ）
 *
 * @see https://nextjs.org/docs/messages/react-hydration-error
 */

import { useState, useEffect, useMemo } from "react";
import type { Category, Product, TabType } from "../types";

/**
 * localStorageのキー定義
 *
 * タブ状態を保存するlocalStorageのキーを定義します。
 * as constで型推論を強化し、タイポを防ぎます。
 */
const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab", // メインタブ（一覧/レイアウト）
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab", // カテゴリータブ
} as const;

/**
 * ダッシュボードのメインタブ状態を管理するカスタムフック
 *
 * タブの状態をlocalStorageに保存・復元し、ページリロード後も選択していたタブを保持します。
 * hydrationエラーを防ぐため、初期状態は常にデフォルト値を使用し、
 * クライアント側でのみlocalStorageから値を読み込みます。
 *
 * @returns activeTab（現在のタブ）、setActiveTab（タブ変更関数）
 *
 * ## 使用例
 * ```tsx
 * const { activeTab, setActiveTab } = useTabState();
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="list">一覧</TabsTrigger>
 *     <TabsTrigger value="layout">レイアウト</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 * ```
 *
 * ## hydration対応の実装
 * 1. 初期状態: 常に"list"（サーバー/クライアントで一致）
 * 2. マウント時: localStorageから値を読み込んで状態を更新
 * 3. 状態変更時: localStorageに保存
 *
 * ## トレードオフ
 * - **初回表示**: localStorageの値が反映されるまで一瞬デフォルトタブが表示される
 * - **利点**: hydrationエラーを確実に防ぐ、シンプルな実装
 */
export function useTabState() {
  // 初期状態は常にデフォルト値を使用（サーバー/クライアントで一致させる）
  // hydrationエラーを防ぐため、localStorageから直接読み込まない
  const [activeTab, setActiveTab] = useState<TabType>("list");

  // hydration完了フラグ
  // true: クライアント側でマウント済み（localStorageから読み込み可能）
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * マウント時にlocalStorageから値を読み込む
   *
   * ## 処理の流れ
   * 1. isHydratedをtrueに設定（hydration完了）
   * 2. localStorageから値を読み込む
   * 3. 値が有効な場合はactiveTabを更新
   *
   * ## eslint-disable の理由
   * - useEffectの中でsetStateを呼び出している（通常は推奨されない）
   * - hydration対応のための例外的なパターン
   * - マウント時の一度だけ実行される初期化処理
   *
   * ## バリデーション
   * - saved === "list" || saved === "layout": 有効な値のみ受け入れる
   * - 不正な値の場合はデフォルト値（"list"）を使用
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    // バリデーション: 有効な値のみ受け入れる
    if (saved === "list" || saved === "layout") {
      setActiveTab(saved);
    }
  }, []);

  /**
   * activeTabが変更されたらlocalStorageに保存
   *
   * ## isHydratedのチェック理由
   * - hydration完了前は保存しない（初期状態のデフォルト値を保存しない）
   * - マウント時にlocalStorageから読み込んだ値のみを保存
   *
   * ## 依存配列
   * - [activeTab, isHydrated]: どちらかが変更されたら実行
   * - activeTabの変更 → ユーザーがタブを切り替えた
   * - isHydratedの変更 → マウント時の初期化
   */
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
 * カテゴリータブの状態をlocalStorageに保存・復元し、
 * 公開商品がある最初のカテゴリーを自動選択します。
 * hydrationエラーを防ぐため、初期状態は常にデフォルト値を使用し、
 * クライアント側でのみlocalStorageから値を読み込みます。
 *
 * @param products - 商品一覧（公開状態の判定に使用）
 * @param categories - カテゴリー一覧（デフォルトタブの計算に使用）
 * @returns activeCategoryTab（現在のカテゴリー）、setActiveCategoryTab（変更関数）、initialCategoryTab（デフォルト値）
 *
 * ## 使用例
 * ```tsx
 * const { activeCategoryTab, setActiveCategoryTab } = useCategoryTabState(products, categories);
 * <Tabs value={activeCategoryTab} onValueChange={setActiveCategoryTab}>
 *   {categories.map(c => <TabsTrigger value={c.name}>{c.name}</TabsTrigger>)}
 * </Tabs>
 * ```
 *
 * ## デフォルトタブの選択ロジック
 * 1. 公開商品がある場合: 公開商品があるカテゴリーのうち、ID昇順で最初のカテゴリー
 * 2. 公開商品がない場合: ID昇順で最初のカテゴリー
 *
 * ## 実装の理由
 * - **コンテンツファースト**: 公開商品があるカテゴリーを優先的に表示
 * - **UX向上**: ユーザーが最も見たい情報を最初に表示
 * - **ID昇順**: 安定したソート順（カテゴリーの表示順と一致）
 */
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  /**
   * デフォルトのカテゴリータブを計算
   *
   * ## useMemoの理由
   * - 計算コストが比較的高い（フィルタリング、ソート、検索）
   * - products、categoriesが変更されない限り再計算不要
   * - レンダリング時の無駄な計算を防ぐ
   *
   * ## 計算ロジック
   * 1. 公開商品のみフィルタリング
   * 2. カテゴリーをID昇順でソート
   * 3. 公開商品がある場合: 公開商品があるカテゴリーのうち最初のカテゴリーを選択
   * 4. 公開商品がない場合: 最初のカテゴリーを選択
   *
   * ## フォールバック
   * - firstCategory?.name: 公開商品があるカテゴリーが見つからない場合
   * - sortedCategories[0]?.name: カテゴリーが1つも存在しない場合
   * - "": カテゴリーが空の場合
   */
  const defaultCategoryTab = useMemo(() => {
    // 公開商品のみフィルタリング
    const published = products.filter((p) => p.published);

    // カテゴリーをID昇順でソート（表示順と一致させる）
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

    if (published.length > 0) {
      // 公開商品があるカテゴリーのうち、最初のカテゴリーを選択
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    // 公開商品がない場合は最初のカテゴリーを選択
    return sortedCategories[0]?.name || "";
  }, [products, categories]);

  // 初期状態はデフォルト値を使用（hydration対応）
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(
    defaultCategoryTab
  );

  // hydration完了フラグ
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * マウント時にlocalStorageから値を読み込む
   *
   * ## 処理の流れ
   * 1. isHydratedをtrueに設定（hydration完了）
   * 2. localStorageから値を読み込む
   * 3. カテゴリーが存在する場合のみactiveCategoryTabを更新
   *
   * ## バリデーション
   * - categories.some((c) => c.name === saved): カテゴリーが存在するかチェック
   * - カテゴリーが削除された場合はデフォルト値を使用
   *
   * ## 依存配列
   * - [categories]: カテゴリーが変更されたら再実行
   * - カテゴリー追加・削除時にバリデーションを再実行
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
    if (saved) {
      // バリデーション: カテゴリーが存在する場合のみ受け入れる
      const categoryExists = categories.some((c) => c.name === saved);
      if (categoryExists) {
        setActiveCategoryTab(saved);
      }
    }
  }, [categories]);

  /**
   * activeCategoryTabが変更されたらlocalStorageに保存
   *
   * ## isHydratedのチェック理由
   * - hydration完了前は保存しない
   * - マウント時にlocalStorageから読み込んだ値のみを保存
   *
   * ## activeCategoryTabのチェック理由
   * - 空文字列の場合は保存しない（カテゴリーが存在しない場合）
   */
  useEffect(() => {
    if (isHydrated && activeCategoryTab) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, activeCategoryTab);
    }
  }, [activeCategoryTab, isHydrated]);

  return {
    activeCategoryTab, // 現在選択中のカテゴリー名
    setActiveCategoryTab, // カテゴリー変更関数
    initialCategoryTab: defaultCategoryTab, // デフォルトのカテゴリー名（参照用）
  };
}
