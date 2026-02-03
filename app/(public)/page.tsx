/**
 * トップページ
 *
 * 公開中の商品をカテゴリー別に表示するメインページ。
 * Suspenseを使用してストリーミングレンダリングを実現し、
 * 初回アクセス時もフルスクリーンのローディング画面を表示する。
 */
import { Suspense } from "react";
import HomeContent from "./components/HomeContent";
import LoadingSpinner from "./components/LoadingSpinner";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home(): React.ReactElement {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}
