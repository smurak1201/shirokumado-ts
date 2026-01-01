import { prisma } from "@/lib/prisma";
import DashboardContent from "./components/DashboardContent";

// 動的レンダリングを強制（データベース接続が必要なため）
export const dynamic = "force-dynamic";

// データをサーバーサイドで取得（Server Component）
async function getDashboardData() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    categories,
    products: products.map((product) => ({
      ...product,
      priceS: product.priceS ? Number(product.priceS) : null,
      priceL: product.priceL ? Number(product.priceL) : null,
      publishedAt: product.publishedAt?.toISOString() || null,
      endedAt: product.endedAt?.toISOString() || null,
      published: product.published,
    })),
  };
}

export default async function DashboardPage() {
  const { categories, products } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        <DashboardContent
          categories={categories}
          initialProducts={products}
        />
      </div>
    </div>
  );
}
