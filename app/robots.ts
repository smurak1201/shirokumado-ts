// カスタムドメイン取得前はクロールを全拒否する
// 取得後は allow: "/" に変更し、sitemap指定を追加すること
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
