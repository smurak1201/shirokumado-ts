import { db, categories, products } from "@/lib/db";
import { asc, desc } from "drizzle-orm";
import DashboardContent from "./components/DashboardContent";

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、
 * このページは常にサーバー側でレンダリングされます
 */
export const dynamic = "force-dynamic";

/**
 * ダッシュボードに必要なデータをサーバーサイドで取得
 * Server Component なので、データベースに直接アクセスできます
 *
 * @returns カテゴリー一覧と商品一覧を含むオブジェクト
 */
async function getDashboardData() {
  // カテゴリーと商品を並列で取得（パフォーマンス向上）
  const [categoriesList, productsList] = await Promise.all([
    // カテゴリーをID順で取得
    db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.id)],
    }),
    // 商品をカテゴリー情報を含めて取得（N+1問題を回避）
    db.query.products.findMany({
      with: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)], // 作成日時の降順でソート
    }),
  ]);

  return {
    categories: categoriesList,
    // 商品データをクライアント側で使いやすい形式に変換
    products: productsList.map((product) => ({
      ...product,
      // Decimal型をNumber型に変換（DrizzleのDecimal型は文字列として扱われるため）
      priceS: product.priceS ? Number(product.priceS) : null,
      priceL: product.priceL ? Number(product.priceL) : null,
      // Date型をISO文字列に変換（JSONシリアライズのため）
      publishedAt: product.publishedAt?.toISOString() || null,
      endedAt: product.endedAt?.toISOString() || null,
      published: product.published,
      displayOrder: product.displayOrder,
    })),
  };
}

/**
 * ダッシュボードページのメインコンポーネント
 * Server Component として実装されており、データフェッチをサーバー側で実行します
 */
export default async function DashboardPage() {
  const { categories, products } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        <DashboardContent categories={categories} initialProducts={products} />
      </div>
    </div>
  );
}
