import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "../types";

/**
 * 商品の順序変更を処理するカスタムフック
 *
 * ドラッグ&ドロップで商品の順序を変更する際のロジックを提供します。
 * 楽観的 UI 更新を実装しており、API 呼び出し前に UI を更新することで、
 * ユーザーに即座にフィードバックを提供します。
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

    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index + 1,
    }));

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "順序の更新に失敗しました");
      }

      await refreshProducts();
    } catch (error) {
      await refreshProducts();
      throw error;
    }
  };

  return { reorderProducts };
}
