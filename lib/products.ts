import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { calculatePublishedStatus } from "@/lib/product-utils";
import type { Category, Product } from "@/app/types";
import { Prisma } from "@prisma/client";

/**
 * カテゴリーと商品の組み合わせを表す型
 */
export type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

/**
 * Prisma.Decimal型の価格をnumber型に変換する
 *
 * @param price - 変換する価格（Prisma.Decimal | null | undefined）
 * @returns 変換後の価格（number | null）
 */
function _convertPrice(price: Prisma.Decimal | null | undefined): number | null {
  if (price === null || price === undefined) {
    return null;
  }
  const num = Number(price);
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
    const [categoriesList, productsList] = await Promise.all([
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: {
              id: "asc",
            },
          }),
        "getPublishedProductsByCategory - categories"
      ),
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: {
              category: true,
            },
            orderBy: [
              {
                displayOrder: {
                  sort: "asc",
                  nulls: "last",
                },
              },
            ],
          }),
        "getPublishedProductsByCategory - products"
      ),
    ]);

    if (!categoriesList || categoriesList.length === 0) {
      return [];
    }

    if (!productsList || productsList.length === 0) {
      return [];
    }

    const publishedProducts = productsList.filter(
      (
        product
      ): product is typeof product & {
        category: NonNullable<typeof product.category>;
      } => {
        if (!product.category) {
          return false;
        }

        if (product.publishedAt || product.endedAt) {
          return calculatePublishedStatus(
            product.publishedAt,
            product.endedAt
          );
        }
        return product.published;
      }
    );

    const categoryOrder = categoriesList.map((c) => c.name);
    const grouped = new Map<string, typeof publishedProducts>();

    for (const product of publishedProducts) {
      const categoryName = product.category.name;
      const existing = grouped.get(categoryName);
      if (existing) {
        existing.push(product);
      } else {
        grouped.set(categoryName, [product]);
      }
    }

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
          priceS: _convertPrice(product.priceS),
          priceL: _convertPrice(product.priceL),
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
