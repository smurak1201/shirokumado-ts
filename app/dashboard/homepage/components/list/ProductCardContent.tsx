/**
 * 商品カードの共通コンテンツコンポーネント
 *
 * ProductCard と SortableProductItem で共有される商品表示部分を提供。
 * 画像、名前、価格、バッジを統一的なスタイルで表示する。
 */
import Image from "next/image";
import { Badge } from "@/app/components/ui/badge";
import type { Product } from "../../types";

interface ProductCardContentProps {
  product: Product;
  showPublishedBadge?: boolean;
  showCategoryBadge?: boolean;
  isGrayscale?: boolean;
}

export default function ProductCardContent({
  product,
  showPublishedBadge = false,
  showCategoryBadge = false,
  isGrayscale = false,
}: ProductCardContentProps) {
  return (
    <>
      {product.imageUrl ? (
        <div
          className={`relative h-20 w-full sm:h-32 md:h-48 ${isGrayscale ? "opacity-50" : ""}`}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          />
        </div>
      ) : (
        <div
          className={`h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48 ${
            isGrayscale ? "opacity-50" : ""
          }`}
        />
      )}

      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        <div className="mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]">
          <h3
            className={`line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-bold leading-tight sm:text-xs md:text-lg ${
              isGrayscale ? "text-gray-500" : ""
            }`}
          >
            {product.name}
          </h3>
        </div>

        {(showPublishedBadge || showCategoryBadge) && (
          <div className="mb-1 flex flex-wrap gap-0.5 sm:mb-2 sm:gap-1 md:gap-2">
            {showPublishedBadge && (
              <Badge
                variant={product.published ? "success" : "secondary"}
                className="px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs"
              >
                {product.published ? "公開" : "非公開"}
              </Badge>
            )}

            {showCategoryBadge && (
              <Badge
                variant={isGrayscale ? "secondary" : "default"}
                className={`px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  !isGrayscale ? "bg-blue-100 text-blue-800 hover:bg-blue-100/80" : ""
                }`}
              >
                {product.category.name}
              </Badge>
            )}
          </div>
        )}

        <div
          className={`mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm ${
            isGrayscale ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}
          {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
        </div>
      </div>
    </>
  );
}
