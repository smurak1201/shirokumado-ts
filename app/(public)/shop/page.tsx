/**
 * オンラインショップページ
 *
 * ECサイト機能の準備中メッセージを表示するプレースホルダーページ。
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "オンラインショップ",
  description:
    "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  openGraph: {
    title: "オンラインショップ | 白熊堂",
    description:
      "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  },
};

export default function ShopPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
    </div>
  );
}
