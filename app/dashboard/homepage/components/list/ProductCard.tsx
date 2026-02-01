/**
 * @fileoverview 商品カードコンポーネント
 *
 * ## 目的
 * 商品一覧に表示する商品カードUIを提供します。
 *
 * ## 主な機能
 * - 商品の基本情報表示（画像、名前、価格、カテゴリー、公開状態）
 * - 編集ボタンと削除ボタンの提供
 * - 非公開商品の視覚的な区別（グレー背景）
 *
 * ## 実装の特性
 * - Server Component: ユーザーインタラクションは親コンポーネントで処理
 * - プレゼンテーショナルコンポーネント
 * - ProductCardContent を使って表示内容を共通化
 *
 * ## デザイン設計
 * - 非公開商品: 背景色を bg-gray-50 にして視覚的に区別
 *   - 理由: ユーザーに公開/非公開の状態を一目で伝えるため
 * - レスポンシブ対応: ボタンサイズとフォントサイズを画面幅に応じて調整
 *   - モバイル: text-[8px]（狭い画面でも3列表示を維持）
 *   - タブレット: text-[10px]
 *   - デスクトップ: text-sm
 *
 * ## ベストプラクティス
 * - ProductCardContent を再利用: SortableProductItem でも同じ表示内容を使用
 * - published 状態に応じたスタイリング: isGrayscale prop で統一的に制御
 *
 * @see {@link ProductCardContent} - 表示内容の共通コンポーネント
 * @see {@link ProductListContent} - 親コンポーネント
 */
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../../types";

/**
 * ProductCard コンポーネントのprops
 *
 * @property {Product} product - 表示する商品データ
 * @property {(product: Product) => void} onEdit - 編集ボタンのクリックハンドラー
 * @property {(productId: number) => void} onDelete - 削除ボタンのクリックハンドラー
 */
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

/**
 * 商品カードコンポーネント
 *
 * 商品の情報をカード形式で表示し、編集・削除ボタンを提供します。
 * 非公開商品は背景色を変更して視覚的に区別します。
 *
 * @param {ProductCardProps} props - コンポーネントのprops
 * @returns {JSX.Element} 商品カードUI
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onEdit={(p) => setEditingProduct(p)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card
      className={`flex flex-col border-gray-200 ${!product.published ? "bg-gray-50" : ""}`}
    >
      {/* カードコンテンツ: 商品画像、名前、価格、バッジ */}
      {/* レスポンシブなパディング: モバイル p-1 → タブレット p-2 → デスクトップ p-4 */}
      <CardContent className="p-1 sm:p-2 md:p-4">
        <ProductCardContent
          product={product}
          showPublishedBadge // 公開/非公開バッジを表示
          showCategoryBadge // カテゴリーバッジを表示
          isGrayscale={!product.published} // 非公開商品はグレースケール表示
        />
      </CardContent>

      {/* カードフッター: 編集・削除ボタン */}
      {/* mt-auto: コンテンツの高さが異なってもフッターを下部に配置 */}
      {/* レスポンシブな gap とパディング: モバイル → タブレット → デスクトップ */}
      <CardFooter className="mt-auto gap-0.5 p-1 pt-0 sm:gap-1 sm:p-2 sm:pt-0 md:gap-2 md:p-4 md:pt-0">
        {/* 編集ボタン */}
        <Button
          onClick={() => onEdit(product)}
          size="sm"
          className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
        >
          編集
        </Button>

        {/* 削除ボタン */}
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
