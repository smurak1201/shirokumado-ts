/**
 * ホームページのメインコンテンツ
 *
 * 商品データを取得し、カテゴリータブで表示するServer Component。
 * Suspense境界内で使用されることを想定しており、
 * データ取得中は親コンポーネントのfallbackが表示される。
 */
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import { log } from "@/lib/logger";

// ローディング画面の最低表示時間（ms）
// 短すぎるとチラつきになるため、安定した表示時間を確保
const MIN_LOADING_TIME_MS = 1000;

export default async function HomeContent(): Promise<React.ReactElement> {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    // データ取得と最低表示時間を並列で待機
    // データ取得が1000ms以上かかれば追加の遅延なし
    const [data] = await Promise.all([
      getPublishedProductsByCategory(),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS)),
    ]);
    categoriesWithProducts = data;
  } catch (error) {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認
    log.error("商品データの取得に失敗しました", {
      context: "HomeContent",
      error,
    });
    categoriesWithProducts = [];
  }

  return <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />;
}
