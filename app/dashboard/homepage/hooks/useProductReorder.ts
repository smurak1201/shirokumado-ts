/**
 * @fileoverview 商品順序変更カスタムフック - ドラッグ&ドロップによる並び替え
 *
 * ## 目的
 * - レイアウトタブでの商品の表示順変更機能を提供
 * - ドラッグ&ドロップによる直感的な並び替えUIを実現
 * - 楽観的UI更新でユーザー体験を向上
 *
 * ## 主な機能
 * - @dnd-kit/sortable を使用したドラッグ&ドロップ
 * - 楽観的UI更新（API呼び出し前に画面を更新）
 * - displayOrderフィールドの自動更新
 * - エラー時のロールバック（データ再取得）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/layout/ProductLayoutTab.tsx
 *
 * ## 実装の特性
 * - **Client Component専用**: useStateに依存
 * - **楽観的更新**: UXを向上させるため、APIレスポンスを待たずに画面更新
 * - **エラーハンドリング**: 失敗時はデータ再取得でロールバック
 *
 * ## パフォーマンス最適化
 * - arrayMove: O(n)の効率的な配列操作
 * - 部分的な状態更新: 変更された商品のみdisplayOrderを更新
 *
 * @see https://docs.dndkit.com/presets/sortable
 */

import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "../types";

/**
 * 商品の順序変更を処理するカスタムフック
 *
 * ドラッグ&ドロップで商品の表示順を変更する機能を提供します。
 * 楽観的UI更新により、APIレスポンスを待たずに画面を更新し、
 * ユーザーに即座にフィードバックを提供します。
 *
 * @param setProducts - 商品一覧の状態更新関数（useState）
 * @param refreshProducts - サーバーから最新の商品データを再取得する関数
 * @returns reorderProducts関数を含むオブジェクト
 *
 * ## 楽観的UI更新の理由
 * - **ユーザー体験**: ドラッグ操作後、即座に並び順が変わることで直感的
 * - **パフォーマンス**: APIレスポンス（数百ms）を待たずに画面を更新
 * - **トレードオフ**: エラー時にロールバックが必要だが、エラー頻度は低い
 *
 * ## 使用例
 * ```tsx
 * const { reorderProducts } = useProductReorder(setProducts, refreshProducts);
 * <SortableContext onDragEnd={(e) => {
 *   reorderProducts(categoryGroup, e.oldIndex, e.newIndex);
 * }} />
 * ```
 */
export function useProductReorder(
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  refreshProducts: () => Promise<void>
) {
  /**
   * 商品の表示順を変更する関数
   *
   * ドラッグ&ドロップのイベントを受け取り、商品の表示順を更新します。
   * 楽観的UI更新 → API呼び出し → データ再取得の順で処理します。
   *
   * @param categoryGroup - 並び替え対象のカテゴリーと商品リスト
   * @param oldIndex - ドラッグ元のインデックス（0始まり）
   * @param newIndex - ドロップ先のインデックス（0始まり）
   * @throws API呼び出しが失敗した場合、エラーを再スロー
   *
   * ## 処理の流れ
   * 1. arrayMoveで配列を並び替え（ローカル操作）
   * 2. 新しいdisplayOrder値を計算（1始まり）
   * 3. 楽観的UI更新: 画面を即座に更新
   * 4. API呼び出し: サーバーのdisplayOrderを更新
   * 5. データ再取得: 最新状態を反映
   *
   * ## エラーハンドリング
   * - エラー時もrefreshProductsを呼び出してロールバック
   * - エラーは呼び出し元で処理（トースト表示など）
   */
  const reorderProducts = async (
    categoryGroup: { name: string; products: Product[] },
    oldIndex: number,
    newIndex: number
  ) => {
    // ステップ1: arrayMoveで配列を並び替え
    // @dnd-kit/sortable の arrayMove を使用（効率的な配列操作）
    const newProducts = arrayMove(
      categoryGroup.products,
      oldIndex,
      newIndex
    );

    // ステップ2: 新しいdisplayOrder値を計算
    // インデックス（0始まり）を displayOrder（1始まり）に変換
    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index + 1, // 1, 2, 3, ... の順序
    }));

    // ステップ3: 楽観的UI更新
    // APIレスポンスを待たずに画面を更新（ユーザー体験向上）
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        // 並び替えたカテゴリーの商品のみdisplayOrderを更新
        const order = productOrders.find((o) => o.id === product.id);
        if (order) {
          return { ...product, displayOrder: order.displayOrder };
        }
        // 他のカテゴリーの商品はそのまま
        return product;
      });
    });

    // ステップ4: API呼び出し
    try {
      const response = await fetch("/api/products/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productOrders }),
      });

      if (!response.ok) {
        // エラーレスポンスをパース（JSONパースに失敗しても空オブジェクト）
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "順序の更新に失敗しました");
      }

      // ステップ5: 成功時のデータ再取得
      // サーバーの最新状態を反映（楽観的更新と実際の結果を同期）
      await refreshProducts();
    } catch (error) {
      // エラー時のロールバック: 最新データを再取得
      // 楽観的更新が失敗したため、サーバーの正しい状態に戻す
      await refreshProducts();
      // エラーを呼び出し元に再スロー（トースト表示などで使用）
      throw error;
    }
  };

  return { reorderProducts };
}
