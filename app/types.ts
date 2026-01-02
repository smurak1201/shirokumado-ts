/**
 * フロントエンドで使用する共通型定義
 *
 * フロントエンドのコンポーネント間で共有される型定義を集約しています。
 * 型の重複を防ぎ、一貫性を保つために使用します。
 */

/**
 * カテゴリーの型定義
 *
 * 商品カテゴリーの情報を表します。
 */
export interface Category {
  id: number; // カテゴリーID
  name: string; // カテゴリー名
}

/**
 * 商品の型定義（フロントエンド表示用）
 *
 * 商品の詳細情報を表します。
 * モーダル表示や詳細表示で使用されます。
 */
export interface Product {
  id: number; // 商品ID
  name: string; // 商品名
  description: string; // 商品説明
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
  priceS: number | null; // Sサイズの価格（円）
  priceL: number | null; // Lサイズの価格（円）
}

/**
 * 商品の型定義（タイル表示用）
 *
 * 商品タイル表示に必要な最小限の情報を表します。
 * グリッド表示で使用され、パフォーマンス最適化のため必要最小限の情報のみを含みます。
 */
export interface ProductTile {
  id: number; // 商品ID
  name: string; // 商品名
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
}
