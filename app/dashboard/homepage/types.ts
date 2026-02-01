/**
 * @fileoverview ダッシュボードホームページの型定義
 *
 * ## 目的
 * - ダッシュボードで使用する商品、カテゴリー、タブの型定義
 * - フロントエンド（app/types.ts）とは別に、管理画面専用の型を定義
 *
 * ## 設計の理由
 * - **型の分離**: フロントエンドとダッシュボードで必要なフィールドが異なる
 * - **管理機能**: published、publishedAt、endedAt、displayOrderなど管理専用フィールド
 * - **型安全性**: Client Componentとのデータ受け渡しで型チェックを実現
 *
 * ## 注意点
 * - Product型はPrismaから取得したデータを変換した後の型
 * - publishedAt、endedAtはISO文字列形式（Client Componentへの受け渡し対応）
 * - priceS、priceLはnumber型（PrismaのDecimal型から変換済み）
 */

/**
 * カテゴリー型の再エクスポート
 *
 * フロントエンド（app/types.ts）で定義されたCategory型を再エクスポート。
 * ダッシュボードでも同じCategory型を使用するため、型の一貫性を保つ。
 *
 * ## 再エクスポートの理由
 * - ダッシュボード内のコードが @/app/types からインポートする必要をなくす
 * - このファイルをインポートすれば、必要な型すべてが揃う（利便性向上）
 */
export type { Category } from "@/app/types";
import type { Category } from "@/app/types";

/**
 * 商品の型定義（ダッシュボード用）
 *
 * 管理画面で商品を管理するために必要な情報を定義します。
 * フロントエンド用のProductとは異なり、公開制御や表示順の管理機能を持ちます。
 *
 * ## フロントエンド用Product型との違い
 * - **管理フィールド**: published、publishedAt、endedAt、displayOrderを追加
 * - **公開制御**: 商品の公開/非公開、公開期間の設定が可能
 * - **表示順制御**: displayOrderでカテゴリー内の表示順を管理
 *
 * ## 型の設計理由
 * - imageUrl: null許容（画像なしの商品も登録可能）
 * - priceS/priceL: null許容（価格設定前の商品も登録可能）
 * - publishedAt/endedAt: string型（Client Componentへ渡すためISO文字列化）
 * - displayOrder: null許容（未設定の場合は最後に配置）
 *
 * @property id - 商品ID（一意の識別子）
 * @property name - 商品名（例: "抹茶ラテ"）
 * @property description - 商品説明（例: "濃厚な抹茶の風味が楽しめます"）
 * @property imageUrl - 商品画像のURL（Vercel Blobストレージ）
 * @property priceS - Sサイズの価格（円）
 * @property priceL - Lサイズの価格（円）
 * @property category - 所属するカテゴリー（関連データ）
 * @property published - 公開状態（true: 公開中、false: 非公開）
 * @property publishedAt - 公開開始日時（ISO 8601形式: "2024-01-01T00:00:00.000Z"）
 * @property endedAt - 公開終了日時（ISO 8601形式、未設定の場合はnull）
 * @property displayOrder - 表示順序（小さい順、nullは最後）
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

/**
 * ダッシュボードのタブ種別
 *
 * ダッシュボード内で商品を管理する2つのビューモードを定義します。
 *
 * ## タブの役割
 * - **list**: リスト/グリッド表示モード
 *   - 商品の一覧表示、検索、フィルタリング
 *   - 商品の新規作成、編集、削除
 *   - 公開/非公開の切り替え
 *
 * - **layout**: レイアウト編集モード
 *   - カテゴリー別の商品表示順を変更
 *   - ドラッグ&ドロップで並び替え
 *   - displayOrderフィールドを更新
 *
 * ## 設計の理由
 * - タブを分けることで、UIの複雑さを軽減
 * - それぞれのモードで最適な操作を提供
 * - 文字列リテラル型で型安全性を確保
 */
export type TabType = "list" | "layout";
