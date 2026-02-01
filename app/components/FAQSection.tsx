/**
 * FAQセクションコンポーネント (app/components/FAQSection.tsx)
 *
 * よくある質問（FAQ）をアコーディオン形式で表示するコンポーネントです。
 *
 * 主な機能:
 * - アコーディオン形式での質問と回答の表示
 * - 質問をクリックすると回答が展開される
 * - スクロール時のスタッガーアニメーション（順次表示）
 * - 質問番号バッジの表示（Q1, Q2, ...）
 * - オプションでセクションタイトルを表示
 *
 * 実装の特性:
 * - Client Component（framer-motion によるアニメーションのため）
 * - shadcn/ui の Accordion コンポーネントを使用
 * - レスポンシブ対応（モバイルファースト）
 *
 * ベストプラクティス:
 * - アニメーション設定は lib/config.ts で一元管理
 * - FAQ データは app/faq/data.ts で管理（コンポーネントとデータを分離）
 * - アコーディオンは一度に1つのみ開く（type="single"）
 */
"use client";

import { motion, type Variants } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { QuestionBadge } from "./ui/badge-question";
import { Separator } from "./ui/separator";
import { config } from "@/lib/config";
import type { FAQ } from "@/app/faq/data";
import { cn } from "@/lib/utils";

/**
 * FAQ リスト全体のアニメーション設定（framer-motion）
 *
 * スタッガーアニメーション（順次表示）を実装:
 * - hidden: 初期状態（透明）
 * - visible: 表示状態（不透明）+ 各FAQ項目を順次アニメーション
 * - staggerChildren: 各FAQ項目のアニメーション開始を少しずつずらす
 *
 * 設定値は lib/config.ts から取得
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
 * FAQ 個別項目のアニメーション設定
 *
 * フェードイン + 上方向へのスライドアニメーション:
 * - hidden: 初期状態（透明、下に20px移動）
 * - visible: 表示状態（不透明、元の位置）
 * - duration: lib/config.ts から取得
 * - ease: "easeOut" で自然な減速カーブ
 *
 * 意図:
 * - FAQ項目が下から浮かび上がってくるような視覚効果
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
 * セクションタイトルのアニメーション設定
 *
 * フェードイン + 下方向へのスライドアニメーション:
 * - hidden: 初期状態（透明、上に10px移動）
 * - visible: 表示状態（不透明、元の位置）
 * - duration: スクロールアニメーションの時間（lib/config.ts から取得）
 *
 * 意図:
 * - タイトルが上から降りてくるような視覚効果
 * - FAQ項目とは逆方向のアニメーションで変化を付ける
 */
const titleVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.SCROLL_ANIMATION_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

/**
 * FAQSection コンポーネントの Props 型定義
 *
 * @property faqs - FAQ データの配列（app/faq/data.ts から取得）
 * @property showTitle - セクションタイトルを表示するか（デフォルト: false）
 *   - トップページなど、既にタイトルがある場合は false にして重複を避ける
 */
interface FAQSectionProps {
  faqs: FAQ[];
  showTitle?: boolean;
}

/**
 * FAQセクションコンポーネント
 *
 * よくある質問をアコーディオン形式で表示します。
 * スクロール時にスタッガーアニメーション（順次表示）が適用されます。
 *
 * @param faqs - FAQ データの配列
 * @param showTitle - セクションタイトルを表示するか
 *
 * 構成要素:
 * - セクションタイトル（オプション）
 * - Accordion: 質問と回答のリスト
 * - QuestionBadge: 質問番号（Q1, Q2, ...）
 */
export default function FAQSection({
  faqs,
  showTitle = false,
}: FAQSectionProps) {
  return (
    <>
      {/*
       * セクションタイトル（オプション）
       *
       * showTitle が true の場合のみ表示
       * 用途: FAQページでは表示、トップページでは非表示など、用途に応じて切り替え
       */}
      {showTitle && (
        /**
         * タイトルコンテナ（アニメーション付き）
         *
         * variants={titleVariants}: フェードイン + 下方向へのスライド
         * whileInView="visible": ビューポートに入った時にアニメーション開始
         * viewport.once: 一度だけアニメーション（スクロールのたびに再生しない）
         *
         * レイアウト:
         * - mb-10/md:mb-12: タイトルとFAQリストの間隔（レスポンシブ）
         * - flex flex-col items-center: 縦方向に要素を並べ、中央揃え
         * - gap-4: タイトルと下線の間隔
         */
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex flex-col items-center gap-4 md:mb-12"
        >
          {/*
           * タイトル見出し
           *
           * text-2xl/md:text-3xl/lg:text-4xl: レスポンシブなフォントサイズ
           * font-normal: 太字ではなく通常の太さ（エレガントな印象）
           * tracking-wide: 文字間隔を広めに（読みやすさとデザイン性）
           * text-muted-foreground: 控えめな色
           */}
          <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          {/*
           * 装飾用の下線
           *
           * w-20/md:w-32: レスポンシブな幅
           * 理由: タイトルを視覚的に引き立てつつ、控えめで上品な印象を与える
           */}
          <Separator className="w-20 md:w-32" />
        </motion.div>
      )}

      {/*
       * FAQリストコンテナ（アニメーション付き）
       *
       * variants={containerVariants}: スタッガーアニメーションのコンテナ設定
       * whileInView="visible": ビューポートに入った時にアニメーション開始
       * viewport.once: 一度だけアニメーション
       * viewport.margin="0px 0px -100px 0px": ビューポートの下端から100px上でアニメーション開始
       *   - 理由: 早めにアニメーションを開始することで、スクロール時に自然に表示される
       */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      >
        {/*
         * Accordion: アコーディオンコンポーネント（shadcn/ui）
         *
         * type="single": 一度に1つの項目のみ開く
         *   - 理由: 複数の項目を開くと縦に長くなりすぎて、ユーザーが迷子になる
         * collapsible: 開いている項目をクリックすると閉じられる
         * space-y-3: 各FAQ項目の間に12pxの間隔
         */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            /**
             * FAQ項目個別のアニメーション
             *
             * key={faq.question}: React の key として質問文を使用
             *   - 理由: 質問文は一意であることが期待される
             * variants={itemVariants}: フェードイン + スライドアニメーション
             * containerVariants のスタッガー設定により、順次表示される
             */
            <motion.div key={faq.question} variants={itemVariants}>
              {/*
               * AccordionItem: アコーディオンの各項目
               *
               * value: 一意な識別子（faq-0, faq-1, ...）
               *
               * スタイリング:
               * - rounded-lg: 角を丸める
               * - border border-border/60: 透明度60%のボーダー
               * - px-4: 左右にパディング
               *
               * インタラクション:
               * - transition-all duration-300: すべてのプロパティを0.3秒でスムーズに変化
               * - hover:border-primary/30: ホバー時にボーダー色を変更（プライマリカラー30%）
               * - hover:shadow-lg: ホバー時に影を表示
               * - hover:shadow-primary/5: 影の色（プライマリカラー5%）
               * - data-[state=open]:border-primary/40: 開いている時のボーダー色
               * - data-[state=open]:bg-primary/5: 開いている時の背景色
               *
               * 意図:
               * - ホバー時と開いている時に視覚的なフィードバックを提供
               * - 現在の状態（閉じている/ホバー中/開いている）が一目でわかる
               */}
              <AccordionItem
                value={`faq-${index}`}
                className={cn(
                  "rounded-lg border border-border/60 px-4",
                  "transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                  "data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5"
                )}
              >
                {/*
                 * AccordionTrigger: クリックして開閉するトリガー要素
                 *
                 * gap-3/md:gap-4: 内部要素の間隔（レスポンシブ）
                 * py-4: 上下にパディング（クリック領域を広げる）
                 * hover:no-underline: ホバー時にデフォルトの下線を表示しない
                 *   - 理由: shadcn/ui のデフォルトスタイルを上書き
                 */}
                <AccordionTrigger className="gap-3 py-4 hover:no-underline md:gap-4">
                  {/*
                   * 質問の表示エリア
                   *
                   * flex items-center gap-3/md:gap-4: 横並び、中央揃え、間隔
                   * 構成: 質問番号バッジ + 質問文
                   */}
                  <div className="flex items-center gap-3 md:gap-4">
                    {/*
                     * 質問番号バッジ（Q1, Q2, ...）
                     *
                     * QuestionBadge: カスタムコンポーネント（ui/badge-question.tsx）
                     * index + 1: 配列のインデックスは0始まりなので、1を足して表示
                     * 理由: ユーザーにとって「Q1」の方が「Q0」より自然
                     */}
                    <QuestionBadge>Q{index + 1}</QuestionBadge>
                    {/*
                     * 質問文
                     *
                     * text-left: 左揃え（中央揃えではなく）
                     * text-base/md:text-lg: レスポンシブなフォントサイズ
                     * font-normal: 太字ではなく通常の太さ
                     * leading-relaxed: 行間をゆったりと（複数行の質問でも読みやすく）
                     * text-foreground: 標準の文字色（目立たせる）
                     */}
                    <span className="text-left text-base font-normal leading-relaxed text-foreground md:text-lg">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                {/*
                 * AccordionContent: 展開される回答エリア
                 *
                 * 展開/折りたたみのアニメーションは shadcn/ui が自動的に処理
                 */}
                <AccordionContent>
                  {/*
                   * 回答のコンテナ
                   *
                   * ml-0/md:ml-12: レスポンシブな左マージン
                   *   - モバイル: マージンなし（画面幅が狭いため）
                   *   - デスクトップ: 48px（質問番号バッジの幅に合わせてインデント）
                   * pb-2: 下にパディング（AccordionContent の余白調整）
                   *
                   * 理由: デスクトップでは回答を質問文と揃えて、視覚的な階層を作る
                   */}
                  <div className="ml-0 pb-2 md:ml-12">
                    {/*
                     * 回答文
                     *
                     * text-sm/md:text-base: レスポンシブなフォントサイズ
                     *   - 質問文よりわずかに小さく（階層を表現）
                     * leading-relaxed: 行間をゆったりと（長文でも読みやすく）
                     * text-muted-foreground: 控えめな色（質問文より目立たない）
                     */}
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </>
  );
}
