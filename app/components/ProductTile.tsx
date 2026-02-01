/**
 * 商品タイルコンポーネント (app/components/ProductTile.tsx)
 *
 * 商品グリッドに表示される個別の商品タイルです。
 * 商品画像と名前を表示し、クリックで商品詳細モーダルを開きます。
 *
 * 主な機能:
 * - 正方形（1:1）のアスペクト比での商品画像表示
 * - ホバー時の画像ズームとオーバーレイエフェクト
 * - 商品名の表示（長い名前はツールチップで全文表示）
 * - キーボード操作対応（Enter/Space キー）
 * - アクセシビリティ対応（role, aria-label）
 *
 * 実装の特性:
 * - Client Component（インタラクションとホバーエフェクトのため）
 * - React.memo によるメモ化（パフォーマンス最適化）
 * - next/image による画像の自動最適化と遅延読み込み
 *
 * パフォーマンス最適化:
 * - memo: props が変更されない限り再レンダリングを防ぐ
 * - loading="lazy": 画面に表示されるまで画像を読み込まない
 * - sizes 属性: レスポンシブに最適な画像サイズを読み込む
 *
 * ベストプラクティス:
 * - shadcn/ui の Card, AspectRatio, Tooltip コンポーネントを使用
 * - 画像がない場合はグラデーション背景を表示（エラーを隠蔽しない）
 * - ホバー時のトランジションは CSS で実装（パフォーマンス重視）
 */
"use client";

import { memo } from "react";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";
import { ProductCard, ProductCardContent, ProductCardHeader } from "./ui/card-product";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * ProductTile コンポーネントの Props 型定義
 *
 * @property product - 表示する商品情報（id, name, imageUrl のみ）
 *   - 必要最小限の情報だけを受け取ることで、コンポーネント間の結合度を低く保つ
 * @property onClick - クリック時のハンドラー関数
 *   - 親コンポーネント（ProductGrid）でモーダルを開く処理を実行
 */
interface ProductTileProps {
  product: ProductTileType;
  onClick: () => void;
}

/**
 * 商品タイルコンポーネント
 *
 * 商品の画像と名前を正方形のカードで表示します。
 * ホバー時には画像がズームし、オーバーレイエフェクトが表示されます。
 *
 * @param product - 商品情報（id, name, imageUrl）
 * @param onClick - クリック時のハンドラー
 *
 * 構成要素:
 * - ProductCard: カードコンテナ（shadcn/ui ベース）
 * - ProductCardHeader: 画像表示エリア
 * - AspectRatio: 1:1 の正方形アスペクト比を維持
 * - next/image: 画像の自動最適化と遅延読み込み
 * - ProductCardContent: 商品名表示エリア
 * - Tooltip: 商品名が長い場合に全文を表示
 *
 * アクセシビリティ:
 * - role="button": スクリーンリーダーにボタンとして認識させる
 * - tabIndex={0}: キーボードでフォーカス可能にする
 * - onKeyDown: Enter/Space キーでクリックを実行
 * - aria-label: 商品名を含む説明的なラベル
 *
 * メモ化:
 * - React.memo でラップすることで、props が変わらない限り再レンダリングを防ぐ
 * - 商品グリッドに多数のタイルがある場合、パフォーマンス改善に大きく寄与
 */
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <ProductCard
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${product.name}の詳細を見る`}
    >
      <ProductCardHeader>
        <AspectRatio ratio={1} className="w-full overflow-hidden">
          {product.imageUrl ? (
            <div className="relative h-full w-full bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                loading="lazy"
              />
              {/* ホバー時のオーバーレイ */}
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
            </div>
          ) : (
            <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
          )}
        </AspectRatio>
      </ProductCardHeader>

      <ProductCardContent>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex min-h-[2.5em] cursor-pointer items-center justify-center md:min-h-[3.25em]">
                <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-normal leading-relaxed transition-colors duration-300 group-hover:text-foreground md:text-base lg:text-lg">
                  {product.name}
                </h3>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="whitespace-pre-wrap">{product.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ProductCardContent>
    </ProductCard>
  );
}

export default memo(ProductTile);
