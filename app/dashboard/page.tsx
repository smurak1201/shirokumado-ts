import { prisma } from "@/lib/prisma";
import DashboardFormWrapper from "./components/DashboardFormWrapper";
import ProductList from "./components/ProductList";

// 動的レンダリングを強制（データベース接続が必要なため）
export const dynamic = "force-dynamic";

// データをサーバーサイドで取得（Server Component）
async function getDashboardData() {
  const [categories, tags, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.product.findMany({
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    categories,
    tags,
    products: products.map((product) => ({
      ...product,
      priceS: product.priceS ? Number(product.priceS) : null,
      priceL: product.priceL ? Number(product.priceL) : null,
      publishedAt: product.publishedAt?.toISOString() || null,
      endedAt: product.endedAt?.toISOString() || null,
    })),
  };
}

export default async function DashboardPage() {
  const { categories, tags, products } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        <DashboardFormWrapper categories={categories} tags={tags} />
        <ProductList
          initialProducts={products}
          categories={categories}
          tags={tags}
        />
      </div>
    </div>
  );
}
