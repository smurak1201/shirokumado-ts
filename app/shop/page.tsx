import Link from 'next/link';

/**
 * ECサイト表示ページ（プレースホルダ）
 *
 * ECサイト機能が実装されるまでの仮ページです。
 * 「準備中」メッセージを表示します。
 */
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
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
