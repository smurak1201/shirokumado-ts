import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "../types";

/**
 * 商品の順序変更を処理するカスタムフック
 *
 * ドラッグ&ドロップで商品の順序を変更する際のロジックを提供します。
 * 楽観的 UI 更新を実装しており、API 呼び出し前に UI を更新することで、
 * ユーザーに即座にフィードバックを提供します。
 *
 * @param setProducts - 商品一覧の状態を更新する関数
 * @param refreshProducts - サーバーから最新の商品一覧を取得する関数
 * @returns { reorderProducts } - 商品の順序を変更する関数
 *
 * 使用例:
 * ```tsx
 * const { reorderProducts } = useProductReorder(setProducts, refreshProducts);
 * await reorderProducts(categoryGroup, oldIndex, newIndex);
 * ```
 */
export function useProductReorder(
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  refreshProducts: () => Promise<void>
) {
  /**
   * 商品の順序を変更する関数
   *
   * この関数は以下の処理を行います：
   * 1. 商品の配列を新しい順序に並び替え
   * 2. 各商品に displayOrder を割り当て
   * 3. 楽観的 UI 更新（API 呼び出し前に UI を更新）
   * 4. API を呼び出してサーバーに保存
   * 5. 成功時は最新データを取得、失敗時は元の状態に戻す
   *
   * @param categoryGroup - 操作対象のカテゴリーとその商品一覧
   * @param oldIndex - 移動元のインデックス
   * @param newIndex - 移動先のインデックス
   * @throws エラーが発生した場合は例外を投げる
   */
  const reorderProducts = async (
    categoryGroup: { name: string; products: Product[] },
    oldIndex: number,
    newIndex: number
  ) => {
    // arrayMove を使用して商品の配列を新しい順序に並び替え
    // 例: [A, B, C] で oldIndex=0, newIndex=2 の場合 → [B, C, A]
    const newProducts = arrayMove(
      categoryGroup.products,
      oldIndex,
      newIndex
    );

    // 新しい順序に基づいて各商品に displayOrder を割り当て
    // displayOrder は 1 から始まる連番
    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index + 1, // 1, 2, 3, ...
    }));

    /**
     * 楽観的 UI 更新: API 呼び出し前にローカル状態を更新
     *
     * これにより、ユーザーは即座に変更を確認できます。
     * API 呼び出しが完了するのを待つ必要がありません。
     */
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        // 順序が変更された商品を探す
        const order = productOrders.find((o) => o.id === product.id);
        if (order) {
          // displayOrder を更新
          return { ...product, displayOrder: order.displayOrder };
        }
        // 順序が変更されていない商品はそのまま返す
        return product;
      });
    });

    try {
      // API を呼び出して商品の順序をサーバーに保存
      const response = await fetch("/api/products/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productOrders }),
      });

      // レスポンスがエラーの場合は例外を投げる
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "順序の更新に失敗しました");
      }

      /**
       * 成功した場合は、サーバーから最新の状態を取得して同期
       *
       * これにより、他のユーザーによる変更やサーバー側での検証結果を反映できます。
       * 楽観的更新で設定した値とサーバーの値が一致していることを確認します。
       */
      await refreshProducts();
    } catch (error) {
      /**
       * エラーが発生した場合は、元の状態に戻すために再取得
       *
       * 楽観的更新で変更した UI を、サーバーの実際の状態に戻します。
       * これにより、エラーが発生しても UI とサーバーの状態が一致します。
       *
       * 注意: Neon HTTPドライバーではトランザクションがサポートされていないため、
       * 一部の更新が成功している可能性があります。サーバーから最新の状態を取得して
       * UIを同期することで、データの不整合を防ぎます。
       */
      await refreshProducts();
      // エラーを再スローして、呼び出し元でエラーハンドリングできるようにする
      throw error;
    }
  };

  return { reorderProducts };
}
