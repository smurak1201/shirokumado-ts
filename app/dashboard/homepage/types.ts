/**
 * ダッシュボードホームページの型定義
 */

export type { Category } from "@/app/types";
import type { Category } from "@/app/types";

/**
 * 商品の型定義（ダッシュボード用）
 *
 * フロントエンド用Productとの違い: published, publishedAt, endedAt, displayOrder を追加
 * publishedAt/endedAt は ISO 文字列形式（Client Component へ渡すため）
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
  displayOrder: number | null;
}

export type TabType = "list" | "layout";
