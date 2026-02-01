/**
 * @fileoverview 商品検索カスタムフック - クライアント側フィルタリング
 *
 * ## 目的
 * - 商品一覧の検索・フィルタリング機能を提供
 * - 複数の検索条件を組み合わせて商品を絞り込む
 * - フィルター条件のリセット機能
 *
 * ## 主な機能
 * - 商品名での検索（部分一致）
 * - 公開状態でのフィルタリング（公開/非公開/すべて）
 * - カテゴリーでのフィルタリング
 * - フィルター条件のリセット
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/list/ProductListTab.tsx
 * - 商品一覧タブの検索・フィルタリングUI
 *
 * ## 実装の特性
 * - **Client Component専用**: useStateに依存
 * - **クライアント側フィルタリング**: サーバー負荷を軽減、リアルタイム性向上
 * - **useMemoによる最適化**: フィルター条件が変更されたときのみ再計算
 *
 * ## クライアント側フィルタリングの理由
 * - **パフォーマンス**: サーバーへのリクエストなしで即座にフィルタリング
 * - **UX向上**: 入力のたびにサーバーリクエストが発生しない
 * - **サーバー負荷軽減**: 検索クエリごとにAPIを呼び出さない
 * - **トレードオフ**: 初期データ量が多いと初回表示が遅くなる可能性
 *
 * ## パフォーマンス最適化
 * - useMemo: フィルター結果をキャッシュ（依存配列が変更されたときのみ再計算）
 * - filterProducts: utils/productUtils で定義された効率的なフィルタリング関数
 *
 * ## データフロー
 * 1. ユーザー入力: setSearchName、setSearchPublished、setSearchCategoryId
 * 2. useMemo: フィルター条件が変更されたらfilterProductsを実行
 * 3. 結果: filteredProductsが更新され、UIが再レンダリング
 */

import { useState, useMemo } from "react";
import { filterProducts } from "../utils/productUtils";
import type { Product } from "../types";

/**
 * 商品検索の状態管理を行うカスタムフック
 *
 * 商品一覧の検索・フィルタリング機能を提供します。
 * 複数の検索条件を組み合わせて商品を絞り込み、結果をuseMemoでキャッシュします。
 *
 * @param products - フィルタリング対象の商品一覧
 * @returns 検索条件の状態、フィルタリング結果、リセット関数
 *
 * ## 使用例
 * ```tsx
 * const {
 *   searchName,
 *   setSearchName,
 *   searchPublished,
 *   setSearchPublished,
 *   searchCategoryId,
 *   setSearchCategoryId,
 *   filteredProducts,
 *   resetFilters,
 * } = useProductSearch(products);
 *
 * <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} />
 * <Select value={searchPublished} onValueChange={setSearchPublished} />
 * <Select value={searchCategoryId} onValueChange={setSearchCategoryId} />
 * <Button onClick={resetFilters}>リセット</Button>
 *
 * {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
 * ```
 *
 * ## 実装の理由
 * - **状態の一元管理**: 検索条件をまとめて管理（コンポーネントのコードを簡潔化）
 * - **再利用性**: 他のページでも同じロジックを使用可能
 * - **パフォーマンス**: useMemoで不要な再計算を防ぐ
 */
export function useProductSearch(products: Product[]) {
  // 商品名での検索（部分一致）
  // 空文字列の場合はフィルタリングしない
  const [searchName, setSearchName] = useState("");

  // 公開状態でのフィルタリング
  // null: すべて、true: 公開のみ、false: 非公開のみ
  const [searchPublished, setSearchPublished] = useState<boolean | null>(null);

  // カテゴリーIDでのフィルタリング
  // null: すべてのカテゴリー、数値: 特定のカテゴリーのみ
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

  /**
   * フィルタリングされた商品一覧
   *
   * ## useMemoの理由
   * - フィルタリングは比較的コストが高い（全商品をループ）
   * - 検索条件が変更されない限り再計算不要
   * - レンダリングのたびにフィルタリングするのは無駄
   *
   * ## 依存配列
   * - [products, searchName, searchPublished, searchCategoryId]
   * - いずれかが変更されたら再計算
   *
   * ## filterProductsの実装
   * - utils/productUtilsで定義された効率的なフィルタリング関数
   * - 商品名の部分一致検索（大文字小文字を区別しない）
   * - 公開状態でのフィルタリング
   * - カテゴリーIDでのフィルタリング
   */
  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );

  /**
   * フィルター条件をリセットする関数
   *
   * すべての検索条件を初期状態に戻します。
   * 「すべて表示」ボタンなどで使用します。
   *
   * ## 実装の理由
   * - **UX向上**: 一括リセット機能でユーザーの操作を簡潔化
   * - **コードの再利用**: 複数の状態を一度にリセット
   *
   * ## 初期値
   * - searchName: "" （空文字列）
   * - searchPublished: null （すべて）
   * - searchCategoryId: null （すべてのカテゴリー）
   */
  const resetFilters = () => {
    setSearchName("");
    setSearchPublished(null);
    setSearchCategoryId(null);
  };

  return {
    searchName, // 商品名検索の入力値
    setSearchName, // 商品名検索の更新関数
    searchPublished, // 公開状態フィルターの値
    setSearchPublished, // 公開状態フィルターの更新関数
    searchCategoryId, // カテゴリーフィルターの値
    setSearchCategoryId, // カテゴリーフィルターの更新関数
    filteredProducts, // フィルタリングされた商品一覧（useMemoでキャッシュ）
    resetFilters, // フィルター条件をリセットする関数
  };
}
