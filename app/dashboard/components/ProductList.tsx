"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import ProductSearchFilters from "./ProductSearchFilters";
import ProductListView from "./ProductListView";
import { useTabState, useCategoryTabState } from "../hooks/useTabState";
import { useProductReorder } from "../hooks/useProductReorder";
import { groupProductsByCategory, filterProducts } from "../utils/productUtils";
import type { Category, Product } from "../types";

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
  categories: Category[];
  onNewProductClick?: () => void;
}

export default function ProductList({
  products,
  setProducts,
  refreshProducts,
  categories,
  onNewProductClick,
}: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { activeTab, setActiveTab } = useTabState();
  const { activeCategoryTab, setActiveCategoryTab, initialCategoryTab } =
    useCategoryTabState(products, categories);

  useEffect(() => {
    if (activeTab === "layout" && initialCategoryTab) {
      setActiveCategoryTab(initialCategoryTab);
    }
  }, [activeTab, initialCategoryTab, setActiveCategoryTab]);

  const [searchName, setSearchName] = useState("");
  const [searchPublished, setSearchPublished] = useState<boolean | null>(null);
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  const handleDelete = useCallback(
    async (productId: number) => {
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
    },
    [refreshProducts]
  );

  const handleUpdated = useCallback(async () => {
    await refreshProducts();
  }, [refreshProducts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const publishedProductsByCategory = useMemo(
    () => groupProductsByCategory(products, categories),
    [products, categories]
  );

  const { reorderProducts } = useProductReorder(setProducts, refreshProducts);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent, categoryName: string) => {
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
    },
    [publishedProductsByCategory, reorderProducts]
  );

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" role="tablist">
            <button
              onClick={() => setActiveTab("list")}
              role="tab"
              aria-selected={activeTab === "list"}
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
              role="tab"
              aria-selected={activeTab === "layout"}
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

        <div className="min-h-[400px]">
          {activeTab === "list" && (
            <>
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

              <ProductSearchFilters
                searchName={searchName}
                setSearchName={setSearchName}
                searchPublished={searchPublished}
                setSearchPublished={setSearchPublished}
                searchCategoryId={searchCategoryId}
                setSearchCategoryId={setSearchCategoryId}
                categories={categories}
              />

              <ProductListView
                products={products}
                filteredProducts={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          )}

          {activeTab === "layout" && (
            <div>
              <CategoryTabs
                categories={categories}
                publishedProductsByCategory={publishedProductsByCategory}
                activeCategoryTab={activeCategoryTab}
                onCategoryTabChange={setActiveCategoryTab}
              />

              {(() => {
                const activeCategoryGroup = publishedProductsByCategory.find(
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
                    collisionDetection={closestCorners}
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
