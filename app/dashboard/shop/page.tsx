import Link from 'next/link';

/**
 * ECサイト管理ダッシュボードページ（プレースホルダ）
 *
 * ECサイト機能が実装されるまでの仮ページです。
 * 「準備中」メッセージを表示します。
 */
export default function ShopDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-49px)] items-center justify-center">
      <div className="text-center">
        <div className="mb-6 text-6xl">🛒</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          ECサイト管理
        </h1>
        <p className="mb-8 text-gray-600">
          このページは現在準備中です
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-all hover:bg-gray-800 active:scale-95"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
