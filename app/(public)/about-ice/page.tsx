/**
 * 天然氷紹介ページ
 *
 * 白熊堂が使用する天然氷のこだわりやストーリーを伝えるページ。
 * コンテンツデータは data.ts から取得。
 */
import type { Metadata } from "next";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import AboutIceContent from "./AboutIceContent";

export const metadata: Metadata = {
  title: "天然氷について | 白熊堂",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  openGraph: {
    title: "天然氷について | 白熊堂",
    description:
      "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
  },
};

export default function AboutIcePage() {
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
        <AboutIceContent />
      </main>

      <Footer />
    </div>
  );
}
