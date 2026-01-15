import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Noto Sans JP フォントの設定
 * 日本語表示に最適化されたフォントを読み込みます
 */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

/**
 * サイト全体のメタデータ
 * SEO対策とSNSシェア時の表示に使用されます
 */
export const metadata: Metadata = {
  title: "白熊堂 | 本格かき氷のお店",
  description:
    "白熊堂は本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
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
 * 全ページ共通のレイアウトを定義します。
 * - HTMLの基本構造
 * - フォント設定
 * - Vercel Analyticsの設定
 *
 * Server Component として実装されており、全ページで使用されます。
 *
 * @param children - ページコンテンツ
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
