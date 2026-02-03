/**
 * トップページ
 *
 * Suspenseを使用して、データ取得中はローディング画面を表示。
 * HomeContentでPromise.allを使い、最低1秒のローディング時間を保証。
 */
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
