import Header from "../components/Header";
import Footer from "../components/Footer";
import FAQSection from "../components/FAQSection";
import { faqs } from "./data";

/**
 * FAQページのメインコンポーネント
 *
 * よくある質問と回答をアコーディオン形式で一覧表示します。
 *
 * Server Component として実装されており、静的なコンテンツを表示します。
 * 質問と回答のデータは `data.ts` から取得します。
 *
 * レイアウト構成：
 * - ヘッダー: ロゴ、Instagramリンク、ナビゲーション
 * - メインコンテンツ: FAQ一覧（アコーディオン形式、アニメーション付き）
 * - フッター: 店舗情報、地図、連絡先
 */
export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-20" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        {/* FAQ一覧（アニメーション付き） */}
        <FAQSection faqs={faqs} showTitle={true} />
      </main>

      <Footer />
    </div>
  );
}
