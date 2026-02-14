/**
 * 天然氷紹介ページ
 *
 * 白熊堂が使用する天然氷のこだわりやストーリーを伝えるページ。
 * フルスクリーンヒーローとフルブリード画像で没入感のある構成。
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
      <AboutIceContent />
      <Footer />
    </div>
  );
}
