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
    /**
     * ProductCard: カードコンテナ
     *
     * インタラクション設定:
     * - onClick: クリック時に親コンポーネントのハンドラーを実行
     * - role="button": セマンティックHTML（スクリーンリーダー対応）
     * - tabIndex={0}: キーボードナビゲーション対応
     * - onKeyDown: Enter/Space キーでクリック動作を実現
     *   - e.preventDefault(): デフォルトのキー動作（スクロール等）を防ぐ
     * - aria-label: 商品名を含む説明的なラベル
     *
     * group クラス:
     * - ProductCard に group クラスが付与されている（card-product.tsx で定義）
     * - 子要素で group-hover: を使用してホバー時のスタイルを適用
     */
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
      {/*
       * ProductCardHeader: 画像表示エリア
       */}
      <ProductCardHeader>
        {/*
         * AspectRatio: 正方形（1:1）のアスペクト比を維持
         *
         * ratio={1}: 縦横比 1:1（正方形）
         * overflow-hidden: ホバー時の画像ズームがカードの外にはみ出さないように
         *
         * 理由: 商品画像のサイズがバラバラでも、常に正方形で表示することで
         * グリッドレイアウトが崩れず、統一感のあるUIを実現
         */}
        <AspectRatio ratio={1} className="w-full overflow-hidden">
          {/*
           * 商品画像の有無で表示を切り替え
           */}
          {product.imageUrl ? (
            /**
             * 商品画像がある場合
             *
             * relative: 絶対配置の子要素（Image, オーバーレイ）の基準点
             * bg-muted: 画像読み込み中の背景色
             */
            <div className="relative h-full w-full bg-muted">
              {/*
               * next/image による画像表示
               *
               * fill: 親要素いっぱいに画像を表示（width/height 不要）
               * object-cover: アスペクト比を維持しつつ、領域全体を覆う
               * sizes 属性:
               *   - すべての画面サイズで 33vw（3列グリッドのため）
               *   - Next.js がこの情報を基に最適な画像サイズを自動生成
               * loading="lazy": 画面に表示されるまで画像を読み込まない（パフォーマンス最適化）
               *
               * ホバーエフェクト:
               * - transition-transform: スムーズなズームアニメーション
               * - duration-700: 0.7秒かけてゆったりとズーム
               * - ease-out: 自然な減速カーブ
               * - group-hover:scale-110: カードにホバー時、画像を110%に拡大
               */}
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                loading="lazy"
              />
              {/*
               * ホバー時のオーバーレイエフェクト（レイヤー1）
               *
               * absolute inset-0: 親要素全体を覆う
               * bg-linear-to-t: 下から上へのグラデーション
               *   - from-background/80: 下側は背景色の80%透明度
               *   - via-background/20: 中央は20%透明度
               *   - to-transparent: 上側は完全に透明
               * opacity-0 → group-hover:opacity-100: ホバー時にフェードイン
               * transition-opacity duration-500: 0.5秒でスムーズに表示
               *
               * 意図: 画像の下部を暗くすることで、商品名の視認性を向上
               */}
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {/*
               * ホバー時のオーバーレイエフェクト（レイヤー2）
               *
               * bg-primary/0 → group-hover:bg-primary/10:
               *   - 通常時は透明
               *   - ホバー時にプライマリカラーの10%透明度のオーバーレイを表示
               * transition-colors duration-500: 0.5秒でスムーズに色が変化
               *
               * 意図: ブランドカラーのオーバーレイでホバー状態を強調
               * トレードオフ: 2つのオーバーレイを重ねることで微妙な視覚効果を実現
               */}
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
            </div>
          ) : (
            /**
             * 商品画像がない場合のプレースホルダー
             *
             * bg-linear-to-br: 左上から右下へのグラデーション
             *   - from-muted: 開始色
             *   - via-muted/80: 中間色（80%透明度）
             *   - to-muted/50: 終了色（50%透明度）
             *
             * 理由: 単色ではなくグラデーションを使うことで、
             * 画像がなくても視覚的に興味深いプレースホルダーを提供
             *
             * 注意: エラー画像を表示するのではなく、あえてグラデーション背景のみ
             * 理由: 画像がないことを目立たせすぎないデザイン
             */
            <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
          )}
        </AspectRatio>
      </ProductCardHeader>

      {/*
       * ProductCardContent: 商品名表示エリア
       */}
      <ProductCardContent>
        {/*
         * Tooltip: 商品名が長い場合に全文を表示
         *
         * TooltipProvider: ツールチップのコンテキストを提供
         * 理由: shadcn/ui の Tooltip コンポーネントは Provider が必要
         */}
        <TooltipProvider>
          <Tooltip>
            {/*
             * TooltipTrigger: ツールチップを表示するトリガー要素
             *
             * asChild: 子要素をトリガーとして使用
             * 理由: div をトリガーにすることで、商品名全体がホバー可能領域になる
             */}
            <TooltipTrigger asChild>
              {/*
               * 商品名のコンテナ
               *
               * min-h-[2.5em]/md:min-h-[3.25em]: 最小高さを確保
               *   - 理由: 商品名が短くてもカードの高さを統一するため
               *   - レスポンシブに高さを調整（モバイルは小さく、デスクトップは大きく）
               * flex items-center justify-center: 縦横中央揃え
               * cursor-pointer: ホバー時にポインターカーソルを表示
               */}
              <div className="flex min-h-[2.5em] cursor-pointer items-center justify-center md:min-h-[3.25em]">
                {/*
                 * 商品名の見出し
                 *
                 * line-clamp-2: 最大2行まで表示、超過分は省略（...）
                 * whitespace-pre-wrap: 改行を保持しつつ、長い行は折り返す
                 * text-center: 中央揃え
                 * text-[10px]/md:text-base/lg:text-lg: レスポンシブなフォントサイズ
                 *   - モバイル: 10px（小さい画面でもグリッドが崩れないように）
                 *   - タブレット: 16px（base）
                 *   - デスクトップ: 18px（lg）
                 * font-normal: 太字ではなく通常の太さ
                 * leading-relaxed: 行間をゆったりと（読みやすさ向上）
                 * transition-colors duration-300: ホバー時の色変化をスムーズに
                 * group-hover:text-foreground: カードホバー時に濃い色に変化
                 */}
                <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-normal leading-relaxed transition-colors duration-300 group-hover:text-foreground md:text-base lg:text-lg">
                  {product.name}
                </h3>
              </div>
            </TooltipTrigger>
            {/*
             * TooltipContent: ツールチップの内容
             *
             * 商品名の全文を表示（line-clamp で省略された部分も含む）
             * whitespace-pre-wrap: 改行を保持
             *
             * 用途: 商品名が長くて省略されている場合に、
             * ホバーすることで全文を確認できるようにする
             */}
            <TooltipContent>
              <p className="whitespace-pre-wrap">{product.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ProductCardContent>
    </ProductCard>
  );
}

/**
 * React.memo でメモ化してエクスポート
 *
 * 理由:
 * - ProductTile は商品グリッドに多数表示されるため、不要な再レンダリングを防ぐことが重要
 * - props（product, onClick）が変更されない限り、再レンダリングをスキップ
 *
 * パフォーマンスへの影響:
 * - 商品が50個ある場合、親コンポーネントが再レンダリングされても
 *   変更のない商品タイルは再レンダリングされない
 * - スクロール時のパフォーマンス向上に大きく寄与
 *
 * トレードオフ:
 * - 利点: パフォーマンス向上
 * - 欠点: メモ化のオーバーヘッド（ただし、このケースでは利点が大きく上回る）
 */
export default memo(ProductTile);
