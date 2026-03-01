/**
 * オンラインショップページ
 *
 * ECサイト機能の準備中メッセージを表示するプレースホルダーページ。
 */
import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "オンラインショップ",
  description:
    "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  alternates: {
    canonical: `${BASE_URL}/shop`,
  },
  openGraph: {
    title: "オンラインショップ | 白熊堂",
    description:
      "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
    type: "website",
    url: `${BASE_URL}/shop`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "白熊堂 - 本格かき氷のお店",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "オンラインショップ | 白熊堂",
    description:
      "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
    images: ["/og-image.png"],
  },
};

export default function ShopPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6 text-6xl">🏪</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          オンラインショップ
        </h1>
        <p className="mb-8 text-gray-600">
          オンラインショップは現在準備中です
          <br />
          もうしばらくお待ちください
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-all hover:bg-gray-800 active:scale-95"
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
