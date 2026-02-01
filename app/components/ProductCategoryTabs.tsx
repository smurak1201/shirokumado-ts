/**
 * カテゴリー別商品タブコンポーネント
 *
 * カテゴリーごとにタブで切り替えて商品を表示する。
 */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { CategoryWithProducts } from "@/lib/products";

// ProductGrid は比較的大きなコンポーネントのため、
// 動的インポートを使用してコード分割を行い初回読み込みを高速化
const ProductGrid = dynamic(
  () => import("./ProductGrid"),
  {
    loading: () => (
      <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    ),
  }
);

interface ProductCategoryTabsProps {
  categoriesWithProducts: CategoryWithProducts[];
}

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
            {/*
             * forceMount の理由:
             * - TabsContent はデフォルトでアクティブなタブのみDOMにマウントする
             * - AnimatePresence のアニメーションを機能させるには、
             *   非アクティブなタブもDOMに存在する必要がある
             */}
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
