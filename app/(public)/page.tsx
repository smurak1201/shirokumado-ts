/**
 * トップページ
 *
 * 公開中の商品をカテゴリー別に表示するメインページ。
 * Suspenseを使用してストリーミングレンダリングを実現し、
 * 初回アクセス時もローディング画面を表示する。
 */
import { Suspense } from "react";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import { Separator } from "@/app/components/ui/separator";
import HomeContent from "./components/HomeContent";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

/**
 * 商品セクションのローディングUI
 *
 * Suspense境界のfallbackとして使用。
 * loading.tsxと同様のデザインで、商品読み込み中に表示。
 */
function ProductsLoading(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* ロゴ・店名 */}
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-widest text-primary">
            白熊堂
          </h1>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground">
            SHIROKUMADO
          </p>
        </div>

        {/* ドットスピナー */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
        </div>

        {/* テキスト */}
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}

export default function Home(): React.ReactElement {
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
        {/*
         * Suspenseを使用してストリーミングレンダリングを実現
         * 初回アクセス時: サーバーがこの部分までのHTMLを即座に送信し、
         * HomeContentの取得完了後に商品部分をストリーミング
         * → ユーザーは待機中にローディングUIを見る
         */}
        <Suspense fallback={<ProductsLoading />}>
          <HomeContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
