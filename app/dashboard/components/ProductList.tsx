"use client";

import {
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import ProductEditForm from "./ProductEditForm";
import CategoryTabs from "./CategoryTabs";
import SortableProductItem from "./SortableProductItem";
import { useTabState, useCategoryTabState } from "../hooks/useTabState";
import { useProductReorder } from "../hooks/useProductReorder";
import { groupProductsByCategory, filterProducts } from "../utils/productUtils";
import type { Category, Product } from "../types";

/**
 * ProductList の Props
 */
interface ProductListProps {
  initialProducts: Product[]; // 初期商品一覧
  categories: Category[]; // カテゴリー一覧
  onNewProductClick?: () => void; // 新規商品登録ボタンクリック時のコールバック
}

/**
 * ProductList の参照インターフェース
 * 親コンポーネントから商品一覧を更新するためのメソッドを公開します
 */
export interface ProductListRef {
  refreshProducts: () => Promise<void>; // 商品一覧を更新するメソッド
}

/**
 * 商品一覧と配置変更機能を提供するコンポーネント
 *
 * 主な機能:
 * - 商品一覧の表示（検索・フィルタリング対応）
 * - 商品の編集・削除
 * - 配置変更タブでのドラッグ&ドロップによる順序変更
 *
 * forwardRef を使用して、親コンポーネントから refreshProducts メソッドを呼び出せるようにしています
 */
const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ initialProducts, categories, onNewProductClick }, ref) => {
    // 商品一覧の状態管理
    // initialProducts を初期値として使用し、商品の追加・更新・削除時に更新されます
    const [products, setProducts] = useState<Product[]>(initialProducts);

    // 編集中の商品を管理（null の場合は編集フォームを表示しない）
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // タブ状態管理（localStorage と同期）
    // "list": 商品一覧タブ, "layout": 配置変更タブ
    const { activeTab, setActiveTab } = useTabState();

    // カテゴリータブの状態管理（localStorage と同期）
    // 配置変更タブで表示するカテゴリーを管理
    const { activeCategoryTab, setActiveCategoryTab, initialCategoryTab } =
      useCategoryTabState(products, categories);

    // 配置変更タブに切り替えたときに、初期カテゴリータブを設定
    useEffect(() => {
      if (activeTab === "layout" && initialCategoryTab) {
        setActiveCategoryTab(initialCategoryTab);
      }
    }, [activeTab, initialCategoryTab, setActiveCategoryTab]);

    // 検索条件の状態管理
    const [searchName, setSearchName] = useState(""); // 商品名での検索
    const [searchPublished, setSearchPublished] = useState<boolean | null>(
      null
    ); // null: すべて, true: 公開のみ, false: 非公開のみ
    const [searchCategoryId, setSearchCategoryId] = useState<number | null>(
      null
    ); // カテゴリーIDでのフィルタリング

    /**
     * 商品一覧をサーバーから取得して更新する
     * 商品の追加・更新・削除後に呼び出されます
     */
    const refreshProducts = async () => {
      try {
        // キャッシュを完全に無効化するためにタイムスタンプをクエリパラメータに追加
        // これにより、常に最新のデータを取得できます
        const response = await fetch(`/api/products?t=${Date.now()}`, {
          cache: "no-store", // Next.js のキャッシュを無効化
          headers: {
            "Cache-Control": "no-cache", // ブラウザのキャッシュを無効化
          },
        });
        const data = await response.json();
        // 取得した商品一覧で状態を更新
        setProducts(data.products || []);
      } catch (error) {
        console.error("商品一覧の更新に失敗しました:", error);
      }
    };

    /**
     * 親コンポーネントから refreshProducts メソッドを呼び出せるようにする
     * useImperativeHandle と forwardRef を組み合わせて実装しています
     */
    useImperativeHandle(ref, () => ({
      refreshProducts,
    }));

    /**
     * 商品編集を開始する
     * 編集フォームに商品情報を渡して表示します
     */
    const handleEdit = (product: Product) => {
      setEditingProduct(product);
    };

    /**
     * 商品を削除する
     * 確認ダイアログを表示してから削除を実行します
     */
    const handleDelete = async (productId: number) => {
      // 削除前に確認ダイアログを表示
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        // DELETE リクエストを送信
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "削除に失敗しました");
        }

        alert("商品を削除しました");
        // 削除後に商品一覧を更新
        await refreshProducts();
      } catch (error) {
        console.error("削除エラー:", error);
        alert(
          error instanceof Error ? error.message : "商品の削除に失敗しました"
        );
      }
    };

    /**
     * 商品更新後のコールバック関数
     * 商品一覧を更新します（編集フォームは ProductEditForm の onClose で閉じられます）
     */
    const handleUpdated = async () => {
      await refreshProducts();
    };

    /**
     * ドラッグ&ドロップ用のセンサーを設定
     * PointerSensor: マウス・タッチ操作を検知
     * KeyboardSensor: キーボード操作を検知（アクセシビリティ対応）
     */
    const sensors = useSensors(
      useSensor(PointerSensor), // マウス・タッチ操作
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates, // キーボード操作の座標計算
      })
    );

    /**
     * 配置変更タブ用: 公開商品をカテゴリーごとにグループ化
     * useMemo を使用して、products や categories が変更されたときのみ再計算します
     */
    const publishedProductsByCategory = useMemo(
      () => groupProductsByCategory(products, categories),
      [products, categories]
    );

    /**
     * 商品順序変更のカスタムフック
     * 楽観的UI更新を実装しています（API呼び出し前にUIを更新）
     */
    const { reorderProducts } = useProductReorder(setProducts, refreshProducts);

    /**
     * ドラッグ&ドロップが終了したときの処理
     * 商品の順序を変更してサーバーに保存します
     */
    const handleDragEnd = async (event: DragEndEvent, categoryName: string) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const categoryGroup = publishedProductsByCategory.find(
        (g) => g.name === categoryName
      );
      if (!categoryGroup) return;

      const oldIndex = categoryGroup.products.findIndex(
        (p) => p.id === active.id
      );
      const newIndex = categoryGroup.products.findIndex(
        (p) => p.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return;

      try {
        await reorderProducts(categoryGroup, oldIndex, newIndex);
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "順序の更新に失敗しました"
        );
      }
    };

    /**
     * 検索条件に基づいて商品をフィルタリング
     *
     * useMemo を使用して、検索条件や商品一覧が変更されたときのみ再計算します。
     * これにより、不要な再計算を防ぎ、パフォーマンスを向上させます。
     *
     * フィルタリング条件:
     * - 商品名: 部分一致（ひらがな・カタカナ、大文字小文字を区別しない）
     * - 公開状態: 公開/非公開/すべて
     * - カテゴリー: 指定されたカテゴリーID
     */
    const filteredProducts = useMemo(
      () =>
        filterProducts(products, searchName, searchPublished, searchCategoryId),
      [products, searchName, searchPublished, searchCategoryId] // 依存配列
    );

    return (
      <>
        <div className="rounded-lg bg-white p-6 shadow">
          {/* タブ */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("list")}
                className={`relative whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                登録済み商品一覧
              </button>
              <button
                onClick={() => setActiveTab("layout")}
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

          {/* タブコンテンツ */}
          <div className="min-h-[400px]">
            {activeTab === "list" && (
              <>
                {/* ヘッダー: ボタン */}
                <div className="mb-4">
                  {onNewProductClick && (
                    <button
                      onClick={onNewProductClick}
                      className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      新規商品登録
                    </button>
                  )}
                </div>

                {/* 検索・フィルターエリア */}
                <div className="mb-4 space-y-4">
                  {/* 商品名、カテゴリー、公開情報を横並び */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
                    {/* 商品名検索 */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        商品名
                      </label>
                      <input
                        type="text"
                        placeholder="商品名で検索..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full max-w-[224px] rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>

                    {/* カテゴリーフィルター */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カテゴリー
                      </label>
                      <select
                        value={searchCategoryId || ""}
                        onChange={(e) =>
                          setSearchCategoryId(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="w-full max-w-[224px] rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">すべてのカテゴリー</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 公開/非公開フィルター */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公開情報
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === null}
                            onChange={() => setSearchPublished(null)}
                            className="mr-2"
                          />
                          <span>すべて</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === true}
                            onChange={() => setSearchPublished(true)}
                            className="mr-2"
                          />
                          <span>公開</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === false}
                            onChange={() => setSearchPublished(false)}
                            className="mr-2"
                          />
                          <span>非公開</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500">
                    {products.length === 0
                      ? "登録されている商品はありません"
                      : "検索条件に一致する商品がありません"}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 ${
                          !product.published ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        {/* 商品画像 */}
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`h-20 w-full rounded object-cover sm:h-32 md:h-48 ${
                              !product.published ? "opacity-50" : ""
                            }`}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48 ${
                              !product.published ? "opacity-50" : ""
                            }`}
                          />
                        )}

                        {/* 商品情報 */}
                        <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
                          {/* 商品名 */}
                          <div className={`mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]`}>
                          <h3
                              className={`line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg ${
                              !product.published ? "text-gray-500" : ""
                            }`}
                          >
                            {product.name}
                          </h3>
                          </div>

                          {/* 公開状態・カテゴリ・タグ */}
                          <div className="mb-1 flex flex-wrap gap-0.5 sm:mb-2 sm:gap-1 md:gap-2">
                            <span
                              className={`rounded-full px-1 py-0.5 text-[8px] font-medium sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                                product.published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.published ? "公開" : "非公開"}
                            </span>
                            <span
                              className={`rounded-full px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                                !product.published
                                  ? "bg-gray-200 text-gray-500"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {product.category.name}
                            </span>
                          </div>

                          {/* 価格 */}
                          <div
                            className={`mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm ${
                              !product.published
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {product.priceS && (
                              <span>S: ¥{product.priceS.toLocaleString()}</span>
                            )}
                            {product.priceS && product.priceL && (
                              <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
                            )}
                            {product.priceL && (
                              <span>L: ¥{product.priceL.toLocaleString()}</span>
                            )}
                          </div>

                          {/* ボタン */}
                          <div className="mt-auto flex gap-0.5 sm:gap-1 md:gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex-1 rounded-md bg-blue-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-blue-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 rounded-md bg-red-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-red-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "layout" && (
              <div>
                {/* カテゴリータブ */}
                <CategoryTabs
                  categories={categories}
                  publishedProductsByCategory={publishedProductsByCategory}
                  activeCategoryTab={activeCategoryTab}
                  onCategoryTabChange={setActiveCategoryTab}
                />

                {/* 選択されたカテゴリーの商品を表示 */}
                {(() => {
                  // 選択されたカテゴリーの商品を取得
                  const activeCategoryGroup = publishedProductsByCategory.find(
                    (g) => g.name === activeCategoryTab
                  );

                  // カテゴリーが存在しない、または商品がない場合
                  if (
                    !activeCategoryGroup ||
                    activeCategoryGroup.products.length === 0
                  ) {
                    return (
                      <p className="py-8 text-center text-gray-500">
                        {activeCategoryTab}に公開されている商品がありません
                      </p>
                    );
                  }

                  // 商品がある場合
                  return (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) =>
                        handleDragEnd(event, activeCategoryTab)
                      }
                    >
                      <SortableContext
                        items={activeCategoryGroup.products.map((p) => p.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
                          {activeCategoryGroup.products.map((product) => (
                            <SortableProductItem
                              key={product.id}
                              product={product}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {editingProduct && (
          <ProductEditForm
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onUpdated={handleUpdated}
          />
        )}
      </>
    );
  }
);

ProductList.displayName = "ProductList";

export default ProductList;
