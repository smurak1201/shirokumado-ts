/**
 * ダッシュボードメインコンテンツコンポーネント
 *
 * ## 目的
 * ダッシュボードの商品管理画面のメインコンテナとして、商品の登録・更新・一覧表示を統括します。
 *
 * ## 主な機能
 * - 商品データの状態管理（親コンポーネントとしての状態リフトアップ）
 * - 商品登録/更新フォームの開閉制御
 * - 商品一覧の表示とリアルタイム更新
 * - API経由での商品データの取得と同期
 *
 * ## 使用するProps
 * - `categories`: カテゴリーマスターデータ（フォームと一覧で共有）
 * - `initialProducts`: 初期表示用の商品データ（Server Componentから受け取る）
 *
 * ## 実装の特性
 * - **Client Component**: 状態管理とユーザーインタラクションが必要なため
 * - **状態のリフトアップ**: ProductFormとProductListが共有する状態をここで管理
 *   → データフローが一方向になり、デバッグしやすい
 * - **キャッシュ無効化**: 商品データ更新時にキャッシュをバイパスして最新データを取得
 *
 * ## ベストプラクティス
 * - 状態は最小限にし、必要な場所でのみ管理する（KISS原則）
 * - API呼び出しにはタイムスタンプを付与してブラウザキャッシュを回避
 * - エラーハンドリングは構造化ログで詳細を記録
 *
 * @see ProductForm - 商品登録/更新フォーム
 * @see ProductList - 商品一覧表示
 */
"use client";

import { useState } from "react";
import { log } from "@/lib/logger";
import ProductForm from "./form/ProductForm";
import ProductList from "./list/ProductList";
import type { Category, Product } from "../types";

/**
 * DashboardContentコンポーネントのprops型定義
 *
 * @property {Category[]} categories - カテゴリーマスターデータ（フォームと一覧で使用）
 * @property {Product[]} initialProducts - 初期表示用の商品データ（Server Componentから渡される）
 */
interface DashboardContentProps {
  categories: Category[];
  initialProducts: Product[];
}

/**
 * ダッシュボードのメインコンテナコンポーネント
 *
 * 商品登録フォームと商品一覧を統括し、データの状態を一元管理します。
 * 状態をリフトアップして親で管理することで、子コンポーネント間のデータフローが明確になり、
 * 単方向データフローのベストプラクティスに従います。
 *
 * @param {DashboardContentProps} props - コンポーネントのprops
 * @param {Category[]} props.categories - カテゴリーマスターデータ
 * @param {Product[]} props.initialProducts - 初期表示用の商品データ
 *
 * @returns {JSX.Element} ダッシュボードメインコンテンツ
 *
 * ## 状態管理の設計
 * - `products`: 商品一覧データ（リアルタイム更新対象）
 * - `isFormOpen`: フォームの開閉状態（モーダル制御）
 *
 * ## データフロー
 * 1. Server Componentから初期データを受け取る
 * 2. 商品作成/更新時にrefreshProducts()を呼び出してデータを再取得
 * 3. 最新データで画面を更新
 */
export default function DashboardContent({
  categories,
  initialProducts,
}: DashboardContentProps) {
  // 商品一覧データの状態管理
  // 注意: Server Componentから受け取った初期データをClient Componentの状態として保持
  // これにより、API経由での追加・更新・削除が即座にUIに反映される
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // 商品登録/更新フォームの開閉状態
  // モーダルの表示/非表示を制御するためのフラグ
  const [isFormOpen, setIsFormOpen] = useState(false);

  /**
   * 商品一覧を最新データで更新する関数
   *
   * 商品の作成・更新・削除後に呼び出され、APIから最新の商品データを取得してUIを更新します。
   *
   * ## 実装の理由
   * - キャッシュ無効化: タイムスタンプとCache-Controlヘッダーでブラウザキャッシュをバイパス
   *   → 常に最新データを取得し、古いデータが表示されることを防ぐ
   * - 楽観的更新は採用しない: データの整合性を優先し、API応答後に確実に更新
   *
   * @returns {Promise<void>}
   *
   * ## エラーハンドリング
   * - API呼び出し失敗時は構造化ログに記録
   * - ユーザーには通知しない（既存データが表示されたまま）
   * - 今後の改善: トーストでエラー通知を追加することを検討
   */
  const refreshProducts = async (): Promise<void> => {
    try {
      // タイムスタンプをクエリパラメータに追加してキャッシュを無効化
      // これにより、ブラウザが古いキャッシュを使うことを防ぐ
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: "no-store", // Next.jsのキャッシュを無効化
        headers: {
          "Cache-Control": "no-cache", // ブラウザキャッシュも無効化
        },
      });
      const data = await response.json();

      // 商品データを更新（空配列フォールバックでエラーを防ぐ）
      setProducts(data.products || []);
    } catch (error) {
      // エラーログを構造化して記録
      // context情報を付与することで、ログから問題の発生箇所を特定しやすくする
      log.error("商品一覧の更新に失敗しました", {
        context: "DashboardContent.refreshProducts",
        error,
      });
      // TODO: ユーザーへのエラー通知（トースト等）を追加
    }
  };

  /**
   * 商品作成成功時のハンドラー
   *
   * 商品登録フォームから新規商品が作成された際に呼び出されます。
   *
   * ## 処理の流れ
   * 1. APIから最新の商品一覧を再取得（refreshProducts）
   * 2. フォームを閉じる（モーダルを非表示にする）
   *
   * @returns {Promise<void>}
   *
   * ## 実装の理由
   * - 楽観的更新ではなく、確実にAPIから最新データを取得
   *   → データの整合性を保証し、表示順序などの計算値も正確に反映
   * - フォームを閉じるのは更新後（ユーザーに「保存中」の状態が伝わる）
   */
  const handleProductCreated = async (): Promise<void> => {
    await refreshProducts(); // 最新データを取得
    setIsFormOpen(false); // フォームを閉じる
  };

  return (
    <>
      {/* 商品登録/更新フォーム（モーダル） */}
      {/*
        - isOpenでモーダルの表示を制御
        - onSuccessで作成/更新成功時にリストを更新
        - mode="create"で新規作成モード（更新時は別のpropsを渡す）
      */}
      <ProductForm
        categories={categories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleProductCreated}
        mode="create"
      />

      {/* 商品一覧表示 */}
      {/*
        - products状態とsetProducts関数を渡して、子コンポーネントでも更新可能に
        - refreshProducts関数を渡して、削除・更新後のリフレッシュに使用
        - onNewProductClickで「新規作成」ボタンのクリック時にフォームを開く
      */}
      <ProductList
        products={products}
        setProducts={setProducts}
        refreshProducts={refreshProducts}
        categories={categories}
        onNewProductClick={() => setIsFormOpen(true)}
      />
    </>
  );
}
