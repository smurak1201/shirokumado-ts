/**
 * トップページ
 *
 * Suspenseを使用して、データ取得中はローディング画面を表示。
 * HomeContentでPromise.allを使い、最低1秒のローディング時間を保証。
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
};

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
