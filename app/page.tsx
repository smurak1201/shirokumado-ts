import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "./components/ProductCategoryTabs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
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
      {/*
       * ヘッダーの高さ分のスペーサー
       * CSS変数 --header-height（globals.cssで定義）を使用
       * この高さはHeroSectionのパララックス効果の計算にも使用される
       */}
      <div style={{ height: "var(--header-height)" }} />

      {/* ヒーローバナー */}
      <HeroSection />

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
