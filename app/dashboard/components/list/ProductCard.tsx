import { Button } from "@/app/components/ui/button";
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

/**
 * 商品カードコンポーネント
 *
 * 商品情報を表示するカードUIを提供します。
 */
export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 ${
        !product.published ? "bg-gray-50" : "bg-white"
      }`}
    >
      <ProductCardContent
        product={product}
        showPublishedBadge
        showCategoryBadge
        isGrayscale={!product.published}
      />

      <div className="mt-auto flex gap-0.5 sm:gap-1 md:gap-2">
        <Button
          onClick={() => onEdit(product)}
          size="sm"
          className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
        >
          編集
        </Button>
        <Button
          onClick={() => onDelete(product.id)}
          variant="destructive"
          size="sm"
          className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
        >
          削除
        </Button>
      </div>
    </div>
  );
}
