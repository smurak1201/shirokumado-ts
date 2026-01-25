"use client";

import { useMemo, useCallback } from "react";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { config } from "@/lib/config";
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
import LayoutCategoryTabs from "./LayoutCategoryTabs";
import SortableProductItem from "./SortableProductItem";
import { useProductReorder } from "../hooks/useProductReorder";
import { groupProductsByCategory } from "../utils/productUtils";
import type { Category, Product } from "../types";

interface ProductLayoutTabProps {
  products: Product[];
  categories: Category[];
  activeCategoryTab: string;
  onCategoryTabChange: (categoryName: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
}

/**
 * 商品配置変更タブコンポーネント
 *
 * ドラッグ&ドロップによる商品の順序変更機能を提供します。
 * カテゴリーごとにタブを切り替えて、各カテゴリー内の商品の表示順序を変更できます。
 */
export default function ProductLayoutTab({
  products,
  categories,
  activeCategoryTab,
  onCategoryTabChange,
  setProducts,
  refreshProducts,
}: ProductLayoutTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: config.dndConfig.POINTER_ACTIVATION_DISTANCE,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: config.dndConfig.TOUCH_ACTIVATION_DELAY,
        tolerance: config.dndConfig.TOUCH_TOLERANCE,
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
    async (event: DragEndEvent, categoryName: string): Promise<void> => {
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
        alert(getUserFriendlyMessageJa(error));
      }
    },
    [publishedProductsByCategory, reorderProducts]
  );

  const activeCategoryGroup = publishedProductsByCategory.find(
    (g) => g.name === activeCategoryTab
  );

  const hasProducts = activeCategoryGroup && activeCategoryGroup.products.length > 0;

  return (
    <div>
      <LayoutCategoryTabs
        categories={categories}
        publishedProductsByCategory={publishedProductsByCategory}
        activeCategoryTab={activeCategoryTab}
        onCategoryTabChange={onCategoryTabChange}
      />

      {!hasProducts ? (
        <p className="py-8 text-center text-gray-500">
          {activeCategoryTab}に公開されている商品がありません
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={(event) => handleDragEnd(event, activeCategoryTab)}
        >
          <SortableContext
            items={activeCategoryGroup.products.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
              {activeCategoryGroup.products.map((product) => (
                <SortableProductItem key={product.id} product={product} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
