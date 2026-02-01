/**
 * ルートレイアウト (app/layout.tsx)
 *
 * Next.js アプリケーション全体の基盤となるレイアウトファイルです。
 * すべてのページで共通して使用される HTML 構造、フォント設定、グローバルスタイル、
 * アナリティクスなどを定義します。
 *
 * 主な機能:
 * - HTML のルート構造（<html>, <body>）を定義
 * - Noto Sans JP フォントの読み込みと適用
 * - グローバル CSS の読み込み
 * - Vercel Analytics の組み込み
 *
 * 実装の特性:
 * - Server Component（すべてのページで共有される）
 * - Next.js の App Router では必須のファイル
 * - メタデータ（title, description, OGP）を定義
 *
 * 注意点:
 * - このファイルの変更はアプリケーション全体に影響します
 * - フォント設定は CSS 変数として提供され、Tailwind で使用可能
 * - lang 属性を "ja" に設定することで、日本語コンテンツとして検索エンジンに認識される
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
 */
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Noto Sans JP フォントの設定
 *
 * Google Fonts から Noto Sans JP を読み込み、アプリケーション全体で使用します。
 *
 * フォントの選択理由:
 * - 日本語と英数字の両方で可読性が高い
 * - Google Fonts が提供する無料フォントで、ライセンスの心配がない
 * - 多様なウェイト（太さ）をサポートし、デザインの柔軟性が高い
 *
 * 設定の詳細:
 * - variable: CSS 変数名（--font-noto-sans-jp）として定義
 *   → Tailwind の font-sans クラスで使用される（tailwind.config.ts で設定）
 * - subsets: ["latin"] を指定してフォントファイルサイズを最適化
 *   → 日本語フォントは自動的に含まれるため、latin のみ明示的に指定
 * - weight: 4段階（300=Light, 400=Regular, 500=Medium, 700=Bold）
 *   → 見出しから本文まで幅広いデザインに対応
 *
 * パフォーマンス最適化:
 * - Next.js が自動的にフォントを最適化（@next/font）
 * - ビルド時にフォントファイルをダウンロードし、self-host 化
 * - 外部リクエストを削減し、FOUT（Flash of Unstyled Text）を防ぐ
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

/**
 * サイト全体のメタデータ
 *
 * アプリケーション全体で使用されるメタデータを定義します。
 * SEO（検索エンジン最適化）と SNS シェア時の表示を改善するために設定します。
 *
 * 各フィールドの役割:
 *
 * - title: ブラウザタブとGoogle検索結果に表示されるタイトル
 *   → "白熊堂 | 本格かき氷のお店" のようにブランド名と簡潔な説明を含める
 *   → Google検索でクリック率を高めるため、魅力的で分かりやすいタイトルに
 *
 * - description: Google検索結果のスニペット（要約文）に表示される説明文
 *   → 120〜160文字程度が推奨（長すぎると省略される）
 *   → ユーザーが検索結果でクリックしたくなるような魅力的な説明
 *
 * - icons: ブラウザタブに表示されるファビコン
 *   → /public/favicon.ico に配置されたアイコンファイルを指定
 *   → ブランド認知と視認性向上のため
 *
 * - openGraph: SNS（Twitter、Facebook、LINE等）でシェアされた際の表示内容
 *   → OGP（Open Graph Protocol）に基づく設定
 *   → title と description を設定することで、SNSでのシェア時に魅力的なカードを表示
 *   → type: "website" はサイト全体を示す（個別記事の場合は "article" を使う）
 *
 * SEO の重要性:
 * - Google などの検索エンジンがサイト内容を理解するための重要な情報源
 * - 適切なメタデータは検索順位とクリック率の向上に直結
 * - SNS でのシェア時の見栄えが良いと、拡散されやすくなる
 *
 * 注意点:
 * - 各ページで異なるメタデータを設定したい場合は、各 page.tsx で上書き可能
 * - このファイルのメタデータはデフォルト値として機能
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 * @see https://ogp.me/ （OGPの仕様）
 */
export const metadata: Metadata = {
  title: "白熊堂 | 本格かき氷のお店",
  description:
    "白熊堂は本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    type: "website",
  },
};

/**
 * ルートレイアウトコンポーネント
 *
 * Next.js の App Router におけるルートレイアウトです。
 * すべてのページで共通して使用される HTML 構造を定義し、
 * フォント、グローバルスタイル、アナリティクスなどを統合します。
 *
 * 主な機能:
 * - HTML のルート構造（<html>, <body>）を定義
 * - Noto Sans JP フォントを CSS 変数として提供
 * - グローバル CSS（globals.css）を読み込み
 * - Vercel Analytics を全ページに統合
 *
 * 実装の特性:
 * - Server Component（デフォルト）: クライアント側の JavaScript を削減
 * - Next.js の App Router では必須のファイル
 * - すべてのページの親コンポーネントとして機能
 *
 * フォント適用の仕組み:
 * - notoSansJP.variable で CSS 変数（--font-noto-sans-jp）を <body> に追加
 * - Tailwind CSS の font-sans クラスがこの変数を参照（tailwind.config.ts で設定）
 * - これにより、全ページで統一されたフォントが適用される
 *
 * なぜ Server Component なのか:
 * - レイアウトは静的な構造のため、クライアント側の JavaScript は不要
 * - サーバー側でレンダリングすることで、初回ページ表示が高速化
 * - フォント設定やメタデータはサーバー側で処理される
 *
 * @param props - コンポーネントのプロパティ
 * @param props.children - 各ページのコンテンツが挿入される場所
 *   - App Router では、page.tsx の内容がここに挿入される
 *   - ページ遷移時も <html> と <body> は再レンダリングされない（children のみ更新）
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * HTML ルート要素
     * lang="ja": 日本語コンテンツであることを宣言
     * 理由:
     * - 検索エンジンが言語を正しく認識し、適切な検索結果に表示される
     * - スクリーンリーダーが日本語として読み上げる
     * - ブラウザが適切な辞書を使用（スペルチェック、翻訳提案など）
     */
    <html lang="ja">
      {/*
       * Body 要素
       *
       * className の構成:
       * - ${notoSansJP.variable}: CSS 変数 --font-noto-sans-jp を定義
       *   → Tailwind の font-sans クラスで使用される
       * - antialiased: フォントのアンチエイリアシングを有効化
       *   → テキストの輪郭を滑らかに表示し、可読性を向上
       *   → Tailwind CSS のユーティリティクラス
       */}
      <body className={`${notoSansJP.variable} antialiased`}>
        {/*
         * ページコンテンツ
         * 各 page.tsx の内容がここに挿入されます
         */}
        {children}

        {/*
         * Vercel Analytics
         *
         * アプリケーションのアクセス解析を行うコンポーネントです。
         *
         * 機能:
         * - ページビュー、ユニークビジター、滞在時間などを計測
         * - Vercel ダッシュボードで確認可能
         *
         * 配置場所の理由:
         * - </body> の直前に配置することで、全ページのアクセスを追跡
         * - コンテンツの読み込みを妨げないよう、最後に配置
         *
         * プライバシー:
         * - Vercel Analytics は GDPR 準拠
         * - Cookie を使用せず、個人情報を収集しない
         *
         * パフォーマンス:
         * - 軽量なスクリプト（約 1KB）で、ページ速度への影響は最小限
         *
         * @see https://vercel.com/docs/analytics
         */}
        <Analytics />
      </body>
    </html>
  );
}
