/**
 * 商品順序変更フック
 *
 * @dnd-kit/sortableを使用したドラッグ&ドロップによる並び替え。
 * 楽観的UI更新でAPIレスポンス前に画面を更新し、エラー時はロールバックする。
 */
import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "../types";

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

    // 楽観的UI更新: APIレスポンス前に画面を更新
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
      // エラー時はロールバック
      await refreshProducts();
      throw error;
    }
  };

  return { reorderProducts };
}
