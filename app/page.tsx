import Image from "next/image";
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductGrid from "./components/ProductGrid";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

/**
 * トップページコンポーネント
 *
 * 公開されている商品をカテゴリーごとに表示します。
 * ヒーローバナー、商品グリッド、フッターで構成されます。
 */
export default async function Home() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
    categoriesWithProducts = [];
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden md:h-[60vh] md:min-h-[500px] lg:h-[70vh] lg:min-h-[600px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* グラデーションオーバーレイ - 軽減 */}
        <div className="absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background/40" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-2 py-8 md:px-6 md:py-20 lg:px-8 lg:py-24 overflow-x-hidden">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.length > 0 ? (
          categoriesWithProducts.map(({ category, products }) => (
            <ProductGrid
              key={category.id}
              category={category}
              products={products}
            />
          ))
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-center text-muted-foreground">
              商品の準備中です
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
