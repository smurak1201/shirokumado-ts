/**
 * 天然氷紹介ページ
 *
 * 白熊堂が使用する天然氷のこだわりやストーリーを伝えるページ。
 */
import type { Metadata } from "next";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import AboutIceContent from "./AboutIceContent";

export const metadata: Metadata = {
  title: "天然氷について",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  openGraph: {
    title: "天然氷について | 白熊堂",
    description:
      "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
  },
};

const baseUrl = process.env.SITE_URL!;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "天然氷について",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  author: {
    "@type": "Organization",
    name: "白熊堂",
  },
  publisher: {
    "@type": "Organization",
    name: "白熊堂",
    url: baseUrl,
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${baseUrl}/about-ice`,
  },
};

export default function AboutIcePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <FixedHeader />
      {/* position:fixed のヘッダーに対応するスペーサー */}
      <div style={{ height: "var(--header-height)" }} />
      <AboutIceContent />
      <Footer />
    </div>
  );
}
