/**
 * カテゴリー別商品タブコンポーネント (app/components/ProductCategoryTabs.tsx)
 *
 * カテゴリーごとにタブで切り替えて商品を表示するコンポーネントです。
 *
 * 主な機能:
 * - カテゴリーをタブで切り替えて表示
 * - タブ切り替え時のスムーズなアニメーション
 * - 商品グリッドの動的インポートによる初回読み込みの高速化
 * - モバイル対応の横スクロールタブ
 *
 * 実装の特性:
 * - Client Component（タブの状態管理とアニメーションのため）
 * - next/dynamic による ProductGrid の遅延読み込み（パフォーマンス最適化）
 * - framer-motion によるタブコンテンツのフェードイン/アウトアニメーション
 *
 * ベストプラクティス:
 * - カテゴリーが1つの場合はタブUIを表示せず、直接グリッドを表示
 * - 商品がない場合は分かりやすいメッセージを表示
 * - タブリストは横スクロール可能（モバイル対応）
 */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { CategoryWithProducts } from "@/lib/products";

/**
 * ProductGrid コンポーネントの動的インポート
 *
 * 理由: ProductGrid は比較的大きなコンポーネントのため、初回読み込みを高速化するために
 * 動的インポートを使用してコード分割を行う。
 *
 * トレードオフ:
 * - 利点: 初回ページロードが高速化（ProductGrid のJSバンドルは後から読み込む）
 * - 欠点: タブ切り替え時に初回だけわずかな遅延が発生する可能性
 *
 * loading プロパティ:
 * - スケルトンスクリーンを表示してローディング状態を視覚化
 * - 6つの正方形のプレースホルダーを表示（一般的な商品グリッドの形に合わせる）
 * - animate-pulse: Tailwind のパルスアニメーションで読み込み中を示す
 */
const ProductGrid = dynamic(
  () => import("./ProductGrid"),
  {
    loading: () => (
      <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    ),
  }
);

/**
 * ProductCategoryTabs コンポーネントの Props 型定義
 *
 * @property categoriesWithProducts - カテゴリーと、そのカテゴリーに属する商品のリスト
 *   - 各要素は { category, products } の形式
 *   - lib/products.ts から取得したデータを渡す想定
 */
interface ProductCategoryTabsProps {
  categoriesWithProducts: CategoryWithProducts[];
}

/**
 * カテゴリー別商品タブコンポーネント
 *
 * カテゴリーをタブで切り替えて表示します。
 * タブ切り替え時にはフェードイン/アウトのアニメーションが適用されます。
 *
 * @param categoriesWithProducts - カテゴリーごとの商品データ
 *
 * 構成要素:
 * - TabsList: カテゴリーのタブボタンを横並びで表示（横スクロール対応）
 * - TabsContent: 選択中のカテゴリーの商品グリッドを表示
 * - AnimatePresence: タブ切り替え時のアニメーション制御
 * - ProductGrid: 商品一覧を表示するグリッドコンポーネント（動的インポート）
 *
 * 特殊ケースの処理:
 * - カテゴリーがない場合: "商品の準備中です" メッセージを表示
 * - カテゴリーが1つの場合: タブUIを表示せず、直接グリッドを表示（シンプル化）
 * - カテゴリーが複数の場合: タブUIで切り替え可能に
 */
export default function ProductCategoryTabs({
  categoriesWithProducts,
}: ProductCategoryTabsProps) {
  /**
   * 現在選択されているタブ（カテゴリーID）を管理
   *
   * 初期値: 最初のカテゴリーのID
   * 理由: ページ表示時に必ず何らかのカテゴリーが選択されている状態にするため
   * Optional chaining (?.) でカテゴリーがない場合に備える
   */
  const [activeTab, setActiveTab] = useState<string>(
    categoriesWithProducts[0]?.category.id.toString() || ""
  );

  /**
   * エッジケース1: カテゴリーが存在しない場合
   *
   * データベースに商品がない、またはすべて非公開の場合に発生
   * エラーページに遷移させずに、わかりやすいメッセージを表示
   *
   * デザイン:
   * - min-h-[50vh]: 最低限の高さを確保してコンテンツが小さくなりすぎないように
   * - flex + items-center + justify-center: 縦横中央配置
   * - text-muted-foreground: 控えめな色でメッセージを表示
   */
  if (categoriesWithProducts.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-center text-muted-foreground">
          商品の準備中です
        </p>
      </div>
    );
  }

  /**
   * エッジケース2: カテゴリーが1つの場合
   *
   * タブUIを表示する必要がないため、直接ProductGridを表示
   * 理由: タブが1つしかない場合、切り替えUIは不要でシンプルな表示の方が良い
   *
   * トレードオフ:
   * - 利点: UIがシンプルになり、不要な要素を表示しない
   * - 欠点: カテゴリーが2つ以上になった時にUIが変わる（一貫性に欠ける可能性）
   *
   * Optional chaining で配列の最初の要素が存在しない場合に備える
   */
  if (categoriesWithProducts.length === 1) {
    const firstCategory = categoriesWithProducts[0];
    if (!firstCategory) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-muted-foreground">
            商品の準備中です
          </p>
        </div>
      );
    }
    return (
      <ProductGrid
        category={firstCategory.category}
        products={firstCategory.products}
      />
    );
  }

  /**
   * メインレンダリング: カテゴリーが複数ある場合
   *
   * shadcn/ui の Tabs コンポーネントを使用してカテゴリーを切り替え
   */
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      {/*
       * タブリスト（カテゴリー選択UI）
       *
       * デザイン:
       * - mb-8/md:mb-12/lg:mb-16: レスポンシブな下マージン（画面サイズに応じて調整）
       * - h-auto: タブの高さを自動調整（デフォルトの固定高を上書き）
       * - overflow-x-auto: カテゴリーが多い場合に横スクロール可能（モバイル対応）
       * - bg-transparent: 背景を透明にして、ページ全体の背景色に馴染ませる
       * - p-0: デフォルトのパディングを削除してカスタマイズ
       *
       * モバイルファースト:
       * - スマホでは横スクロール可能なタブリスト
       * - タブレット/デスクトップではスペースに余裕があれば横並びで表示
       */}
      <TabsList className="mb-8 h-auto w-full justify-start overflow-x-auto bg-transparent p-0 md:mb-12 lg:mb-16">
        <div className="flex gap-2 md:gap-4">
          {categoriesWithProducts.map(({ category }) => (
            /**
             * 各カテゴリーのタブボタン
             *
             * スタイリング:
             * - rounded-none: 角を丸めない（ボーダーラインのデザインに合わせる）
             * - border-b-2: 下線でアクティブ状態を表現
             * - bg-transparent: 背景は常に透明（アクティブ時も変えない）
             * - text-sm/md:text-lg/lg:text-xl: レスポンシブなフォントサイズ
             *
             * 状態に応じたスタイル:
             * - デフォルト: text-muted-foreground（控えめな色）、border-transparent（ボーダーなし）
             * - hover: text-foreground（濃い色に変化）
             * - data-[state=active]: border-border（下線を表示）、text-foreground（濃い色）
             *
             * 注意: data-[state=active]:shadow-none で shadcn/ui デフォルトの影を削除
             * 理由: 下線のみでアクティブ状態を表現するデザインのため
             */
            <TabsTrigger
              key={category.id}
              value={category.id.toString()}
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-normal text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none md:text-lg lg:text-xl"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </div>
      </TabsList>

      {/*
       * タブコンテンツ（商品グリッド）
       *
       * AnimatePresence（framer-motion）:
       * - mode="wait": 前のコンテンツが完全に消えてから次のコンテンツを表示
       * - タブ切り替え時にスムーズなフェードイン/アウトアニメーションを実現
       *
       * 実装の理由:
       * - ユーザーがタブを切り替えた時に、急に内容が入れ替わるのではなく
       *   滑らかにアニメーションすることで、視覚的に心地よい体験を提供
       */}
      <AnimatePresence mode="wait">
        {categoriesWithProducts.map(({ category, products }) => (
          <TabsContent
            key={category.id}
            value={category.id.toString()}
            className="mt-0"
            forceMount
          >
            {/*
             * forceMount の理由:
             * - TabsContent はデフォルトでアクティブなタブのみDOMにマウントする
             * - AnimatePresence のアニメーションを機能させるには、
             *   非アクティブなタブもDOMに存在する必要がある
             * - そのため forceMount で常にマウントし、条件分岐で表示を制御
             *
             * activeTab === category.id.toString() の条件分岐:
             * - アクティブなタブのみ motion.div をレンダリング
             * - これにより、アニメーションが正しく動作する
             */}
            {activeTab === category.id.toString() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/*
                 * motion.div のアニメーション設定:
                 * - initial: 初期状態（透明度0、下に10px移動）
                 * - animate: アニメーション後の状態（透明度1、元の位置）
                 * - exit: 消える時の状態（透明度0、上に10px移動）
                 * - duration: 0.3秒で滑らかに遷移
                 *
                 * 意図:
                 * - フェードイン + 下から上へスライド（登場時）
                 * - フェードアウト + 上へスライド（退場時）
                 * - 0.3秒という短い時間でスナッピーな体験を提供
                 */}
                <ProductGrid
                  category={category}
                  products={products}
                  showCategoryTitle={false}
                />
              </motion.div>
            )}
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}
