/**
 * 商品データ取得ユーティリティ (lib/products.ts)
 *
 * データベースから商品とカテゴリーを取得し、フロントエンド用に加工します。
 *
 * 主な機能:
 * - 公開状態の商品をカテゴリー別に取得
 * - Prisma の Decimal 型を JavaScript の number 型に変換
 * - 商品の公開状態を判定（日時ベース or フラグベース）
 *
 * 使用箇所:
 * - app/page.tsx（トップページ）
 * - API ルート（商品一覧取得）
 *
 * ベストプラクティス:
 * - Promise.all で並列実行してパフォーマンスを最適化
 * - 型安全性を確保（Type Guard を使用）
 * - エラーハンドリングを統一
 */
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { calculatePublishedStatus } from "@/lib/product-utils";
import type { Category, Product } from "@/app/types";
import { Prisma } from "@prisma/client";

/**
 * カテゴリーと商品の組み合わせを表す型
 *
 * 理由: フロントエンドでカテゴリー別にタブ表示するため、
 * カテゴリーと商品をセットで扱う必要がある
 */
export type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

/**
 * Prisma.Decimal型の価格をnumber型に変換する
 *
 * 理由: Prisma は PostgreSQL の DECIMAL 型を Prisma.Decimal オブジェクトとして返すが、
 * フロントエンドでは単純な number 型の方が扱いやすいため変換する
 *
 * @param price - 変換する価格（Prisma.Decimal | null | undefined）
 * @returns 変換後の価格（number | null）。変換できない場合は null
 *
 * 注意点:
 * - NaN チェックを行い、変換失敗時は null を返す
 * - null と undefined の両方を許容（データベースで価格が未設定の場合）
 */
function convertPrice(price: Prisma.Decimal | null | undefined): number | null {
  if (price === null || price === undefined) {
    return null;
  }
  const num = Number(price);
  // NaN チェック: 変換に失敗した場合は null を返す
  return isNaN(num) ? null : num;
}

/**
 * 公開されている商品をカテゴリーごとに取得する
 *
 * データベースからカテゴリーと商品を取得し、公開状態を判定して
 * カテゴリーごとにグループ化した結果を返します。
 * 公開状態の判定は以下の優先順位で行われます:
 * 1. publishedAt/endedAtが設定されている場合: calculatePublishedStatusで判定
 * 2. それ以外: publishedフィールドの値を使用
 *
 * @returns カテゴリーごとにグループ化された公開商品の配列
 * @throws データベースエラーが発生した場合
 */
export async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  try {
    // Promise.all で並列実行してパフォーマンスを最適化
    // 理由: カテゴリーと商品の取得は独立した操作のため、並列実行可能
    // トレードオフ: 片方が失敗すると両方失敗するが、両方必要なデータなので問題ない
    const [categoriesList, productsList] = await Promise.all([
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: {
              id: "asc", // ID の昇順でカテゴリーを取得（登録順）
            },
          }),
        "getPublishedProductsByCategory - categories"
      ),
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: {
              category: true, // リレーション先のカテゴリー情報も取得
            },
            orderBy: [
              {
                // displayOrder で並び替え（null は最後）
                // 理由: 管理画面でドラッグ&ドロップで並び替えた順序を反映
                displayOrder: {
                  sort: "asc",
                  nulls: "last", // displayOrder が未設定の商品は最後に表示
                },
              },
            ],
          }),
        "getPublishedProductsByCategory - products"
      ),
    ]);

    // 早期リターン: データがない場合は空配列を返す
    if (!categoriesList || categoriesList.length === 0) {
      return [];
    }

    if (!productsList || productsList.length === 0) {
      return [];
    }

    // 公開状態の商品のみをフィルタリング
    // Type Guard を使用して、category が存在することを TypeScript に保証
    const publishedProducts = productsList.filter(
      (
        product
      ): product is typeof product & {
        category: NonNullable<typeof product.category>;
      } => {
        // カテゴリーが関連付けられていない商品は除外
        if (!product.category) {
          return false;
        }

        // 公開状態の判定ロジック（優先順位付き）
        // 1. publishedAt/endedAt が設定されている場合: 日時ベースで判定
        // 2. それ以外: published フラグで判定
        // 理由: 期間限定商品（季節商品など）に対応するため
        if (product.publishedAt || product.endedAt) {
          return calculatePublishedStatus(
            product.publishedAt,
            product.endedAt
          );
        }
        return product.published;
      }
    );

    // カテゴリーの順序を保持（後でこの順序通りに結果を組み立てる）
    const categoryOrder = categoriesList.map((c) => c.name);

    // Map を使ってカテゴリー名ごとに商品をグループ化
    // 理由: O(1) でカテゴリーにアクセスできるため効率的
    const grouped = new Map<string, typeof publishedProducts>();

    for (const product of publishedProducts) {
      const categoryName = product.category.name;
      const existing = grouped.get(categoryName);
      if (existing) {
        // 既存のカテゴリーに商品を追加
        existing.push(product);
      } else {
        // 新しいカテゴリーを作成
        grouped.set(categoryName, [product]);
      }
    }

    // カテゴリーの順序を保ちながら結果を組み立てる
    // 理由: フロントエンドでタブの順序を制御するため
    const result: CategoryWithProducts[] = [];

    for (const categoryName of categoryOrder) {
      const categoryProducts = grouped.get(categoryName);
      // 商品がないカテゴリーはスキップ（空のタブを表示しない）
      if (!categoryProducts || categoryProducts.length === 0) {
        continue;
      }

      const category = categoriesList.find((c) => c.name === categoryName);
      if (!category) {
        continue;
      }

      // Prisma の型からフロントエンド用の型に変換
      // 理由: フロントエンドでは不要なフィールド（createdAt など）を除外
      const convertedCategory: Category = {
        id: category.id,
        name: category.name,
      };

      // 商品データを変換（特に Decimal 型の価格を number に変換）
      const convertedProducts: Product[] = categoryProducts.map(
        (product): Product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          priceS: convertPrice(product.priceS), // Decimal → number
          priceL: convertPrice(product.priceL), // Decimal → number
        })
      );

      result.push({
        category: convertedCategory,
        products: convertedProducts,
      });
    }

    return result;
  } catch (error) {
    log.error("公開商品の取得に失敗しました", {
      context: "getPublishedProductsByCategory",
      error,
    });
    throw error;
  }
}
