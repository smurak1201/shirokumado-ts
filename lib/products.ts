/**
 * 商品データ取得ユーティリティ
 *
 * データベースから商品とカテゴリーを取得し、フロントエンド用に加工
 */

import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { calculatePublishedStatus } from "@/lib/product-utils";
import type { Category, Product } from "@/app/types";
import { Prisma } from "@prisma/client";

export type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

/**
 * Prisma.Decimal型をnumber型に変換
 */
function convertPrice(price: Prisma.Decimal | null | undefined): number | null {
  if (price === null || price === undefined) {
    return null;
  }
  const num = Number(price);
  return isNaN(num) ? null : num;
}

/**
 * 公開商品をカテゴリーごとに取得
 *
 * Promise.allで並列実行してパフォーマンスを最適化
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

    // 公開状態の商品のみをフィルタリング
    const publishedProducts = productsList.filter(
      (
        product
      ): product is typeof product & {
        category: NonNullable<typeof product.category>;
      } => {
        if (!product.category) {
          return false;
        }

        // 日付範囲が設定されている場合は自動判定、それ以外はフラグで判定
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
          priceS: convertPrice(product.priceS),
          priceL: convertPrice(product.priceL),
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
