/**
 * トップページ
 *
 * 初回表示時に1秒間ローディング画面を表示してからコンテンツを表示。
 * HomePageWrapperでクライアント側のローディング制御を行う。
 */
import HomeContent from "./HomeContent";
import HomePageWrapper from "./HomePageWrapper";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HomePageWrapper>
      <HomeContent />
    </HomePageWrapper>
  );
}
