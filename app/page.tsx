import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { calculatePublishedStatus } from "@/lib/product-utils";
import ProductGrid from "./components/ProductGrid";
import Header from "./components/Header";
import Footer from "./components/Footer";

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = "force-dynamic";

/**
 * 公開商品をカテゴリーごとに取得する関数
 *
 * データベースからカテゴリーと商品を取得し、公開商品のみをフィルタリングして
 * カテゴリーごとにグループ化します。
 *
 * 公開状態の判定ロジック：
 * - 公開日・終了日が設定されている場合: `calculatePublishedStatus()`で自動判定
 * - 公開日・終了日が設定されていない場合: `published`フィールドの値を使用
 *
 * @returns カテゴリーごとにグループ化された公開商品（商品がないカテゴリーは除外）
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
        category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
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

  // カテゴリーの順序に従って返す（Decimal型をNumber型に変換、商品があるカテゴリーのみ）
  return categoryOrder
    .map((categoryName) => ({
    category: categories.find((c) => c.name === categoryName)!,
      products: (grouped[categoryName] || []).map((product) => ({
        ...product,
        // Decimal型をNumber型に変換（PrismaのDecimal型は文字列として扱われるため）
        priceS: product.priceS ? Number(product.priceS) : null,
        priceL: product.priceL ? Number(product.priceL) : null,
      })),
    }))
    .filter(({ products }) => products.length > 0); // 商品があるカテゴリーのみを返す
}

/**
 * ホームページのメインコンポーネント
 *
 * カテゴリーごとに公開されている商品を表示します。
 *
 * Server Component として実装されており、サーバーサイドでデータを取得します。
 * データベースから最新の公開商品を取得し、カテゴリーごとにグループ化して表示します。
 *
 * レイアウト構成：
 * - ヘッダー: ロゴ、Instagramリンク、ナビゲーション
 * - ヒーローバナー: メイン画像
 * - メインコンテンツ: カテゴリーごとの商品グリッド
 * - フッター: 店舗情報、地図、連絡先
 */
export default async function Home() {
  // カテゴリーごとにグループ化された公開商品を取得
  const categoriesWithProducts = await getPublishedProductsByCategory();

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[30vh] min-h-[200px] w-full overflow-hidden md:h-[50vh] md:min-h-[400px] lg:h-[60vh] lg:min-h-[500px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/8 to-white/25" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:py-20">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.map(({ category, products }) => (
          <ProductGrid
            key={category.id}
            category={category}
            products={products}
          />
        ))}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
