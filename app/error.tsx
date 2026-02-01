/**
 * エラーページ
 *
 * Next.js App Routerのエラーバウンダリ。
 * Client Component（reset関数の使用にはクライアント側の処理が必要）。
 */
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          エラーが発生しました
        </h1>
        <p className="mb-6 text-gray-600">
          申し訳ございませんが、ページの読み込み中にエラーが発生しました。
        </p>

        {/* 設計判断: 開発環境のみエラー詳細を表示（デバッグ支援） */}
        {/* 本番環境では非表示（セキュリティとUX向上のため） */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded bg-gray-100 p-4 text-left">
            <summary className="cursor-pointer font-semibold text-gray-800">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-2 overflow-auto text-sm text-gray-700">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <button
          onClick={reset}
          className="rounded bg-gray-800 px-6 py-3 text-white transition-colors hover:bg-gray-700 cursor-pointer"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
