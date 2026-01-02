"use client";

import {
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
  useRef,
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductEditForm from "./ProductEditForm";

// localStorageのキー
const STORAGE_KEYS = {
  ACTIVE_TAB: "dashboard_active_tab",
  ACTIVE_CATEGORY_TAB: "dashboard_active_category_tab",
} as const;

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
  displayOrder: number | null;
}

interface ProductListProps {
  initialProducts: Product[];
  categories: Category[];
  onNewProductClick?: () => void;
}

export interface ProductListRef {
  refreshProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ initialProducts, categories, onNewProductClick }, ref) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // localStorageからタブの状態を読み込む
    const [activeTab, setActiveTab] = useState<"list" | "layout">(() => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        if (saved === "list" || saved === "layout") {
          return saved;
        }
      }
      return "list";
    });

    // タブが変更されたらlocalStorageに保存
    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
      }
    }, [activeTab]);

    // 初期カテゴリータブは、localStorageから読み込むか、公開商品がある最初のカテゴリー
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

    const [activeCategoryTab, setActiveCategoryTab] =
      useState<string>(initialCategoryTab);

    // カテゴリータブが変更されたらlocalStorageに保存
    useEffect(() => {
      if (typeof window !== "undefined" && activeCategoryTab) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_CATEGORY_TAB,
          activeCategoryTab
        );
      }
    }, [activeCategoryTab]);

    // カテゴリータブが変更されたら、activeCategoryTabも更新
    useEffect(() => {
      if (activeTab === "layout" && initialCategoryTab) {
        setActiveCategoryTab(initialCategoryTab);
      }
    }, [activeTab, initialCategoryTab]);

    // 検索条件の状態
    const [searchName, setSearchName] = useState("");
    const [searchPublished, setSearchPublished] = useState<boolean | null>(
      null
    ); // null: すべて, true: 公開のみ, false: 非公開のみ
    const [searchCategoryId, setSearchCategoryId] = useState<number | null>(
      null
    );

    const refreshProducts = async () => {
      try {
        // キャッシュを完全に無効化するためにタイムスタンプを追加
        const response = await fetch(`/api/products?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("商品一覧の更新に失敗しました:", error);
      }
    };

    // 親コンポーネントからrefreshProductsを呼べるようにする
    useImperativeHandle(ref, () => ({
      refreshProducts,
    }));

    const handleEdit = (product: Product) => {
      setEditingProduct(product);
    };

    const handleDelete = async (productId: number) => {
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "削除に失敗しました");
        }

        alert("商品を削除しました");
        await refreshProducts();
      } catch (error) {
        console.error("削除エラー:", error);
        alert(
          error instanceof Error ? error.message : "商品の削除に失敗しました"
        );
      }
    };

    const handleUpdated = async () => {
      await refreshProducts();
      // 編集フォームはProductEditFormのonCloseで閉じられるため、ここでは閉じない
    };

    // ドラッグ&ドロップ用のセンサー
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // 配置変更タブ用: 公開商品をカテゴリーごとにグループ化
    const publishedProductsByCategory = useMemo(() => {
      const published = products.filter((p) => p.published);

      // カテゴリーをID順でソート（小さい順）
      const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
      const categoryOrder = sortedCategories.map((c) => c.name);

      // カテゴリーごとにグループ化
      const grouped: Record<string, Product[]> = {};
      published.forEach((product) => {
        const categoryName = product.category.name;
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(product);
      });

      // 各カテゴリー内でdisplayOrderでソート（nullは最後）
      Object.keys(grouped).forEach((categoryName) => {
        const products = grouped[categoryName];
        if (products) {
          products.sort((a, b) => {
            if (a.displayOrder === null && b.displayOrder === null) return 0;
            if (a.displayOrder === null) return 1;
            if (b.displayOrder === null) return -1;
            return a.displayOrder - b.displayOrder;
          });
        }
      });

      // カテゴリーの順序に従って返す（商品があるカテゴリーのみ）
      return categoryOrder
        .map((categoryName) => ({
          name: categoryName,
          products: grouped[categoryName] || [],
        }))
        .filter((group) => group.products.length > 0);
    }, [products, categories]);

    // ドラッグ終了時の処理
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

      const newProducts = arrayMove(categoryGroup.products, oldIndex, newIndex);

      // 順序を更新
      const productOrders = newProducts.map((product, index) => ({
        id: product.id,
        displayOrder: index + 1,
      }));

      try {
        const response = await fetch("/api/products/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productOrders }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "順序の更新に失敗しました");
        }

        // 商品一覧を更新
        await refreshProducts();
      } catch (error) {
        console.error("順序更新エラー:", error);
        alert(
          error instanceof Error ? error.message : "順序の更新に失敗しました"
        );
      }
    };

    // カタカナをひらがなに変換する関数
    const toHiragana = (str: string): string => {
      return str.replace(/[\u30A1-\u30F6]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
      });
    };

    // 検索用の正規化関数（ひらがな・カタカナを統一し、大文字小文字も統一）
    const normalizeForSearch = (str: string): string => {
      return toHiragana(str.toLowerCase());
    };

    // 検索条件に基づいて商品をフィルタリング
    const filteredProducts = useMemo(() => {
      return products.filter((product) => {
        // 商品名で検索（ひらがな・カタカナ、大文字小文字を区別しない）
        if (searchName) {
          const normalizedProductName = normalizeForSearch(product.name);
          const normalizedSearchName = normalizeForSearch(searchName);
          if (!normalizedProductName.includes(normalizedSearchName)) {
            return false;
          }
        }

        // 公開/非公開でフィルタリング
        if (searchPublished !== null && product.published !== searchPublished) {
          return false;
        }

        // カテゴリーでフィルタリング
        if (
          searchCategoryId !== null &&
          product.category.id !== searchCategoryId
        ) {
          return false;
        }

        return true;
      });
    }, [products, searchName, searchPublished, searchCategoryId]);

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
                          <h3
                            className={`mb-1 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:mb-2 sm:text-xs md:text-lg ${
                              !product.published ? "text-gray-500" : ""
                            }`}
                          >
                            {product.name}
                          </h3>

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
                {publishedProductsByCategory.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">
                    公開されている商品がありません
                  </p>
                ) : (
                  (() => {
                    const activeCategoryGroup =
                      publishedProductsByCategory.find(
                        (g) => g.name === activeCategoryTab
                      );

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
                  })()
                )}
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

// カテゴリータブコンポーネント（スクロール可能な視覚的インジケーター付き）
function CategoryTabs({
  categories,
  publishedProductsByCategory,
  activeCategoryTab,
  onCategoryTabChange,
}: {
  categories: Category[];
  publishedProductsByCategory: Array<{ name: string; products: Product[] }>;
  activeCategoryTab: string;
  onCategoryTabChange: (name: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // スクロール位置をチェックしてグラデーションの表示を更新
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // スクロールイベントのハンドラー
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 初期チェック
    checkScrollPosition();

    // スクロール時にチェック
    container.addEventListener("scroll", checkScrollPosition);
    // リサイズ時にもチェック
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [categories, publishedProductsByCategory]);

  // アクティブなタブが変更されたら、そのタブまでスクロール
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeButton = scrollContainerRef.current.querySelector(
      `button[data-category-name="${activeCategoryTab}"]`
    ) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategoryTab]);

  return (
    <div className="mb-6 border-b border-gray-200 relative">
      {/* 左側のグラデーション */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      )}
      {/* 右側のグラデーション */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      )}
      {/* スクロール可能なタブコンテナ */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto -mx-6 px-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {[...categories]
            .sort((a, b) => a.id - b.id)
            .map((category) => {
              const categoryGroup = publishedProductsByCategory.find(
                (g) => g.name === category.name
              );
              const hasProducts =
                categoryGroup && categoryGroup.products.length > 0;

              return (
                <button
                  key={category.id}
                  data-category-name={category.name}
                  onClick={() => onCategoryTabChange(category.name)}
                  disabled={!hasProducts}
                  className={`relative whitespace-nowrap border-b-2 pb-3 sm:pb-4 px-2 sm:px-1 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                    activeCategoryTab === category.name
                      ? "border-blue-500 text-blue-600"
                      : hasProducts
                      ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      : "border-transparent text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {category.name}
                  {hasProducts && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-400">
                      ({categoryGroup!.products.length})
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>
    </div>
  );
}

// ソート可能な商品アイテムコンポーネント
function SortableProductItem({ product }: { product: Product }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {/* 商品画像 */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-full rounded object-cover sm:h-32 md:h-48"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48" />
      )}

      {/* 商品情報 */}
      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        {/* 商品名 */}
        <h3 className="mb-1 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:mb-2 sm:text-xs md:text-lg">
          {product.name}
        </h3>

        {/* 価格 */}
        <div className="mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm text-gray-500">
          {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}
          {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
