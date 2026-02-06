/**
 * 商品削除フック
 *
 * 確認ダイアログ → API呼び出し → 通知 → リフレッシュの一連の処理を管理。
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { log } from "@/lib/logger";

export function useProductDelete(refreshProducts: () => Promise<void>) {
  const handleDelete = useCallback(
    async (productId: number): Promise<void> => {
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        await fetchJson(`/api/products/${productId}`, {
          method: "DELETE",
        });

        toast.success("商品を削除しました");
        await refreshProducts();
      } catch (error) {
        log.error("商品の削除に失敗しました", {
          context: "useProductDelete.handleDelete",
          error,
          metadata: { productId },
        });
        toast.error(getUserFriendlyMessageJa(error));
      }
    },
    [refreshProducts]
  );

  return { handleDelete };
}
