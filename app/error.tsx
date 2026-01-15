"use client";

/**
 * エラーハンドリング用のコンポーネント
 * Next.js App Routerのerror.tsxファイル
 * Server Componentsでエラーが発生した場合に表示されます
 */

/**
 * Error コンポーネントの Props
 */
interface ErrorProps {
  error: Error & { digest?: string }; // 発生したエラーオブジェクト（digestはNext.jsが自動的に付与するエラー識別子）
  reset: () => void; // エラー状態をリセットして再試行する関数
}

/**
 * エラーページコンポーネント
 *
 * Server Componentsでエラーが発生した場合に表示されるエラーページです。
 * ユーザーにエラーが発生したことを通知し、再試行できるようにします。
 *
 * Client Component として実装されており、エラー情報を表示します。
 *
 * @param error - 発生したエラーオブジェクト
 * @param reset - エラー状態をリセットして再試行する関数
 */
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
          className="rounded bg-gray-800 px-6 py-3 text-white transition-colors hover:bg-gray-700"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
