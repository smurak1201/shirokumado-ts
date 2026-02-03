/**
 * ローディングページ
 *
 * (public)ルートグループ内のクライアントサイドナビゲーション時に表示。
 * LoadingScreenコンポーネントを再利用してDRYを維持。
 */
import LoadingScreen from "@/app/components/LoadingScreen";

export default function Loading() {
  return <LoadingScreen />;
}
