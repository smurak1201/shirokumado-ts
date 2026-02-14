/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * Promise.allでデータ取得と最低表示時間を並列で待機し、
 * 最低1秒のローディング表示を保証する。
 */
import Link from "next/link";
import Image from "next/image";
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
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

      {/* 天然氷紹介: 背景画像 + テキストオーバーレイ */}
      <Link href="/about-ice" className="group relative block h-[35svh] w-full md:h-[45vh] lg:h-[50vh]">
        <Image
          src="/S__3301389.jpg"
          alt="透き通った天然氷のブロック"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 transition-colors duration-500 group-hover:bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center drop-shadow-lg">
          <h2 className="mb-3 text-lg font-light tracking-widest text-white md:mb-4 md:text-2xl lg:text-3xl">
            冬の山奥で生まれる、特別な氷
          </h2>
          <p className="mb-6 max-w-lg text-xs leading-relaxed text-white/90 md:mb-8 md:text-sm lg:text-base">
            天然氷とは、冬の厳しい寒さのなかで、山の湧水をじっくりと時間をかけて凍らせた氷のこと。機械で急速に作られる氷とはまったく異なる、自然の力だけが生み出す特別な氷です。
          </p>
          <span className="border-b border-white/60 pb-0.5 text-xs font-medium tracking-wider text-white transition-colors group-hover:border-white md:text-sm">
            天然氷について →
          </span>
        </div>
      </Link>

      <main className="mx-auto max-w-7xl px-2 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20 overflow-x-hidden">
        <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
      </main>

      <Footer />
    </div>
  );
}
