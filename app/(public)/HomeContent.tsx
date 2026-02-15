/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * Promise.allでデータ取得と最低表示時間を並列で待機し、
 * 最低1.5秒のローディング表示を保証する。
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

// 設計判断: ローディング画面の最低表示時間（ms）
// 一瞬だけ表示されると逆に煩わしく、またDBのコールドスタートで
// 表示時間が安定しないため、あえて最低表示時間を設けている。
const MIN_LOADING_TIME_MS = 1500;

const BASE_URL = process.env.SITE_URL!;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "白熊堂",
  description: "川崎ラチッタデッラにある本格かき氷のお店",
  url: BASE_URL,
  telephone: "070-9157-3772",
  address: {
    "@type": "PostalAddress",
    streetAddress: "小川町4-1 ラチッタデッラ マッジョーレ1F",
    addressLocality: "川崎市川崎区",
    addressRegion: "神奈川県",
    postalCode: "210-0023",
    addressCountry: "JP",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "11:00",
    closes: "21:00",
  },
  servesCuisine: "かき氷",
  priceRange: "¥",
  image: `${BASE_URL}/og-image.png`,
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <FixedHeader />

      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div style={{ height: "var(--header-height)" }} />

      <HeroSection />

      <main>
        {/* 天然氷紹介: カード形式で白基調に馴染ませる */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16 lg:px-8">
          <Link
            href="/about-ice"
            className="group relative block h-[28svh] overflow-hidden rounded-xl shadow-md ring-1 ring-border/50 transition-shadow duration-500 hover:shadow-xl md:h-[35vh] lg:h-[40vh]"
          >
            <Image
              src="/S__3301389.jpg"
              alt="透き通った天然氷のブロック"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 1152px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center drop-shadow-lg md:gap-6">
              <h2 className="text-lg font-light tracking-widest text-white md:text-2xl lg:text-3xl">
                冬の山奥で生まれる、特別な氷
              </h2>
              <span className="border-b border-white/60 pb-0.5 text-xs font-medium tracking-wider text-white transition-colors group-hover:border-white md:text-sm">
                天然氷について →
              </span>
            </div>
          </Link>
        </section>

        <div className="mx-auto max-w-7xl px-2 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20 overflow-x-hidden">
          <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
