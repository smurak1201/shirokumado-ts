import Image from "next/image";
import { db, safeDbOperation } from "@/lib/db";
import { calculatePublishedStatus } from "@/lib/product-utils";
import ProductGrid from "./components/ProductGrid";
import Header from "./components/Header";
import Footer from "./components/Footer";
import type { Category, Product } from "./types";

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = "force-dynamic";

/**
 * 価格を文字列から数値に変換するヘルパー関数
 * Drizzleのdecimal型は文字列として扱われるため、数値に変換します
 */
function convertPrice(price: string | null | undefined): number | null {
  if (price === null || price === undefined || price === "") {
    return null;
  }
  const num = Number(price);
  return isNaN(num) ? null : num;
}

/**
 * カテゴリーと商品のペアの型定義
 * ProductGridコンポーネントに渡すための型
 */
type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

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
async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  try {
    // カテゴリーと商品を並列で取得（パフォーマンス向上）
    const [categoriesList, productsList] = await Promise.all([
      // カテゴリーをID順で取得
      safeDbOperation(
        () =>
          db.query.categories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.id)],
          }),
        "getPublishedProductsByCategory - categories"
      ),
      // 商品をカテゴリー情報を含めて取得
      safeDbOperation(
        () =>
          db.query.products.findMany({
            with: {
              category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
            },
            orderBy: (products, { sql }) => [
              sql`${products.displayOrder} ASC NULLS LAST`, // displayOrderがnullの商品は最後に
            ],
          }),
        "getPublishedProductsByCategory - products"
      ),
    ]);

    // デバッグ用ログ（本番環境でも確認できるように）
    console.log("Categories fetched:", categoriesList?.length || 0);
    console.log("Products fetched:", productsList?.length || 0);

    // データが存在しない場合は空配列を返す
    if (!categoriesList || categoriesList.length === 0) {
      console.warn("No categories found in database");
      return [];
    }

    if (!productsList || productsList.length === 0) {
      console.warn("No products found in database");
      return [];
    }

    // 公開商品のみをフィルタリング（カテゴリーが存在する商品のみ）
    // 型ガードを使用して型安全性を確保
    const publishedProducts = productsList.filter(
      (
        product
      ): product is typeof product & {
        category: NonNullable<typeof product.category>;
      } => {
        // カテゴリーが存在しない商品は除外
        if (!product.category) {
          console.warn(
            `Product ${product.id} (${product.name}) has no category`
          );
          return false;
        }

        // 公開日・終了日が設定されている場合は自動判定
        if (product.publishedAt || product.endedAt) {
          const isPublished = calculatePublishedStatus(
            product.publishedAt, // Drizzleから取得したDateオブジェクトをそのまま渡す
            product.endedAt // Drizzleから取得したDateオブジェクトをそのまま渡す
          );
          if (!isPublished) {
            console.log(
              `Product ${product.id} (${product.name}) is not published due to date range`
            );
          }
          return isPublished;
        }
        // 公開日・終了日が設定されていない場合は手動設定値を使用
        if (!product.published) {
          console.log(
            `Product ${product.id} (${product.name}) is not published (published=false)`
          );
        }
        return product.published;
      }
    );

    console.log(
      "Published products after filtering:",
      publishedProducts.length
    );

    // カテゴリーごとにグループ化（Mapを使用してパフォーマンス向上）
    const categoryOrder = categoriesList.map((c) => c.name);
    const grouped = new Map<string, typeof publishedProducts>();

    for (const product of publishedProducts) {
      // 型ガードにより、categoryは必ず存在することが保証されている
      const categoryName = product.category.name;
      const existing = grouped.get(categoryName);
      if (existing) {
        existing.push(product);
      } else {
        grouped.set(categoryName, [product]);
      }
    }

    // カテゴリーの順序に従って返す（Decimal型をNumber型に変換、商品があるカテゴリーのみ）
    const result: CategoryWithProducts[] = [];

    for (const categoryName of categoryOrder) {
      const categoryProducts = grouped.get(categoryName);
      if (!categoryProducts || categoryProducts.length === 0) {
        continue;
      }

      const category = categoriesList.find((c) => c.name === categoryName);
      if (!category) {
        continue;
      }

      // ProductGridに渡すために、型を変換する
      const convertedCategory: Category = {
        id: category.id,
        name: category.name,
      };

      const convertedProducts: Product[] = categoryProducts.map(
        (product): Product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          // Decimal型をNumber型に変換（DrizzleのDecimal型は文字列として扱われるため）
          priceS: convertPrice(product.priceS),
          priceL: convertPrice(product.priceL),
        })
      );

      result.push({
        category: convertedCategory,
        products: convertedProducts,
      });
    }

    console.log("Final result categories:", result.length);
    return result;
  } catch (error) {
    // エラーが発生した場合は詳細なログを記録してから再スロー
    // Next.jsのerror.tsxでエラーハンドリングを行う
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error fetching published products:", {
      message: errorMessage,
      stack: errorStack,
      error,
      // エラーの詳細を確認するため、エラーオブジェクト全体をログに記録
      errorString: String(error),
    });

    // エラーを再スローしてNext.jsのエラーハンドリングに委譲
    throw error;
  }
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
  let categoriesWithProducts: CategoryWithProducts[];

  try {
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
    // エラーが発生した場合は空配列を使用（error.tsxでエラーUIが表示される）
    // ここでは空配列を設定して、ページがクラッシュしないようにする
    console.error("Failed to load products:", error);
    categoriesWithProducts = [];
  }

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
