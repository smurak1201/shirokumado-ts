/**
 * トップページ
 *
 * Suspenseを使用して初回ロード/リロード時にもローディング画面を表示。
 * データ取得はHomeContentコンポーネントで行う。
 */
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
