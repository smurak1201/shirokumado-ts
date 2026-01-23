import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import DashboardContent from "./components/DashboardContent";
import type { Category, Product } from "./types";

export const dynamic = "force-dynamic";

/**
 * ダッシュボードに表示するデータを取得する関数
 *
 * カテゴリー一覧と商品一覧を並列で取得します。
 * エラーが発生した場合はログに記録してからエラーを再スローします。
 */
async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    const [categoriesList, productsList] = await Promise.all([
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: {
              id: "asc",
            },
          }),
        "getDashboardData - categories"
      ),
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: {
              category: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
        "getDashboardData - products"
      ),
    ]);

    const categories: Category[] = categoriesList || [];
    const products: Product[] = (productsList || [])
      .filter((product) => product.category !== null)
      .map((product) => {
        if (!product.category) {
          throw new Error(`Product ${product.id} has no category`);
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          priceS: product.priceS ? Number(product.priceS) : null,
          priceL: product.priceL ? Number(product.priceL) : null,
          category: {
            id: product.category.id,
            name: product.category.name,
          },
          published: product.published,
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
    log.error("ダッシュボードデータの取得に失敗しました", {
      context: "getDashboardData",
      error,
    });
    throw error;
  }
}

/**
 * ダッシュボードページコンポーネント
 *
 * 商品管理ダッシュボードのメインページです。
 * サーバーサイドでデータを取得し、DashboardContentコンポーネントに渡します。
 */
export default async function DashboardPage() {
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    const data = await getDashboardData();
    categories = data.categories;
    products = data.products;
  } catch {
    // getDashboardData内でエラーログは記録済み
    // error.tsxでエラーUIが表示される
    categories = [];
    products = [];
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
