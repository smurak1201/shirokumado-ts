/**
 * デバッグ用ページ: データベースから取得したデータを表示
 * 本番環境では削除するか、認証を追加してください
 */

import { db, safeDbOperation } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugDataPage() {
  try {
    const [categories, products] = await Promise.all([
      safeDbOperation(
        () =>
          db.query.categories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.id)],
          }),
        "debug - categories"
      ),
      safeDbOperation(
        () =>
          db.query.products.findMany({
            with: {
              category: true,
            },
          }),
        "debug - products"
      ),
    ]);

    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="mb-8 text-3xl font-bold">デバッグ: データベース内容</h1>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">カテゴリー ({categories.length})</h2>
          <ul className="list-disc pl-6">
            {categories.map((cat) => (
              <li key={cat.id}>
                ID: {cat.id}, 名前: {cat.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">商品 ({products.length})</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border-b pb-4">
                <p>
                  <strong>ID:</strong> {product.id}
                </p>
                <p>
                  <strong>名前:</strong> {product.name}
                </p>
                <p>
                  <strong>公開状態:</strong> {product.published ? "公開" : "非公開"}
                </p>
                <p>
                  <strong>公開日:</strong> {product.publishedAt?.toISOString() || "未設定"}
                </p>
                <p>
                  <strong>終了日:</strong> {product.endedAt?.toISOString() || "未設定"}
                </p>
                <p>
                  <strong>カテゴリー:</strong> {product.category ? product.category.name : "なし"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <h1 className="mb-4 text-3xl font-bold text-red-800">エラーが発生しました</h1>
        <pre className="rounded bg-red-100 p-4 text-red-900">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
