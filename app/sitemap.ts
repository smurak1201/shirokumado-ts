import type { MetadataRoute } from "next";
import { getPublishedProductsByCategory } from "@/lib/products";

const BASE_URL = process.env.SITE_URL!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about-ice`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 公開中の商品ページを動的に追加
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getPublishedProductsByCategory();
    const products = categories.flatMap((c) => c.products);
    productPages = products.map((product) => ({
      url: `${BASE_URL}/menu/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // 商品データ取得失敗時は静的ページのみのsitemapを返す
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
