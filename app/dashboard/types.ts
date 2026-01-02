/**
 * ダッシュボードで使用する共通型定義
 */

export interface Category {
  id: number;
  name: string;
}

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
