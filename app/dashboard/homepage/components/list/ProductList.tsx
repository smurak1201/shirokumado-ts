/**
 * @fileoverview 商品一覧の管理コンポーネント
 *
 * ## 目的
 * ダッシュボードでの商品一覧表示と配置変更の機能を提供します。
 *
 * ## 主な機能
 * - 「登録済み商品一覧」タブ: 検索・フィルタリング機能を備えた商品リスト
 * - 「配置変更」タブ: ドラッグ&ドロップによる商品の順序変更
 * - 商品の編集・削除機能
 * - タブ状態とカテゴリータブの状態管理
 *
 * ## 実装の特性
 * - Client Component: ユーザーインタラクション（タブ切り替え、編集、削除）を扱うため
 * - 動的インポート: ProductLayoutTab は重いコンポーネントのため、必要時のみ読み込む
 * - カスタムフック活用: タブ状態、検索状態を専用フックで管理
 *
 * ## アーキテクチャ
 * - ProductListTabs: タブUI（list/layoutの切り替え）
 * - ProductListContent: 商品リスト表示（検索フィルター + グリッド）
 * - ProductLayoutTab: 配置変更UI（@dnd-kit/sortable使用）
 * - ProductForm: 編集モーダル（編集対象の商品を受け取る）
 *
 * ## ベストプラクティス
 * - 編集対象の商品は useState で管理（編集モーダルの開閉制御）
 * - 削除時は confirm で確認を取る（誤操作防止）
 * - 削除・編集後は refreshProducts でリストを最新化
 * - 配置変更タブに切り替え時、初期カテゴリータブを復元（UX向上）
 *
 * @see {@link ProductListTabs} - タブUI
 * @see {@link ProductListContent} - リスト表示
 * @see {@link ProductLayoutTab} - 配置変更
 * @see {@link ProductForm} - 編集フォーム
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import ProductForm from "../form/ProductForm";
import ProductListTabs from "./ProductListTabs";
import ProductListContent from "./ProductListContent";
import { useTabState, useCategoryTabState } from "../../hooks/useTabState";
import { useProductSearch } from "../../hooks/useProductSearch";
import type { Category, Product } from "../../types";

/**
 * ProductLayoutTab の動的インポート
 *
 * 配置変更タブは @dnd-kit/sortable を含む重いコンポーネントのため、
 * 必要時のみ読み込むことでバンドルサイズを削減し、初期表示を高速化します。
 *
 * - ssr: false: クライアントサイドでのみ実行（DOM操作を含むため）
 * - loading: ローディング中のフォールバックUI
 */
const ProductLayoutTab = dynamic(
  () => import("../layout/ProductLayoutTab"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * ProductList コンポーネントのprops
 *
 * @property {Product[]} products - 表示する商品のリスト
 * @property {React.Dispatch<React.SetStateAction<Product[]>>} setProducts - 商品リストを更新する関数（配置変更で使用）
 * @property {() => Promise<void>} refreshProducts - サーバーから最新の商品データを再取得する関数
 * @property {Category[]} categories - カテゴリーのリスト（フィルター、フォームで使用）
 * @property {() => void} [onNewProductClick] - 「新規商品登録」ボタンのクリックハンドラー（オプション）
 */
interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
  categories: Category[];
  onNewProductClick?: () => void;
}

/**
 * 商品一覧の管理コンポーネント
 *
 * 商品の一覧表示、検索・フィルタリング、配置変更、編集・削除の機能を統合した
 * ダッシュボードのメインコンポーネントです。
 *
 * @param {ProductListProps} props - コンポーネントのprops
 * @returns {JSX.Element} 商品一覧UI
 *
 * @example
 * ```tsx
 * <ProductList
 *   products={products}
 *   setProducts={setProducts}
 *   refreshProducts={refreshProducts}
 *   categories={categories}
 *   onNewProductClick={() => setIsFormOpen(true)}
 * />
 * ```
 */
export default function ProductList({
  products,
  setProducts,
  refreshProducts,
  categories,
  onNewProductClick,
}: ProductListProps) {
  // タブ状態の管理: "list"（一覧）と "layout"（配置変更）の切り替え
  // localStorage に永続化されるため、リロード後も状態が維持されます
  const { activeTab, setActiveTab } = useTabState();

  // カテゴリータブの状態管理: 配置変更タブ内でのカテゴリー切り替え
  // initialCategoryTab: 最初に表示すべきカテゴリー（商品がある最初のカテゴリー）
  const { activeCategoryTab, setActiveCategoryTab, initialCategoryTab } =
    useCategoryTabState(products, categories);

  // 編集中の商品を管理: null の場合は編集モーダルを閉じ、Product があれば開く
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 商品検索・フィルタリング機能
  // - searchName: 商品名での検索（ひらがな・カタカナ正規化対応）
  // - searchPublished: 公開状態でのフィルター（null/true/false）
  // - searchCategoryId: カテゴリーでのフィルター（null/カテゴリーID）
  // - filteredProducts: フィルター適用後の商品リスト
  const {
    searchName,
    setSearchName,
    searchPublished,
    setSearchPublished,
    searchCategoryId,
    setSearchCategoryId,
    filteredProducts,
  } = useProductSearch(products);

  /**
   * 配置変更タブに切り替えた際に初期カテゴリータブを復元する
   *
   * 配置変更タブでは、商品が存在する最初のカテゴリーを表示したいため、
   * タブ切り替え時に initialCategoryTab をセットします。
   *
   * 依存配列に activeTab と initialCategoryTab を含めることで、
   * タブ切り替え時やデータ変更時に正しく動作します。
   */
  useEffect(() => {
    if (activeTab === "layout" && initialCategoryTab) {
      setActiveCategoryTab(initialCategoryTab);
    }
  }, [activeTab, initialCategoryTab, setActiveCategoryTab]);

  /**
   * 商品の編集ボタンをクリックした際のハンドラー
   *
   * 編集対象の商品を state にセットすることで、編集モーダルが開きます。
   * useCallback でメモ化し、子コンポーネントの不要な再レンダリングを防ぎます。
   *
   * @param {Product} product - 編集対象の商品
   */
  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  /**
   * 商品の削除ボタンをクリックした際のハンドラー
   *
   * 処理の流れ:
   * 1. confirm で削除確認（誤操作防止）
   * 2. DELETE /api/products/:id を呼び出し
   * 3. 成功時: alert でユーザーに通知 → refreshProducts で最新データを取得
   * 4. 失敗時: エラーログを記録 → ユーザーフレンドリーなエラーメッセージを表示
   *
   * refreshProducts を依存配列に含めることで、関数が最新の状態を参照します。
   *
   * @param {number} productId - 削除対象の商品ID
   * @returns {Promise<void>}
   */
  const handleDelete = useCallback(
    async (productId: number): Promise<void> => {
      // 削除確認: キャンセルされた場合は処理を中断
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        // DELETE APIを呼び出し
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        // エラーレスポンスの処理
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "削除に失敗しました");
        }

        // 成功時: ユーザーに通知 → 最新データを取得
        alert("商品を削除しました");
        await refreshProducts();
      } catch (error) {
        // エラーログを記録（デバッグ用）
        log.error("商品の削除に失敗しました", {
          context: "ProductList.handleDelete",
          error,
          metadata: { productId },
        });
        // ユーザーフレンドリーなエラーメッセージを表示
        alert(getUserFriendlyMessageJa(error));
      }
    },
    [refreshProducts]
  );

  /**
   * 商品の編集が完了した際のハンドラー
   *
   * 編集フォームの onSuccess で呼び出され、最新の商品データを再取得します。
   * useCallback でメモ化し、ProductForm への props 変更を最小限にします。
   *
   * @returns {Promise<void>}
   */
  const handleUpdated = useCallback(async () => {
    await refreshProducts();
  }, [refreshProducts]);

  return (
    <>
      {/* 商品一覧のメインコンテナ */}
      <div className="rounded-lg bg-white p-6 shadow">
        {/* タブUI: 「登録済み商品一覧」と「配置変更」の切り替え */}
        <ProductListTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* タブコンテンツ: 最小高さを設定してレイアウトの安定性を確保 */}
        <div className="min-h-[400px]">
          {/* 「登録済み商品一覧」タブの内容 */}
          {activeTab === "list" && (
            <ProductListContent
              products={products}
              filteredProducts={filteredProducts}
              categories={categories}
              searchName={searchName}
              setSearchName={setSearchName}
              searchPublished={searchPublished}
              setSearchPublished={setSearchPublished}
              searchCategoryId={searchCategoryId}
              setSearchCategoryId={setSearchCategoryId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNewProductClick={onNewProductClick}
            />
          )}

          {/* 「配置変更」タブの内容 */}
          {activeTab === "layout" && (
            <ProductLayoutTab
              products={products}
              categories={categories}
              activeCategoryTab={activeCategoryTab}
              onCategoryTabChange={setActiveCategoryTab}
              setProducts={setProducts}
              refreshProducts={refreshProducts}
            />
          )}
        </div>
      </div>

      {/* 商品編集モーダル: editingProduct が null でない場合のみ表示 */}
      {editingProduct && (
        <ProductForm
          categories={categories}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleUpdated}
          mode="edit"
          product={editingProduct}
        />
      )}
    </>
  );
}
