/**
 * @fileoverview 商品カードの共通コンテンツコンポーネント
 *
 * ## 目的
 * ProductCard と SortableProductItem で共有される商品表示部分を提供します。
 *
 * ## 主な機能
 * - 商品画像の表示（next/image による最適化）
 * - 商品名の表示（2行クリッピング）
 * - 価格の表示（S/Lサイズ）
 * - 公開状態バッジとカテゴリーバッジの表示（オプション）
 * - グレースケール表示（非公開商品用）
 *
 * ## 実装の特性
 * - Server Component: 静的な表示コンポーネント
 * - 共通化の理由: ProductCard（一覧表示）と SortableProductItem（配置変更）で同じ表示内容を使用
 * - props による表示制御: バッジとグレースケールの表示を柔軟に切り替え
 *
 * ## デザイン設計
 * - レスポンシブな画像サイズ:
 *   - モバイル: h-20（狭い画面でも3列表示を維持）
 *   - タブレット: h-32
 *   - デスクトップ: h-48
 * - 商品名の高さ固定: h-[3em] で統一し、カードの高さを揃える
 * - line-clamp-2: 商品名を2行で切り詰め（長い名前でも崩れない）
 * - isGrayscale: 非公開商品を視覚的に区別（opacity-50、text-gray-500）
 *
 * ## ベストプラクティス
 * - next/image の sizes 属性: レスポンシブな画像読み込みの最適化
 *   - モバイル: 33vw（3列グリッド）
 *   - タブレット: 25vw
 *   - デスクトップ: 20vw
 * - 画像がない場合のフォールバック: グレー背景のプレースホルダー
 *
 * @see {@link ProductCard} - 商品一覧での使用
 * @see {@link SortableProductItem} - 配置変更での使用
 */
import Image from "next/image";
import { Badge } from "@/app/components/ui/badge";
import type { Product } from "../../types";

/**
 * ProductCardContent コンポーネントのprops
 *
 * @property {Product} product - 表示する商品データ
 * @property {boolean} [showPublishedBadge=false] - 公開/非公開バッジを表示するか
 * @property {boolean} [showCategoryBadge=false] - カテゴリーバッジを表示するか
 * @property {boolean} [isGrayscale=false] - グレースケール表示にするか（非公開商品用）
 */
interface ProductCardContentProps {
  product: Product;
  showPublishedBadge?: boolean;
  showCategoryBadge?: boolean;
  isGrayscale?: boolean;
}

/**
 * 商品カードの共通コンテンツコンポーネント
 *
 * ProductCard と SortableProductItem で共有される商品の表示内容を提供します。
 * 画像、名前、価格、バッジを統一的なスタイルで表示します。
 *
 * @param {ProductCardContentProps} props - コンポーネントのprops
 * @returns {JSX.Element} 商品表示コンテンツUI
 *
 * @example
 * ```tsx
 * <ProductCardContent
 *   product={product}
 *   showPublishedBadge={true}
 *   showCategoryBadge={true}
 *   isGrayscale={!product.published}
 * />
 * ```
 */
export default function ProductCardContent({
  product,
  showPublishedBadge = false,
  showCategoryBadge = false,
  isGrayscale = false,
}: ProductCardContentProps) {
  return (
    <>
      {/* 商品画像: next/image による最適化とレスポンシブ対応 */}
      {product.imageUrl ? (
        <div
          className={`relative h-20 w-full sm:h-32 md:h-48 ${isGrayscale ? "opacity-50" : ""}`}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded object-cover"
            // sizes: レスポンシブな画像読み込みの最適化
            // - モバイル: 33vw（3列グリッド）
            // - タブレット: 25vw
            // - デスクトップ: 20vw
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          />
        </div>
      ) : (
        // 画像がない場合のフォールバック: グレー背景
        <div
          className={`h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48 ${
            isGrayscale ? "opacity-50" : ""
          }`}
        />
      )}

      {/* 商品情報（名前、バッジ、価格） */}
      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        {/* 商品名: 高さを固定してカードの高さを揃える */}
        <div className="mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]">
          <h3
            className={`line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg ${
              isGrayscale ? "text-gray-500" : ""
            }`}
          >
            {product.name}
          </h3>
        </div>

        {/* バッジ表示エリア: 公開状態とカテゴリー */}
        {(showPublishedBadge || showCategoryBadge) && (
          <div className="mb-1 flex flex-wrap gap-0.5 sm:mb-2 sm:gap-1 md:gap-2">
            {/* 公開/非公開バッジ */}
            {showPublishedBadge && (
              <Badge
                variant={product.published ? "success" : "secondary"}
                className="px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs"
              >
                {product.published ? "公開" : "非公開"}
              </Badge>
            )}

            {/* カテゴリーバッジ */}
            {showCategoryBadge && (
              <Badge
                variant={isGrayscale ? "secondary" : "default"}
                // 非グレースケール時: 青色の背景（bg-blue-100 text-blue-800）
                className={`px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  !isGrayscale ? "bg-blue-100 text-blue-800 hover:bg-blue-100/80" : ""
                }`}
              >
                {product.category.name}
              </Badge>
            )}
          </div>
        )}

        {/* 価格表示: S/Lサイズ */}
        {/* グレースケール時: text-gray-400、通常時: text-gray-500 */}
        <div
          className={`mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm ${
            isGrayscale ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {/* Sサイズ価格 */}
          {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}

          {/* S/L両方ある場合のセパレーター */}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}

          {/* Lサイズ価格 */}
          {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
        </div>
      </div>
    </>
  );
}
