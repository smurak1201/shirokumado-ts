import { prisma, safePrismaOperation } from "@/lib/prisma";
import DashboardContent from "./components/DashboardContent";
import type { Category, Product } from "./types";

/**
 * 動的レンダリングを強制
 *
 * 理由:
 * 1. 商品情報の頻繁な更新: ダッシュボードでは商品情報を頻繁に更新する可能性があり、
 *    常に最新のデータを表示する必要がある
 * 2. データベースから最新のデータを取得: データベースから常に最新のデータを取得する必要がある
 * 3. 公開状態の確認: 公開日・終了日に基づく公開状態を正確に表示する必要がある
 */
export const dynamic = "force-dynamic";

/**
 * ダッシュボードに必要なデータをサーバーサイドで取得
 * Server Component なので、データベースに直接アクセスできます
 *
 * @returns カテゴリー一覧と商品一覧を含むオブジェクト
 */
async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    // カテゴリーと商品を並列で取得（パフォーマンス向上）
    const [categoriesList, productsList] = await Promise.all([
      // カテゴリーをID順で取得
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: {
              id: "asc",
            },
          }),
        "getDashboardData - categories"
      ),
      // 商品をカテゴリー情報を含めて取得（N+1問題を回避）
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: {
              category: true, // 関連するカテゴリー情報も一緒に取得
            },
            orderBy: {
              createdAt: "desc", // 作成日時の降順でソート
            },
          }),
        "getDashboardData - products"
      ),
    ]);

    // データが存在しない場合は空配列を返す
    const categories: Category[] = categoriesList || [];
    const products: Product[] = (productsList || [])
      .filter((product) => product.category !== null) // カテゴリーが存在する商品のみ
      .map((product) => {
        // カテゴリーが存在することを確認
        if (!product.category) {
          throw new Error(`Product ${product.id} has no category`);
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          // Decimal型をNumber型に変換
          priceS: product.priceS ? Number(product.priceS) : null,
          priceL: product.priceL ? Number(product.priceL) : null,
          category: {
            id: product.category.id,
            name: product.category.name,
          },
          published: product.published,
          // Date型をISO文字列に変換（JSONシリアライズのため）
          publishedAt: product.publishedAt?.toISOString() || null,
          endedAt: product.endedAt?.toISOString() || null,
          displayOrder: product.displayOrder,
        };
      });

    return {
      categories,
      products,
    };
  } catch (error) {
    // エラーが発生した場合はログを記録してから再スロー
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

/**
 * ダッシュボードページのメインコンポーネント
 * Server Component として実装されており、データフェッチをサーバー側で実行します
 */
export default async function DashboardPage() {
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    const data = await getDashboardData();
    categories = data.categories;
    products = data.products;
  } catch (error) {
    // エラーが発生した場合は空配列を使用（error.tsxでエラーUIが表示される）
    // エラーログはgetDashboardData内で記録される
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        <DashboardContent categories={categories} initialProducts={products} />
      </div>
    </div>
  );
}
