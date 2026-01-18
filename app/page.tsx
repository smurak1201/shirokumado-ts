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
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[35vh] min-h-[250px] w-full overflow-hidden md:h-[55vh] md:min-h-[450px] lg:h-[65vh] lg:min-h-[550px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/10 to-background/60" />
        {/* 装飾的なオーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:py-24">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.map(({ category, products }) => (
          <ProductGrid
            key={category.id}
            category={category}
            products={products}
          />
        ))}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
