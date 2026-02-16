/**
 * ダッシュボードホームページ
 *
 * 商品一覧の表示、検索、編集、削除、並び替えを行う管理画面。
 * サーバー側でデータを取得し、Client Component へ渡す。
 */
import type { Metadata } from "next";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import DashboardContent from "./components/DashboardContent";
import type { Category, Product } from "./types";

export const metadata: Metadata = {
  title: "商品管理",
  description: "商品の一覧表示・編集・並び替えを行う管理画面",
  openGraph: {
    title: "商品管理 | 白熊堂 管理画面",
    description: "商品の一覧表示・編集・並び替えを行う管理画面",
  },
  twitter: {
    card: "summary_large_image",
    title: "商品管理 | 白熊堂 管理画面",
    description: "商品の一覧表示・編集・並び替えを行う管理画面",
  },
};

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    // 独立した非同期操作は並列実行（パフォーマンス最適化）
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

    // Prisma型からアプリケーション型に変換（Decimal→number、Date→string）
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

export default async function DashboardPage() {
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    const data = await getDashboardData();
    categories = data.categories;
    products = data.products;
  } catch {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認（getDashboardData内で記録済み）
    categories = [];
    products = [];
  }

  return <DashboardContent categories={categories} initialProducts={products} />;
}
