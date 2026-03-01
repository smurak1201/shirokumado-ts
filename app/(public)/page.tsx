/**
 * トップページ
 *
 * ISR + オンデマンド再検証でキャッシュを管理。
 * キャッシュミス時はSuspenseのfallbackでローディング画面を表示。
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: {
    absolute: "白熊堂 | 本格かき氷のお店",
  },
  description:
    "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    type: "website",
    url: BASE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "白熊堂 - 本格かき氷のお店",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
