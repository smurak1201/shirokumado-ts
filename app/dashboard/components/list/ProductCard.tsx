import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
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
    <Card className={`flex flex-col ${!product.published ? "bg-gray-50" : ""}`}>
      <CardContent className="p-1 sm:p-2 md:p-4">
        <ProductCardContent
          product={product}
          showPublishedBadge
          showCategoryBadge
          isGrayscale={!product.published}
        />
      </CardContent>
      <CardFooter className="mt-auto gap-0.5 p-1 pt-0 sm:gap-1 sm:p-2 sm:pt-0 md:gap-2 md:p-4 md:pt-0">
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
      </CardFooter>
    </Card>
  );
}
