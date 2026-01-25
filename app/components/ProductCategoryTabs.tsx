"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import ProductGrid from "./ProductGrid";
import type { CategoryWithProducts } from "@/lib/products";

interface ProductCategoryTabsProps {
  categoriesWithProducts: CategoryWithProducts[];
}

/**
 * カテゴリーをTabsで切り替えるコンポーネント
 *
 * カテゴリーをタブで切り替えて表示します。
 * 選択中のカテゴリーの商品のみ表示されます。
 */
export default function ProductCategoryTabs({
  categoriesWithProducts,
}: ProductCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    categoriesWithProducts[0]?.category.id.toString() || ""
  );

  if (categoriesWithProducts.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-center text-muted-foreground">
          商品の準備中です
        </p>
      </div>
    );
  }

  // カテゴリーが1つの場合は通常のグリッド表示
  if (categoriesWithProducts.length === 1) {
    const firstCategory = categoriesWithProducts[0];
    if (!firstCategory) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-muted-foreground">
            商品の準備中です
          </p>
        </div>
      );
    }
    return (
      <ProductGrid
        category={firstCategory.category}
        products={firstCategory.products}
      />
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="mb-8 h-auto w-full justify-start overflow-x-auto bg-transparent p-0 md:mb-12 lg:mb-16">
        <div className="flex gap-2 md:gap-4">
          {categoriesWithProducts.map(({ category }) => (
            <TabsTrigger
              key={category.id}
              value={category.id.toString()}
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-normal text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none md:text-lg lg:text-xl"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </div>
      </TabsList>

      <AnimatePresence mode="wait">
        {categoriesWithProducts.map(({ category, products }) => (
          <TabsContent
            key={category.id}
            value={category.id.toString()}
            className="mt-0"
            forceMount
          >
            {activeTab === category.id.toString() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ProductGrid
                  category={category}
                  products={products}
                  showCategoryTitle={false}
                />
              </motion.div>
            )}
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}
