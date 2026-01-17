import Image from "next/image";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { calculatePublishedStatus } from "@/lib/product-utils";
import ProductGrid from "./components/ProductGrid";
import Header from "./components/Header";
import Footer from "./components/Footer";
import type { Category, Product } from "./types";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function _convertPrice(price: Prisma.Decimal | null | undefined): number | null {
  if (price === null || price === undefined) {
    return null;
  }
  const num = Number(price);
  return isNaN(num) ? null : num;
}

type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

async function getPublishedProductsByCategory(): Promise<
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
    console.error("Error fetching published products:", error);
    throw error;
  }
}

export default async function Home() {
  let categoriesWithProducts: CategoryWithProducts[];

  try {
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
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
