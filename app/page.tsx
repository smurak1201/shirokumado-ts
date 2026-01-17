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
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[30vh] min-h-[200px] w-full overflow-hidden md:h-[50vh] md:min-h-[400px] lg:h-[60vh] lg:min-h-[500px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/8 to-white/25" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:py-20">
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
