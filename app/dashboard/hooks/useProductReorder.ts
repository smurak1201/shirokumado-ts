import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "../types";

/**
 * 商品の順序変更を処理するカスタムフック
 */
export function useProductReorder(
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  refreshProducts: () => Promise<void>
) {
  const reorderProducts = async (
    categoryGroup: { name: string; products: Product[] },
    oldIndex: number,
    newIndex: number
  ) => {
    const newProducts = arrayMove(
      categoryGroup.products,
      oldIndex,
      newIndex
    );

    // 順序を更新
    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index + 1,
    }));

    // 楽観的UI更新: API呼び出し前にローカル状態を更新
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        const order = productOrders.find((o) => o.id === product.id);
        if (order) {
          return { ...product, displayOrder: order.displayOrder };
        }
        return product;
      });
    });

    try {
      const response = await fetch("/api/products/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productOrders }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "順序の更新に失敗しました");
      }

      // 成功した場合は、サーバーから最新の状態を取得して同期
      await refreshProducts();
    } catch (error) {
      console.error("順序更新エラー:", error);
      // エラーが発生した場合は、元の状態に戻すために再取得
      await refreshProducts();
      throw error;
    }
  };

  return { reorderProducts };
}
