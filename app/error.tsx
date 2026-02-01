/**
 * エラーページ (app/error.tsx)
 *
 * Next.js App Routerのエラーバウンダリファイルです。
 * Server Componentsでエラーが発生した場合に自動的に表示されます。
 *
 * 主な機能:
 * - エラーメッセージの表示（ユーザーフレンドリーなメッセージ）
 * - 開発環境ではエラー詳細を表示（デバッグ支援）
 * - 再試行ボタン（エラー状態をリセット）
 *
 * 実装の特性:
 * - Client Component（"use client"ディレクティブが必須）
 * - Next.jsのエラーバウンダリ機能を利用
 *
 * Client Componentにする理由:
 * - reset()関数（エラーリセット）はクライアント側でのみ動作
 * - インタラクティブなUI（ボタンクリック）が必要
 * - Next.jsの仕様により、error.tsxは必ずClient Componentである必要がある
 *
 * Next.jsのエラーバウンダリの仕組み:
 * 1. Server Componentやレイアウトでエラーが発生
 * 2. Next.jsが自動的にerror.tsxを表示
 * 3. errorオブジェクト（エラー情報）とreset関数が渡される
 * 4. reset()を呼ぶと、エラーが発生したコンポーネントが再レンダリングされる
 *
 * セキュリティ考慮事項:
 * - 本番環境ではエラー詳細を隠す（error.digestのみ表示）
 * - 開発環境のみエラーメッセージを表示（デバッグ支援）
 *
 * トレードオフ:
 * - ユーザー体験: エラーを隠すことでセキュリティは向上するが、ユーザーは原因を特定できない
 * - デバッグ: 開発環境では詳細を表示することで問題を素早く特定できる
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
"use client";

/**
 * Error コンポーネントの Props
 *
 * Next.jsが自動的に渡すプロパティです。
 */
interface ErrorProps {
  /**
   * 発生したエラーオブジェクト
   *
   * digest: Next.jsが自動的に付与するエラー識別子
   * - サーバー側ログとクライアント側エラーを紐付けるために使用
   * - 本番環境ではこのdigestのみをユーザーに表示すべき
   */
  error: Error & { digest?: string };

  /**
   * エラー状態をリセットして再試行する関数
   *
   * reset()を呼ぶと:
   * 1. エラーバウンダリがリセットされる
   * 2. エラーが発生したコンポーネントが再レンダリングされる
   * 3. 一時的なエラー（ネットワーク等）なら復旧する可能性がある
   *
   * 注意: reset()はクライアント側でのみ動作するため、Client Componentが必須
   */
  reset: () => void;
}

/**
 * エラーページコンポーネント
 *
 * Server Componentsでエラーが発生した場合に表示されるエラーページです。
 * ユーザーにエラーが発生したことを通知し、再試行できるようにします。
 *
 * デザイン方針:
 * - シンプルで分かりやすいUI（最小限の情報のみ表示）
 * - 再試行ボタンで自己解決を促す
 * - 開発環境では詳細情報を表示してデバッグを支援
 *
 * @param error - 発生したエラーオブジェクト（Next.jsが自動的に渡す）
 * @param reset - エラー状態をリセットして再試行する関数（Next.jsが自動的に渡す）
 */
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/*
       * エラーメッセージカード
       *
       * レイアウト:
       * - max-w-md: 最大幅を448pxに制限（読みやすい幅）
       * - text-center: すべてのテキストを中央揃え
       *
       * デザインの意図:
       * - シンプルで分かりやすいレイアウト
       * - エラーであることを強調しすぎない（ユーザーを不安にさせない）
       */}
      <div className="max-w-md text-center">
        {/*
         * エラータイトル
         * エラーが発生したことを明確に伝える
         *
         * text-2xl font-bold: 見出しとして十分なサイズと太さ
         * text-gray-800: 濃いグレーで視認性を確保（黒だと強すぎる）
         */}
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          エラーが発生しました
        </h1>

        {/*
         * エラー説明文
         * ユーザーフレンドリーなメッセージで状況を説明
         *
         * 方針:
         * - 技術的な詳細は隠す（ユーザーには不要）
         * - 丁寧な言葉遣いで謝罪
         * - 再試行を促す（下のボタンへの導線）
         */}
        <p className="mb-6 text-gray-600">
          申し訳ございませんが、ページの読み込み中にエラーが発生しました。
        </p>

        {/*
         * エラー詳細セクション（開発環境のみ）
         *
         * process.env.NODE_ENV === "development":
         * - 開発環境（npm run dev）でのみ表示
         * - 本番環境では表示されない（セキュリティとUX向上のため）
         *
         * 表示する理由:
         * - 開発者がエラー原因を素早く特定できる
         * - デバッグ時間を短縮
         *
         * 本番環境で隠す理由:
         * - セキュリティ: エラーメッセージから内部構造が推測される可能性
         * - UX: 技術的な詳細はユーザーを混乱させる
         *
         * <details>要素:
         * - 折りたたみ可能な要素（クリックで展開）
         * - デフォルトで閉じているため、画面が散らからない
         */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded bg-gray-100 p-4 text-left">
            {/*
             * 折りたたみのラベル
             * cursor-pointer: クリック可能であることを示す
             */}
            <summary className="cursor-pointer font-semibold text-gray-800">
              エラー詳細（開発環境のみ）
            </summary>

            {/*
             * エラーメッセージの表示
             *
             * <pre>要素: 整形済みテキストとして表示
             * - 改行やスペースがそのまま表示される
             * - エラースタックトレースを読みやすく表示
             *
             * overflow-auto: 長いエラーメッセージは横スクロール
             * text-sm: 小さめのフォントで詳細情報を表示
             *
             * error.message: エラーの本文
             * error.digest: Next.jsが付与するエラー識別子（ログと紐付け可能）
             */}
            <pre className="mt-2 overflow-auto text-sm text-gray-700">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/*
         * 再試行ボタン
         *
         * onClick={reset}:
         * - Next.jsが提供するreset関数を呼び出す
         * - エラーバウンダリをリセットし、コンポーネントを再レンダリング
         * - 一時的なエラー（ネットワーク障害等）なら復旧する可能性がある
         *
         * ビジュアル:
         * - rounded: 角丸で親しみやすい印象
         * - bg-gray-800: 濃いグレー背景でCTAボタンを強調
         * - px-6 py-3: 適度なパディングでクリックしやすいサイズ
         *
         * インタラクション:
         * - hover:bg-gray-700: ホバー時に少し明るくして反応を示す
         * - transition-colors: 色変化をスムーズにアニメーション
         * - cursor-pointer: ポインターカーソルでクリック可能を示す
         *
         * アクセシビリティ:
         * - 明確なラベル（「もう一度試す」）
         * - 十分なコントラスト比（白文字 on 濃いグレー背景）
         */}
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
