/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * Promise.allでデータ取得と最低表示時間を並列で待機し、
 * 最低1秒のローディング表示を保証する。
 */
import Link from "next/link";
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

// ローディング画面の最低表示時間（ms）
const MIN_LOADING_TIME_MS = 1500;

export default async function HomeContent() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    // データ取得と最低表示時間を並列で待機
    // - データ取得が0.3秒で完了 → 1.5秒後にコンテンツ表示
    // - データ取得が2.5秒かかる → 2.5秒後にコンテンツ表示
    const [data] = await Promise.all([
      getPublishedProductsByCategory(),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS)),
    ]);
    categoriesWithProducts = data;
  } catch (error) {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認
    log.error("商品データの取得に失敗しました", {
      context: "HomeContent",
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
       */}
      <div style={{ height: "var(--header-height)" }} />

      <HeroSection />

      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <Separator className="bg-border/60" />
      </div>

      <section className="mx-auto max-w-3xl px-4 py-10 text-center md:py-16">
        <h2 className="mb-4 text-lg font-medium tracking-wide text-foreground md:text-xl">
          冬の山奥で生まれる、特別な氷
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          白熊堂のかき氷には、天然氷を使用しています。
        </p>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
          天然氷とは、冬の厳しい寒さのなかで、山の湧水をじっくりと時間をかけて凍らせた氷のこと。機械で急速に作られる氷とはまったく異なる、自然の力だけが生み出す特別な氷です。
        </p>
        <Link
          href="/about-ice"
          className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground md:text-base"
        >
          天然氷について →
        </Link>
      </section>

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
