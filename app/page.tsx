import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { calculatePublishedStatus } from "@/lib/product-utils";
import ProductGrid from "./components/ProductGrid";
import Header from "./components/Header";

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = "force-dynamic";

/**
 * 公開商品をカテゴリーごとに取得する関数
 *
 * @returns カテゴリーごとにグループ化された公開商品
 */
async function getPublishedProductsByCategory() {
  // カテゴリーと商品を並列で取得（パフォーマンス向上）
  const [categories, products] = await Promise.all([
    // カテゴリーをID順で取得
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
    // 商品をカテゴリー情報を含めて取得
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        displayOrder: {
          sort: "asc",
          nulls: "last", // displayOrderがnullの商品は最後に
        },
      },
    }),
  ]);

  // 公開商品のみをフィルタリング
  const publishedProducts = products.filter((product) => {
    // 公開日・終了日が設定されている場合は自動判定
    if (product.publishedAt || product.endedAt) {
      return calculatePublishedStatus(
        product.publishedAt, // Prismaから取得したDateオブジェクトをそのまま渡す
        product.endedAt // Prismaから取得したDateオブジェクトをそのまま渡す
      );
    }
    // 公開日・終了日が設定されていない場合は手動設定値を使用
    return product.published;
  });

  // カテゴリーごとにグループ化
  const categoryOrder = categories.map((c) => c.name);
  const grouped: Record<string, typeof publishedProducts> = {};

  publishedProducts.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  // カテゴリーの順序に従って返す（Decimal型をNumber型に変換）
  return categoryOrder.map((categoryName) => ({
    category: categories.find((c) => c.name === categoryName)!,
    products: (grouped[categoryName] || []).map((product) => ({
      ...product,
      // Decimal型をNumber型に変換（PrismaのDecimal型は文字列として扱われるため）
      priceS: product.priceS ? Number(product.priceS) : null,
      priceL: product.priceL ? Number(product.priceL) : null,
    })),
  }));
}

/**
 * ホームページのメインコンポーネント
 *
 * 白基調の和のテイストでクールなデザインのページを表示します。
 * カテゴリーごとに公開されている商品を表示します。
 */
export default async function Home() {
  const categoriesWithProducts = await getPublishedProductsByCategory();

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[30vh] min-h-[200px] w-full overflow-hidden md:h-[40vh] md:min-h-[300px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ（和のテイストのためのグラデーション） */}
        <div className="absolute inset-0 bg-linear-to-b from-white/30 via-white/10 to-white/40" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-2 py-6 md:px-4 md:py-12 lg:px-6 lg:py-16 xl:py-20">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.map(({ category, products }) => (
          <ProductGrid
            key={category.id}
            category={category}
            products={products}
          />
        ))}

        {/* 商品がない場合のメッセージ */}
        {categoriesWithProducts.every(
          ({ products }) => products.length === 0
        ) && (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-500">
              現在公開されている商品はありません
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>© 2024 白熊堂</p>
        </div>
      </footer>
    </div>
  );
}
