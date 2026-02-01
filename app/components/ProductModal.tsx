/**
 * 商品詳細モーダルコンポーネント (app/components/ProductModal.tsx)
 *
 * 商品タイルをクリックした時に表示される、商品の詳細情報を表示するモーダルです。
 *
 * 主な機能:
 * - 商品画像の大きな表示（ホバーでズーム）
 * - 商品名と説明の表示
 * - サイズ別価格の表示（Small/Large）
 * - スクロール可能なコンテンツエリア
 * - スムーズな開閉アニメーション
 * - ESC キーまたは背景クリックで閉じる
 *
 * 実装の特性:
 * - Client Component（モーダルの状態管理とアニメーションのため）
 * - shadcn/ui の Dialog コンポーネントをベースに実装
 * - framer-motion による順次表示アニメーション（スタッガー）
 * - next/image による画像の自動最適化（priority 読み込み）
 *
 * パフォーマンス最適化:
 * - 動的インポート（ProductGrid.tsx で実装）により、初回読み込みを高速化
 * - ScrollArea により、長いコンテンツでもスムーズなスクロールを実現
 *
 * ベストプラクティス:
 * - アニメーション設定は lib/config.ts で一元管理
 * - 価格フォーマットは lib/product-utils.ts のユーティリティ関数を使用
 * - モバイルファースト設計（レスポンシブ対応）
 */
"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "@/lib/product-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { PriceBadge } from "./ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "./ui/card-modal";
import { config } from "@/lib/config";

/**
 * モーダルコンテンツ全体のアニメーション設定（framer-motion）
 *
 * スタッガーアニメーション（順次表示）を実装:
 * - hidden: 初期状態（透明）
 * - visible: 表示状態（不透明）+ 子要素を順次アニメーション
 * - staggerChildren: 各子要素（画像、商品情報、価格）のアニメーション開始を少しずつずらす
 * - delayChildren: 0.1秒遅延してアニメーション開始（モーダル表示後に順次表示）
 *
 * 設定値は lib/config.ts から取得:
 * - マジックナンバーを避けるため、設定値を一元管理
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
      delayChildren: 0.1,
    },
  },
};

/**
 * モーダル内の各セクション（画像、商品情報、価格）のアニメーション設定
 *
 * フェードイン + 上方向へのスライドアニメーション:
 * - hidden: 初期状態（透明、下に20px移動）
 * - visible: 表示状態（不透明、元の位置）
 * - duration: アニメーション時間（lib/config.ts から取得）
 * - ease: "easeOut" で自然な減速カーブを実現
 *
 * 意図:
 * - 各セクションが下から浮かび上がってくるような視覚効果
 * - スタッガーアニメーションにより、モーダルの内容が順次表示されて視覚的に魅力的
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

/**
 * ProductModal コンポーネントの Props 型定義
 *
 * @property product - 表示する商品情報（null の場合はモーダルを表示しない）
 * @property isOpen - モーダルの開閉状態
 * @property onClose - モーダルを閉じる時のハンドラー関数
 */
interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 商品詳細モーダルコンポーネント
 *
 * 商品の詳細情報（画像、名前、説明、価格）をモーダルで表示します。
 * 画像、商品情報、価格が順次アニメーションで表示されます。
 *
 * @param product - 商品情報（null の場合はモーダルを表示しない）
 * @param isOpen - モーダルの開閉状態
 * @param onClose - モーダルを閉じる時のハンドラー
 *
 * 構成要素:
 * - Dialog: モーダルのコンテナ（shadcn/ui）
 * - ScrollArea: スクロール可能なコンテンツエリア
 * - ModalImageCard: 商品画像を表示するカード
 * - ModalContentCard: 商品名と説明を表示するカード
 * - ModalPriceCard: 価格情報を表示するカード（Small/Large）
 *
 * 操作方法:
 * - ESC キー: モーダルを閉じる（Dialog の標準機能）
 * - 背景クリック: モーダルを閉じる（Dialog の標準機能）
 * - 画像ホバー: 画像が拡大（ズームエフェクト）
 */
export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  /**
   * 商品情報がない場合は何も表示しない
   *
   * 理由: product が null の場合にモーダルを表示する必要がない
   * useProductModal フックで商品が選択されるまでは null
   */
  if (!product) {
    return null;
  }

  return (
    /**
     * Dialog: モーダルのコンテナ（shadcn/ui）
     *
     * open: モーダルの開閉状態
     * onOpenChange: 閉じる時のハンドラー（ESC キー、背景クリック時に呼ばれる）
     */
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/*
       * DialogContent: モーダルの本体
       *
       * レイアウト:
       * - max-h-[90vh]: 最大高さを画面の90%に制限（上下に余白を残す）
       * - w-[calc(100vw-2rem)]: 幅を画面幅から左右2rem分を引いた値に（モバイル対応）
       * - max-w-2xl: デスクトップでは最大672pxに制限
       * - p-0: パディングを削除（ScrollArea 内でパディングを設定）
       * - overflow-hidden: スクロールバーがモーダルの外に表示されないように
       * - sm:rounded-lg: スマホ以上の画面では角を丸める
       *
       * 理由: モバイルでも見やすく、デスクトップでは適度なサイズに収める
       */}
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
        {/*
         * ScrollArea: スクロール可能なコンテンツエリア（shadcn/ui）
         *
         * max-h-[90vh]: 最大高さを画面の90%に制限
         * 理由: コンテンツが長い場合でもモーダル内でスクロール可能にする
         */}
        <ScrollArea className="max-h-[90vh]">
          {/*
           * モーダルコンテンツのコンテナ（アニメーション付き）
           *
           * flex flex-col gap-4: 縦方向に要素を並べ、要素間に16pxの間隔
           * p-4/md:p-6/lg:p-8: レスポンシブなパディング
           * variants={containerVariants}: スタッガーアニメーションのコンテナ設定
           * initial="hidden": 初期状態（透明）
           * animate="visible": アニメーション開始（順次表示）
           */}
          <motion.div
            className="flex flex-col gap-4 p-4 md:p-6 lg:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/*
             * 商品画像セクション
             *
             * variants={itemVariants}: フェードイン + スライドアニメーション
             * whileHover={{ scale: 1.02 }}: カードホバー時に2%拡大
             * transition={{ duration: 0.3 }}: 0.3秒でスムーズに拡大
             */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/*
               * ModalImageCard: 画像を表示するカード
               */}
              <ModalImageCard>
                <ModalCardHeader>
                  {/*
                   * 画像コンテナ
                   *
                   * レイアウト:
                   * - relative: 絶対配置の子要素（Image）の基準点
                   * - h-[40vh]/md:h-[45vh]: レスポンシブな高さ（モバイル: 40vh、デスクトップ: 45vh）
                   * - min-h-[200px]: 最小高さを確保（画面が小さくても画像が見える）
                   * - max-h-[450px]/md:max-h-[500px]: 最大高さを制限（大きくなりすぎないように）
                   * - overflow-hidden: ズームエフェクト時に画像がはみ出さないように
                   * - bg-muted: 画像読み込み中の背景色
                   */}
                  <div className="relative h-[40vh] min-h-[200px] max-h-[450px] md:h-[45vh] md:max-h-[500px] overflow-hidden bg-muted">
                    {/*
                     * 商品画像の有無で表示を切り替え
                     */}
                    {product.imageUrl ? (
                      /**
                       * 商品画像がある場合
                       *
                       * motion.div でズームエフェクトを追加:
                       * - whileHover={{ scale: 1.05 }}: ホバー時に5%拡大
                       * - transition={{ duration: 0.4 }}: 0.4秒でゆったりとズーム
                       *
                       * レイアウト:
                       * - relative: 絶対配置の子要素（Image）の基準点
                       * - flex items-center justify-center: 画像を中央配置
                       * - p-4/md:p-6: パディング（画像の周囲に余白を作る）
                       */}
                      <motion.div
                        className="relative h-full w-full flex items-center justify-center p-4 md:p-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/*
                         * next/image による画像表示
                         *
                         * fill: 親要素いっぱいに画像を表示
                         * object-contain: アスペクト比を維持しつつ、領域内に収める
                         *   - object-cover ではなく object-contain を使用する理由:
                         *     商品画像は全体を見せる必要があるため、切り取らずに表示
                         * sizes 属性:
                         *   - モバイル: 100vw（画面全体）
                         *   - タブレット: 90vw（画面の90%）
                         *   - デスクトップ: 672px（max-w-2xl の実サイズ）
                         * priority: 優先的に読み込み（モーダル表示時にすぐ見える必要があるため）
                         *   - loading="lazy" ではなく priority を使用
                         *   - 理由: モーダルを開いた時に画像がすぐ表示されるべき
                         */}
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                          priority
                        />
                      </motion.div>
                    ) : (
                      /**
                       * 商品画像がない場合のプレースホルダー
                       *
                       * bg-linear-to-br: 左上から右下へのグラデーション
                       * 理由: ProductTile と同じスタイルで統一感を出す
                       */
                      <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
                    )}
                  </div>
                </ModalCardHeader>
              </ModalImageCard>
            </motion.div>

            {/*
             * 商品情報セクション
             *
             * variants={itemVariants}: フェードイン + スライドアニメーション
             * containerVariants のスタッガー設定により、画像の後に表示される
             */}
            <motion.div variants={itemVariants}>
              {/*
               * ModalContentCard: 商品情報を表示するカード
               */}
              <ModalContentCard>
                <ModalCardContent>
                  {/*
                   * DialogHeader: モーダルの見出しエリア（shadcn/ui）
                   *
                   * space-y-3: 子要素間に12pxの間隔
                   * mb-0: 下マージンを削除（カード内のパディングで調整）
                   */}
                  <DialogHeader className="space-y-3 mb-0">
                    {/*
                     * DialogTitle: 商品名の見出し
                     *
                     * スタイリング:
                     * - whitespace-pre-wrap: 改行を保持しつつ、長い行は折り返す
                     * - text-center: 中央揃え
                     * - text-xl/md:text-2xl/lg:text-3xl: レスポンシブなフォントサイズ
                     * - font-normal: 太字ではなく通常の太さ（エレガントな印象）
                     * - tracking-wide: 文字間隔を広めに（読みやすさとデザイン性）
                     * - leading-tight: 行間を狭めに（タイトルらしさ）
                     * - text-muted-foreground: 控えめな色
                     */}
                    <DialogTitle className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                      {product.name}
                    </DialogTitle>
                    {/*
                     * DialogDescription: 商品説明（オプション）
                     *
                     * product.description がある場合のみ表示
                     * スタイリング:
                     * - text-center: 中央揃え
                     * - text-sm/md:text-base/lg:text-lg: レスポンシブなフォントサイズ
                     * - leading-relaxed: 行間をゆったりと（読みやすさ向上）
                     * - text-muted-foreground: 控えめな色
                     * - mt-2: タイトルとの間に8pxの間隔
                     */}
                    {product.description && (
                      <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                        {product.description}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                </ModalCardContent>
              </ModalContentCard>
            </motion.div>

            {/*
             * 価格セクション（オプション）
             *
             * product.priceS または product.priceL がある場合のみ表示
             * 理由: 価格情報がない商品も存在する可能性があるため
             */}
            {(product.priceS || product.priceL) && (
              <motion.div variants={itemVariants}>
                {/*
                 * ModalPriceCard: 価格情報を表示するカード
                 */}
                <ModalPriceCard>
                  <ModalCardContent>
                    {/*
                     * 価格表示エリア
                     *
                     * flex flex-wrap: 横並び、必要に応じて折り返し（モバイル対応）
                     * items-center: 縦方向中央揃え
                     * justify-center: 横方向中央揃え
                     * gap-6/md:gap-10: レスポンシブな間隔（Small と Large の間）
                     */}
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                      {/*
                       * Small サイズの価格（オプション）
                       */}
                      {product.priceS && (
                        /**
                         * Small 価格の表示
                         *
                         * whileHover={{ scale: 1.05 }}: ホバー時に5%拡大
                         * transition={{ duration: 0.2 }}: 0.2秒でスナッピーな反応
                         *
                         * レイアウト:
                         * - flex flex-col: 縦方向に要素を並べる（ラベル + 価格）
                         * - items-center: 中央揃え
                         * - gap-2: 要素間に8pxの間隔
                         */
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/*
                           * サイズラベル
                           *
                           * text-xs: 小さいフォントサイズ（12px）
                           * font-medium: 少し太めのフォント
                           * text-muted-foreground: 控えめな色
                           * uppercase: 大文字に変換（"SMALL"）
                           * tracking-widest: 文字間隔を最も広く（デザイン性）
                           */}
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Small
                          </span>
                          {/*
                           * 価格バッジ
                           *
                           * PriceBadge: カスタムコンポーネント（ui/badge-price.tsx）
                           * formatPrice: ユーティリティ関数で価格をフォーマット（lib/product-utils.ts）
                           *   - 例: 1000 → "¥1,000"
                           */}
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceS)}
                          </PriceBadge>
                        </motion.div>
                      )}
                      {/*
                       * Small と Large の間の区切り線（オプション）
                       *
                       * 両方の価格がある場合のみ表示
                       * 理由: 片方しかない場合は区切り線が不要
                       */}
                      {product.priceS && product.priceL && (
                        <div className="flex flex-col items-center">
                          {/*
                           * 垂直の区切り線
                           *
                           * orientation="vertical": 縦方向の区切り線
                           * h-12/md:h-16: レスポンシブな高さ
                           * bg-border/50: ボーダー色の50%透明度（控えめな表現）
                           */}
                          <Separator
                            orientation="vertical"
                            className="h-12 md:h-16 bg-border/50"
                          />
                        </div>
                      )}
                      {/*
                       * Large サイズの価格（オプション）
                       *
                       * Small と同じ構造
                       */}
                      {product.priceL && (
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Large
                          </span>
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceL)}
                          </PriceBadge>
                        </motion.div>
                      )}
                    </div>
                  </ModalCardContent>
                </ModalPriceCard>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
