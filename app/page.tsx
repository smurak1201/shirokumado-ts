import Image from "next/image";
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "./components/ProductCategoryTabs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Separator } from "./components/ui/separator";
import { log } from "@/lib/logger";

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
    log.error("商品データの取得に失敗しました", {
      context: "Home",
      error,
    });
    categoriesWithProducts = [];
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ヘッダー */}
      <Header />
      {/* ヘッダーの高さ分のスペーサー */}
      <div className="h-20" />

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

      {/* ヒーローとコンテンツの区切り */}
      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <Separator className="bg-border/60" />
      </div>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-2 py-8 md:px-6 md:py-20 lg:px-8 lg:py-24 overflow-x-hidden">
        {/* カテゴリーごとの商品セクション - Tabsで切り替え */}
        <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
