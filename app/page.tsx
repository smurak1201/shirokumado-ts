import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { calculatePublishedStatus } from "@/lib/product-utils";

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

  // カテゴリーの順序に従って返す
  return categoryOrder.map((categoryName) => ({
    category: categories.find((c) => c.name === categoryName)!,
    products: grouped[categoryName] || [],
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
      {/* ヒーローセクション */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ（和のテイストのためのグラデーション） */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/40" />
        {/* ロゴとタイトル */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="mb-6 animate-fade-in">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={320}
              height={120}
              priority
              className="drop-shadow-2xl"
            />
          </div>
          <p className="text-center text-xl font-light tracking-wider text-gray-800 md:text-2xl">
            本格かき氷のお店
          </p>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.map(({ category, products }) => {
          // 商品がないカテゴリーは表示しない
          if (products.length === 0) return null;

          return (
            <section key={category.id} className="mb-16 md:mb-20">
              {/* カテゴリータイトル */}
              <div className="mb-10 border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-light tracking-widest text-gray-800 md:text-4xl">
                  {category.name}
                </h2>
              </div>

              {/* 商品グリッド */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
                  >
                    {/* 商品画像 */}
                    {product.imageUrl ? (
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* ホバー時のオーバーレイ */}
                        <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100" />
                    )}

                    {/* 商品情報 */}
                    <div className="p-5 md:p-6">
                      {/* 商品名 */}
                      <h3 className="mb-3 text-lg font-medium leading-relaxed text-gray-800 md:text-xl">
                        {product.name}
                      </h3>

                      {/* 商品説明 */}
                      {product.description && (
                        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {product.description}
                        </p>
                      )}

                      {/* 価格 */}
                      {(product.priceS || product.priceL) && (
                        <div className="flex items-baseline gap-2 border-t border-gray-100 pt-4 text-gray-800">
                          {product.priceS && (
                            <span className="text-lg font-medium tracking-wide">
                              S: ¥{Number(product.priceS).toLocaleString()}
                            </span>
                          )}
                          {product.priceS && product.priceL && (
                            <span className="text-gray-300">/</span>
                          )}
                          {product.priceL && (
                            <span className="text-lg font-medium tracking-wide">
                              L: ¥{Number(product.priceL).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

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
