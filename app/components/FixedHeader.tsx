/**
 * 固定ヘッダーコンポーネント (app/components/FixedHeader.tsx)
 *
 * 画面上部に固定表示されるヘッダーです。
 * すべてのページで共通して使用されます。
 *
 * 主な機能:
 * - 画面上部に固定表示（position: fixed）
 * - ロゴとナビゲーションリンクの表示
 * - Instagram へのリンク
 * - トップページでのみアニメーション表示
 * - レスポンシブ対応（モバイルファースト）
 *
 * 実装の特性:
 * - Client Component（usePathname によるルート判定、framer-motion のため）
 * - position: fixed のため、使用時はスペーサーが必須
 * - 高さは CSS 変数 --header-height（80px / 5rem）で一元管理
 *
 * 重要な注意点:
 * - このヘッダーは通常のドキュメントフローから外れるため、
 *   使用する際は直後にヘッダーの高さ分のスペーサーが必要
 *
 * @example
 * // 使用例（page.tsx）
 * <FixedHeader />
 * <div style={{ height: "var(--header-height)" }} /> // スペーサー必須
 * <main>...</main>
 *
 * ベストプラクティス:
 * - アニメーションはトップページのみ（パフォーマンス考慮）
 * - 高さは globals.css の CSS 変数で管理（一元管理）
 * - フォーカス管理（キーボードナビゲーション対応）
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ヘッダー全体のアニメーション設定（framer-motion）
 *
 * スタッガーアニメーション（順次表示）を実装:
 * - hidden: 初期状態（透明）
 * - visible: 表示状態（不透明）+ 子要素を順次アニメーション
 * - staggerChildren: 各子要素のアニメーション開始を0.1秒ずつずらす
 * - delayChildren: 0.2秒遅延してアニメーション開始
 *
 * 用途:
 * - トップページを開いた時に、ロゴとナビゲーションが順次表示される
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * ヘッダー内の各要素（ロゴ、ナビゲーション）のアニメーション設定
 *
 * フェードイン + 下方向へのスライドアニメーション:
 * - hidden: 初期状態（透明、上に10px移動）
 * - visible: 表示状態（不透明、元の位置）
 * - duration: 0.4秒でスムーズにアニメーション
 * - ease: "easeOut" で自然な減速カーブ
 *
 * 意図:
 * - ヘッダーの各要素が上から降りてくるような視覚効果
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * 固定ヘッダーコンポーネント
 *
 * 画面上部に固定表示されるヘッダーです。
 * ロゴ、Instagram リンク、ナビゲーションリンクを含みます。
 *
 * 構成要素:
 * - ロゴ画像: トップページへのリンク
 * - Instagram アイコン: 外部リンク（新しいタブで開く）
 * - ナビゲーションリンク: よくある質問ページへのリンク
 *
 * アニメーション:
 * - トップページ（pathname === "/"）でのみアニメーション実行
 * - 理由: 他のページではアニメーション不要（パフォーマンス考慮）
 *
 * アクセシビリティ:
 * - フォーカス管理（focus-visible:ring）
 * - aria-label（Instagram アイコン）
 * - セマンティックHTML（header, nav）
 */
export default function FixedHeader() {
  /**
   * 現在のパスを取得
   *
   * usePathname: Next.js の App Router のフック
   * 用途: トップページかどうかを判定してアニメーションの有無を切り替える
   */
  const pathname = usePathname();

  /**
   * トップページ判定
   *
   * true の場合: アニメーションを実行（initial="hidden"）
   * false の場合: アニメーションをスキップ（initial="visible"）
   */
  const isHomePage = pathname === "/";

  return (
    /**
     * ヘッダー要素（motion.header）
     *
     * アニメーション設定:
     * - initial: トップページなら "hidden"、それ以外は "visible"
     *   - 理由: トップページでのみアニメーション実行（パフォーマンス考慮）
     * - animate: "visible" 状態にアニメーション
     * - variants: containerVariants でスタッガーアニメーション
     *
     * レイアウト:
     * - fixed top-0 left-0 right-0: 画面上部に固定
     * - z-50: 他の要素の上に表示（z-index: 50）
     * - h-20: 高さ 80px（5rem）
     *   - 注意: globals.css の --header-height と一致させる必要がある
     * - border-b: 下部にボーダーを表示（コンテンツとの区切り）
     * - bg-background: 背景色（スクロール時に下のコンテンツが透けないように）
     */}
    <motion.header
      initial={isHomePage ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
      className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background"
    >
      {/*
       * ヘッダーのコンテンツコンテナ
       *
       * レイアウト:
       * - mx-auto max-w-6xl: 最大幅を制限して中央揃え
       * - flex items-center justify-between: 左右に要素を配置
       * - h-full: 親要素（header）の高さいっぱいに
       * - px-2/md:px-6: レスポンシブなパディング
       * - overflow-x-hidden: 横スクロールを防ぐ
       */}
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-2 md:px-6 overflow-x-hidden">
        {/*
         * 左側のコンテナ（ロゴ + Instagram）
         *
         * variants={itemVariants}: フェードイン + スライドアニメーション
         * containerVariants のスタッガー設定により、ナビゲーションより先に表示される
         *
         * relative: 子要素の絶対配置の基準点（必要に応じて）
         * flex items-center gap-4: 横並び、中央揃え、要素間に16pxの間隔
         * overflow-visible: ホバー時の拡大エフェクトが切れないように
         */}
        <motion.div
          variants={itemVariants}
          className="relative flex items-center gap-4 overflow-visible"
        >
          {/*
           * ロゴ画像（トップページへのリンク）
           *
           * インタラクション:
           * - transition-all: すべてのプロパティをスムーズに変化
           * - hover:opacity-80: ホバー時に少し透明に
           * - hover:scale-105: ホバー時に5%拡大
           * - active:scale-95: クリック時に5%縮小
           * - focus-visible:ring: キーボードフォーカス時にリングを表示
           *   - 理由: アクセシビリティ対応（キーボードナビゲーション）
           *
           * セマンティック:
           * - rounded-sm: フォーカスリングの角を少し丸める（デザイン性）
           */}
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {/*
             * ロゴ画像
             *
             * width/height: 画像の元サイズを指定（Next.js の最適化に必要）
             * priority: 優先的に読み込み（ヘッダーは最初に表示されるため）
             * style={{ width: "120px", height: "auto" }}: レスポンシブに高さを調整
             *   - 理由: アスペクト比を維持しつつ、幅を固定
             */}
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              priority
              style={{ width: "120px", height: "auto" }}
            />
          </Link>
          {/*
           * Instagram へのリンク
           *
           * target="_blank": 新しいタブで開く
           * rel="noopener noreferrer": セキュリティ対策
           *   - noopener: window.opener を使った攻撃を防ぐ
           *   - noreferrer: リファラー情報を送信しない
           * aria-label="Instagram": スクリーンリーダー用のラベル
           *   - 理由: アイコンのみなので、テキストラベルが必要
           *
           * インタラクション:
           * - hover:bg-accent: ホバー時に背景色を変更
           * - hover:scale-110: ホバー時に10%拡大
           * - rounded-full: 円形の背景
           * - p-2: パディングでクリック領域を広げる
           */}
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-all",
              "hover:bg-accent hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Instagram"
          >
            {/*
             * Instagram アイコン
             *
             * h-6 w-6/md:h-7 md:w-7: レスポンシブなサイズ
             *   - モバイル: 24px
             *   - デスクトップ: 28px
             */}
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6 md:h-7 md:w-7"
            />
          </a>
        </motion.div>

        {/*
         * 右側のナビゲーション
         *
         * variants={itemVariants}: フェードイン + スライドアニメーション
         * containerVariants のスタッガー設定により、ロゴの後に表示される
         *
         * flex items-center gap-4/md:gap-6: 横並び、中央揃え、レスポンシブな間隔
         */}
        <motion.nav
          variants={itemVariants}
          className="flex items-center gap-4 md:gap-6"
        >
          {/*
           * よくある質問へのリンク
           *
           * スタイリング:
           * - text-sm/md:text-base: レスポンシブなフォントサイズ
           * - font-medium: 少し太めのフォント
           * - text-foreground/70: 70%の透明度で控えめに表示
           * - hover:text-foreground: ホバー時に濃い色に変化
           * - active:scale-95: クリック時に縮小
           *
           * アンダーラインエフェクト（::after 疑似要素）:
           * - after:absolute: 絶対配置でリンクの下に配置
           * - after:bottom-0: 下端に配置
           * - after:h-[2px]: 高さ2px
           * - after:w-0: 初期状態は幅0（見えない）
           * - hover:after:w-full: ホバー時に幅100%（左から右へアニメーション）
           * - after:transition-all after:duration-300: 0.3秒でスムーズに変化
           *
           * 意図:
           * - ホバー時にアンダーラインが左から右へ伸びる視覚効果
           * - よりインタラクティブで魅力的なUI
           */}
          <Link
            href="/faq"
            className={cn(
              "relative text-sm font-medium transition-all md:text-base",
              "text-foreground/70 hover:text-foreground active:scale-95",
              "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all after:duration-300",
              "hover:after:w-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            )}
          >
            よくある質問
          </Link>
        </motion.nav>
      </div>
    </motion.header>
  );
}
