/**
 * ダッシュボードで使用する共通型定義
 */

// 共通のCategory型を再エクスポート
export type { Category } from "@/app/types";
import type { Category } from "@/app/types";

/**
 * 商品の型定義（ダッシュボード用）
 *
 * フロントエンド用のProductを拡張し、管理機能に必要なフィールドを追加しています。
 */
export interface Product {
  id: number; // 商品ID
  name: string; // 商品名
  description: string; // 商品説明
  imageUrl: string | null; // 商品画像のURL（BlobストレージのURL）
  priceS: number | null; // Sサイズの価格（円）
  priceL: number | null; // Lサイズの価格（円）
  category: Category; // 所属するカテゴリー
  published: boolean; // 公開状態（true: 公開, false: 非公開）
  publishedAt: string | null; // 公開開始日時（ISO文字列形式）
  endedAt: string | null; // 公開終了日時（ISO文字列形式）
  displayOrder: number | null; // 表示順序（小さい順に表示、nullの場合は最後に配置）
}

/**
 * ダッシュボードのタブ種別
 */
export type TabType = "list" | "layout";
