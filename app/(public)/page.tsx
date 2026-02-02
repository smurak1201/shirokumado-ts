/**
 * トップページ
 *
 * 公開中の商品をカテゴリー別に表示するメインページ。
 * Server Componentとして実装し、データベースから直接データを取得。
 */
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import { Separator } from "@/app/components/ui/separator";
import { log } from "@/lib/logger";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default async function Home() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認
    log.error("商品データの取得に失敗しました", {
      context: "Home",
      error,
    });
    categoriesWithProducts = [];
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />

      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       *
       * CSS変数 --header-height を使用（複数箇所で同じ値を使うため一元管理）
       */}
      <div style={{ height: "var(--header-height)" }} />

      <HeroSection />

      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <Separator className="bg-border/60" />
      </div>

      <main className="mx-auto max-w-7xl px-2 py-8 md:px-6 md:py-20 lg:px-8 lg:py-24 overflow-x-hidden">
        <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
      </main>

      <Footer />
    </div>
  );
}
