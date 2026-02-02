/**
 * FAQページ
 *
 * よくある質問と回答をアコーディオン形式で表示。
 * データは app/(public)/faq/data.ts から取得。
 */
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import FAQSection from "@/app/components/FAQSection";
import { faqs } from "./data";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixedHeader />

      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div className="h-20" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <FAQSection faqs={faqs} showTitle={true} />
      </main>

      <Footer />
    </div>
  );
}
