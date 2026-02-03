/**
 * ローディングページ
 *
 * (public)ルートグループ内のページ遷移時に表示されるローディング状態。
 * LoadingSpinnerコンポーネントを使用してフルスクリーンのローディング画面を表示。
 */
import LoadingSpinner from "./components/LoadingSpinner";

export default function Loading(): React.ReactElement {
  return <LoadingSpinner />;
}
