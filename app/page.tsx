/**
 * トップページ (app/page.tsx)
 *
 * アプリケーションのメインページで、公開中の商品をカテゴリー別に表示します。
 *
 * 主な機能:
 * - ヒーローバナーによる視覚的な訴求
 * - カテゴリー別タブによる商品の整理表示
 * - レスポンシブ対応のレイアウト（モバイルファースト）
 *
 * 実装の特性:
 * - Server Component（データベースから直接商品を取得）
 * - 動的レンダリング（force-dynamic）により常に最新データを表示
 *
 * 注意点:
 * - ヘッダーはposition:fixed のため、スペーサーが必要
 * - エラー時も空配列でレンダリングを継続（ユーザー体験を損なわない）
 */
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "./components/ProductCategoryTabs";
import FixedHeader from "./components/FixedHeader";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import { Separator } from "./components/ui/separator";
import { log } from "@/lib/logger";

/**
 * 動的レンダリングを強制
 * 理由: 商品データは頻繁に更新されるため、ビルド時の静的生成ではなく
 * リクエストごとに最新データを取得する必要がある
 */
export const dynamic = "force-dynamic";

/**
 * トップページコンポーネント
 *
 * 公開されている商品をカテゴリーごとに表示します。
 * ヒーローバナー、商品グリッド、フッターで構成されます。
 *
 * データ取得:
 * - Server Componentとして実装されているため、サーバー側でデータベースから直接取得
 * - エラー時は空配列を使用してレンダリングを継続（エラーページに遷移させない）
 */
export default async function Home() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    // データベースから公開中の商品をカテゴリーごとに取得
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
    // エラー時の挙動: ログ記録 + 空配列でレンダリング継続
    // 理由: データベース接続エラーでもページは表示したい（部分的なダウンタイムを許容）
    // トレードオフ: エラーの詳細をユーザーには通知しない（運用者のみログで確認）
    log.error("商品データの取得に失敗しました", {
      context: "Home",
      error,
    });
    categoriesWithProducts = [];
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/*
       * ヘッダー（position: fixedで画面上部に固定）
       * 理由: スクロール時も常に表示することで、ナビゲーションへのアクセスを確保
       */}
      <FixedHeader />

      {/*
       * ヘッダースペーサー
       * 必要な理由: ヘッダーはposition: fixedで固定されているため、通常のフローから外れる
       * このスペーサーがないと、下のコンテンツがヘッダーの裏に隠れてしまう
       *
       * CSS変数 --header-height（globals.cssで定義）を使用
       * 注意: この高さはHeroSectionのパララックス効果の計算にも使用される
       * （複数箇所で同じ値を使うため、CSS変数で一元管理）
       */}
      <div style={{ height: "var(--header-height)" }} />

      {/*
       * ヒーローバナー
       * 視覚的な第一印象を作り、ブランドイメージを伝える
       */}
      <HeroSection />

      {/*
       * ヒーローとコンテンツの区切り線
       * 理由: セクション間を視覚的に分離して、コンテンツの切り替わりを明確にする
       * bg-border/60: 透明度60%で柔らかい印象を維持
       */}
      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <Separator className="bg-border/60" />
      </div>

      {/*
       * メインコンテンツ
       * 商品カタログを表示する主要セクション
       * レスポンシブ対応: px-2 (モバイル) → px-6 (タブレット) → px-8 (デスクトップ)
       * overflow-x-hidden: タブコンポーネント内の横スクロールがページ全体に影響しないように
       */}
      <main className="mx-auto max-w-7xl px-2 py-8 md:px-6 md:py-20 lg:px-8 lg:py-24 overflow-x-hidden">
        {/*
         * カテゴリー別商品セクション
         * Tabsで切り替えることで、カテゴリーが多くてもページが長くなりすぎない
         * ユーザーは興味のあるカテゴリーだけを閲覧できる
         */}
        <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
      </main>

      {/*
       * フッター
       * サイト情報や連絡先を提供
       */}
      <Footer />
    </div>
  );
}
