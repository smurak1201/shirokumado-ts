/**
 * 商品グリッドコンポーネント (app/components/ProductGrid.tsx)
 *
 * カテゴリーごとに商品を3列のグリッドレイアウトで表示するコンポーネントです。
 *
 * 主な機能:
 * - レスポンシブな3列グリッドレイアウト（スマホ/タブレット/デスクトップ対応）
 * - 商品タイルのスタッガーアニメーション（順次表示）
 * - 商品タイルクリック時に詳細モーダルを表示
 * - カテゴリータイトルの表示/非表示切り替え（オプション）
 *
 * 実装の特性:
 * - Client Component（アニメーションとモーダル状態管理のため）
 * - framer-motion によるスクロールインアニメーション
 * - ProductModal の動的インポート（SSR無効化）
 *
 * ベストプラクティス:
 * - アニメーション設定は lib/config.ts で一元管理
 * - モーダル状態管理はカスタムフック（useProductModal）に分離
 * - 商品がない場合は何も表示しない（null を返す）
 */
"use client";

import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { config } from "@/lib/config";
import ProductTile from "./ProductTile";
import type { Category, Product } from "../types";
import { useProductModal } from "../hooks/useProductModal";

/**
 * ProductModal コンポーネントの動的インポート
 *
 * ssr: false の理由:
 * - モーダルはユーザーがクリックした時のみ必要なため、SSRの必要がない
 * - クライアント側のみで読み込むことで、初回ページロードを高速化
 * - モーダルコンポーネントには DOM API（document.body 等）を使用する可能性があるため
 *
 * トレードオフ:
 * - 利点: 初回ページロードが高速化、サーバー側の処理負荷軽減
 * - 欠点: 初回モーダル表示時にわずかな遅延が発生する可能性（実用上は問題なし）
 */
const ProductModal = dynamic(
  () => import("./ProductModal"),
  { ssr: false }
);

/**
 * ProductGrid コンポーネントの Props 型定義
 *
 * @property category - 表示するカテゴリー情報（名前やIDなど）
 * @property products - カテゴリーに属する商品のリスト
 * @property showCategoryTitle - カテゴリータイトルを表示するか（デフォルト: true）
 *   - タブ切り替え時などで既にカテゴリー名が表示されている場合は false にすることで重複を避ける
 */
interface ProductGridProps {
  category: Category;
  products: Product[];
  showCategoryTitle?: boolean;
}

/**
 * グリッドコンテナのアニメーション設定（framer-motion）
 *
 * スタッガーアニメーション（順次表示）を実装:
 * - hidden: 初期状態（透明）
 * - visible: 表示状態（不透明）+ 子要素を順次アニメーション
 * - staggerChildren: 各子要素のアニメーション開始を少しずつずらす
 *
 * 設定値は lib/config.ts から取得:
 * - マジックナンバーを避けるため、設定値を一元管理
 * - プロジェクト全体で一貫したアニメーション速度を実現
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
    },
  },
};

/**
 * 商品タイル個別のアニメーション設定（framer-motion）
 *
 * フェードイン + 上方向へのスライドアニメーション:
 * - hidden: 初期状態（透明、下に20px移動）
 * - visible: 表示状態（不透明、元の位置）
 * - duration: アニメーション時間（lib/config.ts から取得）
 * - ease: "easeOut" で自然な減速カーブを実現
 *
 * 意図:
 * - 商品が下から浮かび上がってくるような視覚効果
 * - スクロール時に順次表示されることで、動的で魅力的なUIを実現
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
 * 商品グリッドコンポーネント
 *
 * カテゴリーに属する商品を3列のグリッドレイアウトで表示します。
 * スクロール時にスタッガーアニメーション（順次表示）が適用されます。
 * 商品タイルをクリックすると、商品詳細を表示するモーダルが開きます。
 *
 * @param category - カテゴリー情報（タイトル表示用）
 * @param products - 表示する商品のリスト
 * @param showCategoryTitle - カテゴリータイトルを表示するか（デフォルト: true）
 *
 * 構成要素:
 * - カテゴリータイトル（オプション）: motion.div でフェードインアニメーション
 * - 商品グリッド: 3列レスポンシブグリッド + スタッガーアニメーション
 * - ProductTile: 各商品のサムネイル表示
 * - ProductModal: 商品詳細を表示するモーダル（動的インポート）
 *
 * カスタムフック:
 * - useProductModal: モーダルの開閉状態と選択中の商品を管理
 */
export default function ProductGrid({
  category,
  products,
  showCategoryTitle = true,
}: ProductGridProps) {
  /**
   * 商品モーダルの状態管理
   *
   * カスタムフック（useProductModal）を使用:
   * - selectedProduct: 現在選択されている商品
   * - isModalOpen: モーダルが開いているか
   * - handleProductClick: 商品タイルクリック時のハンドラー
   * - handleCloseModal: モーダルを閉じるハンドラー
   *
   * 理由: 状態管理ロジックをコンポーネントから分離することで、
   * コンポーネントがシンプルになり、テストしやすくなる
   */
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  /**
   * 商品が存在しない場合は何も表示しない
   *
   * 理由: 空のグリッドを表示するよりも、セクション自体を非表示にする方が
   * UI的にクリーンで、ユーザーに混乱を与えない
   */
  if (products.length === 0) {
    return null;
  }

  return (
    <>
      {/*
       * 商品グリッドセクション
       *
       * レスポンシブな下マージン:
       * - mb-12 (モバイル: 48px)
       * - md:mb-20 (タブレット: 80px)
       * - lg:mb-24 (デスクトップ: 96px)
       *
       * 理由: 画面が大きくなるほどセクション間のスペースを広げることで、
       * 視覚的に余裕のあるレイアウトを実現
       */}
      <section className="mb-12 md:mb-20 lg:mb-24">
        {/*
         * カテゴリータイトル（オプション）
         *
         * showCategoryTitle が true の場合のみ表示
         * 用途: タブUIでカテゴリー名が既に表示されている場合は false にして重複を避ける
         *
         * アニメーション:
         * - initial: 初期状態（透明、下に10px移動）
         * - whileInView: ビューポートに入った時のアニメーション（フェードイン + 上へ移動）
         * - viewport.once: 一度だけアニメーション（スクロールのたびに再生しない）
         * - duration: 0.5秒でゆったりとしたアニメーション
         */}
        {showCategoryTitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-center md:mb-12 lg:mb-16"
          >
            {/*
             * カテゴリータイトルのレイアウト
             *
             * flex flex-col: 縦方向に要素を並べる（タイトル + 下線）
             * items-center: 中央揃え
             * gap-3/md:gap-4: タイトルと下線の間隔（レスポンシブ）
             */}
            <div className="flex flex-col items-center gap-3 md:gap-4">
              {/*
               * カテゴリー名の見出し
               *
               * スタイリング:
               * - text-xl/md:text-4xl/lg:text-5xl: レスポンシブなフォントサイズ
               * - font-normal: 太字ではなく通常の太さ（エレガントな印象）
               * - tracking-wide: 文字間隔を広めに（読みやすさとデザイン性）
               * - text-muted-foreground: 控えめな色（目立ちすぎないように）
               */}
              <h2 className="text-center text-xl font-normal tracking-wide text-muted-foreground md:text-4xl lg:text-5xl">
                {category.name}
              </h2>
              {/*
               * 装飾用の下線
               *
               * デザイン:
               * - h-px: 高さ1px（細い線）
               * - w-20/md:w-32: レスポンシブな幅
               * - bg-linear-to-r: 左右にグラデーション（中央が濃く、端が透明）
               * - via-border/60: 中央部分は border 色の60%透明度
               *
               * 意図: タイトルを視覚的に引き立てつつ、控えめで上品な印象を与える
               */}
              <div className="h-px w-20 bg-linear-to-r from-transparent via-border/60 to-transparent md:w-32" />
            </div>
          </motion.div>
        )}

        {/*
         * 商品グリッド（アニメーション付き）
         *
         * framer-motion の設定:
         * - variants={containerVariants}: スタッガーアニメーションのコンテナ設定
         * - initial="hidden": 初期状態（透明）
         * - whileInView="visible": ビューポートに入った時にアニメーション開始
         * - viewport.once: 一度だけアニメーション
         * - viewport.margin="-50px": ビューポートに入る50px前にアニメーション開始
         *   （早めにアニメーションを開始することで、スクロール時に自然に表示される）
         *
         * グリッドレイアウト:
         * - grid-cols-3: 常に3列（モバイルでも3列でコンパクトに表示）
         * - gap-4/md:gap-6/lg:gap-8: レスポンシブな間隔
         */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {products.map((product) => (
            /**
             * 商品タイル個別のアニメーション
             *
             * variants={itemVariants}: 個別のフェードイン + スライドアニメーション
             * containerVariants の staggerChildren により、順次表示される
             *
             * key={product.id}: React の key として一意なIDを使用
             */
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              {/*
               * 商品タイルコンポーネント
               *
               * product プロパティ:
               * - 必要最小限の情報（id, name, imageUrl）のみ渡す
               * - 理由: ProductTile は表示に必要な情報だけを受け取ることで、
               *   コンポーネント間の結合度を低く保つ
               *
               * onClick ハンドラー:
               * - クリック時に handleProductClick を呼び出してモーダルを開く
               * - 選択された商品の全情報を渡す（モーダルで詳細を表示するため）
               */}
              <ProductTile
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                }}
                onClick={() => handleProductClick(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/*
       * 商品詳細モーダル
       *
       * 動的インポート（SSR無効化）されたコンポーネント:
       * - product: 選択中の商品（null の場合はモーダルを表示しない）
       * - isOpen: モーダルの開閉状態
       * - onClose: モーダルを閉じる時のハンドラー
       *
       * 配置:
       * - グリッドセクションの外に配置することで、モーダルが独立して機能する
       * - useProductModal フックで状態を管理しているため、どの商品がクリックされても正しく動作
       */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
