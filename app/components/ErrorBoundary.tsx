/**
 * エラーバウンダリーコンポーネント (app/components/ErrorBoundary.tsx)
 *
 * React のエラーバウンダリー機能を実装したコンポーネントです。
 * 子コンポーネントのレンダリング中に発生したエラーをキャッチし、
 * フォールバックUIを表示します。
 *
 * 主な機能:
 * - 子コンポーネントのエラーをキャッチ
 * - エラー発生時にカスタムUIを表示
 * - エラー情報をロガーに記録
 * - 再試行ボタンによるエラーリセット機能
 * - 開発環境でのみエラー詳細を表示
 *
 * 実装の特性:
 * - クラスコンポーネント（React のエラーバウンダリーは関数コンポーネントで実装不可）
 * - Client Component（状態管理とエラーハンドリングのため）
 * - lib/logger によるエラーログ記録
 *
 * 使用例:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * ベストプラクティス:
 * - アプリケーション全体を包むのではなく、適切な粒度で配置
 * - エラー情報はログに記録して、運用者が確認できるようにする
 * - 本番環境ではエラー詳細を表示しない（セキュリティ対策）
 *
 * 参考:
 * - React 公式ドキュメント: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
"use client";

import { Component, type ReactNode } from "react";
import { log } from "@/lib/logger";

/**
 * ErrorBoundary コンポーネントの Props 型定義
 *
 * @property children - エラーバウンダリーで保護する子要素
 * @property fallback - エラー発生時に表示するカスタムUI（オプション）
 *   - 指定しない場合はデフォルトのエラーUIを表示
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ErrorBoundary コンポーネントの State 型定義
 *
 * @property hasError - エラーが発生しているか
 * @property error - 発生したエラーオブジェクト（null の場合はエラーなし）
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * エラーバウンダリーコンポーネント
 *
 * React のエラーバウンダリー機能を実装したクラスコンポーネントです。
 * 子コンポーネントで発生したエラーをキャッチし、エラーUIを表示します。
 *
 * クラスコンポーネントの理由:
 * - React のエラーバウンダリーは getDerivedStateFromError と componentDidCatch を使用
 * - これらのライフサイクルメソッドは関数コンポーネントでは使用不可
 *
 * エラーハンドリングのフロー:
 * 1. 子コンポーネントでエラー発生
 * 2. getDerivedStateFromError でエラー状態を更新
 * 3. componentDidCatch でエラーをログに記録
 * 4. render メソッドでエラーUIを表示
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * コンストラクタ
   *
   * 初期状態を設定:
   * - hasError: false（エラーなし）
   * - error: null（エラーオブジェクトなし）
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * エラー発生時に新しい state を返す静的メソッド
   *
   * React のライフサイクルメソッド:
   * - 子コンポーネントでエラーが発生した時に呼ばれる
   * - 新しい state を返すことで、エラー状態に遷移
   *
   * @param error - 発生したエラーオブジェクト
   * @returns 新しい state（hasError: true, error: エラーオブジェクト）
   *
   * 注意:
   * - このメソッドは static なので、this にアクセスできない
   * - 副作用を持つ処理（ログ記録など）は componentDidCatch で行う
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * エラーキャッチ時に呼ばれるライフサイクルメソッド
   *
   * React のライフサイクルメソッド:
   * - 子コンポーネントでエラーが発生した後に呼ばれる
   * - getDerivedStateFromError の後に実行される
   *
   * @param error - 発生したエラーオブジェクト
   * @param errorInfo - React が提供するエラー情報（コンポーネントスタックトレースなど）
   *
   * 処理内容:
   * - エラー情報をロガーに記録
   * - 運用者がエラーの原因を調査できるようにする
   *
   * トレードオフ:
   * - 利点: エラーを見逃さず、すべてログに記録できる
   * - 欠点: エラーが頻発するとログが膨大になる可能性
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error("ErrorBoundaryでエラーをキャッチしました", {
      context: "ErrorBoundary.componentDidCatch",
      error,
      metadata: { errorInfo },
    });
  }

  /**
   * エラー状態をリセットするメソッド
   *
   * 処理内容:
   * - hasError を false に戻す
   * - error を null にクリア
   *
   * 用途:
   * - 「再試行」ボタンをクリックした時に呼ばれる
   * - エラー状態をリセットして、子コンポーネントを再レンダリング
   *
   * 注意:
   * - エラーの原因が解消されていない場合、再度エラーが発生する可能性
   * - そのため、再試行ボタンは慎重に使用すべき
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * レンダリングメソッド
   *
   * エラー状態に応じて表示内容を切り替え:
   * 1. エラーあり + カスタムfallback: カスタムUIを表示
   * 2. エラーあり + fallbackなし: デフォルトのエラーUIを表示
   * 3. エラーなし: 通常通り子要素を表示
   */
  render() {
    /**
     * エラーが発生している場合
     */
    if (this.state.hasError) {
      /**
       * カスタム fallback が指定されている場合
       *
       * props.fallback を表示
       * 用途: アプリケーション全体で統一されたエラーUIを使用する場合
       */
      if (this.props.fallback) {
        return this.props.fallback;
      }

      /**
       * デフォルトのエラーUI
       *
       * レイアウト:
       * - flex flex-col: 縦方向に要素を並べる
       * - items-center justify-center: 縦横中央揃え
       * - min-h-[400px]: 最小高さを確保（エラーUIが小さくなりすぎないように）
       * - p-8: パディングで余白を確保
       */
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          {/*
           * エラーメッセージコンテナ
           *
           * max-w-md: 最大幅を制限（長い文章でも読みやすく）
           * text-center: 中央揃え
           */}
          <div className="max-w-md text-center">
            {/*
             * エラータイトル
             *
             * mb-4: 下マージン
             * text-2xl: フォントサイズ
             * font-bold: 太字で目立たせる
             * text-gray-800: 濃いグレー
             */}
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              エラーが発生しました
            </h2>
            {/*
             * エラーメッセージ
             *
             * mb-6: 下マージン（エラー詳細との間隔）
             * text-gray-600: 中間的なグレー（タイトルより控えめ）
             *
             * 内容:
             * - ユーザーフレンドリーなメッセージ
             * - 技術的な詳細は含めない（セキュリティ対策）
             */}
            <p className="mb-6 text-gray-600">
              申し訳ございませんが、予期しないエラーが発生しました。
            </p>
            {/*
             * エラー詳細（開発環境のみ）
             *
             * process.env.NODE_ENV === "development": 開発環境の判定
             * this.state.error: エラーオブジェクトが存在するか
             *
             * 理由:
             * - 本番環境ではエラー詳細を表示しない（セキュリティ対策）
             * - 開発環境では詳細を表示してデバッグを容易にする
             */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                {/*
                 * 詳細の開閉トリガー
                 *
                 * cursor-pointer: ポインターカーソルを表示（クリック可能を示唆）
                 * text-sm: 小さめのフォント
                 * text-gray-500: 控えめな色
                 */}
                <summary className="cursor-pointer text-sm text-gray-500">
                  エラー詳細（開発環境のみ）
                </summary>
                {/*
                 * エラー詳細の内容
                 *
                 * pre タグ: エラースタックトレースを整形せずに表示
                 * mt-2: 上マージン
                 * overflow-auto: スタックトレースが長い場合にスクロール可能
                 * rounded: 角を丸める
                 * bg-gray-100: 薄いグレーの背景
                 * p-4: パディング
                 * text-xs: 小さいフォント（スタックトレースは長いため）
                 *
                 * 内容:
                 * - error.toString(): エラーメッセージ
                 * - error.stack: スタックトレース（エラーの発生箇所）
                 */}
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            {/*
             * 再試行ボタン
             *
             * onClick={this.resetError}: クリック時にエラー状態をリセット
             *
             * スタイリング:
             * - rounded-md: 角を丸める
             * - bg-blue-600: 青色の背景（アクションボタンの一般的な色）
             * - px-4 py-2: パディング（クリック領域を広げる）
             * - font-medium: 少し太めのフォント
             * - text-white: 白文字
             * - hover:bg-blue-700: ホバー時に濃い青に変化
             * - cursor-pointer: ポインターカーソルを表示
             *
             * 機能:
             * - エラー状態をリセットして、子コンポーネントを再レンダリング
             * - エラーの原因が解消されていれば、正常に動作する
             * - エラーが再発する場合は、再度エラーUIが表示される
             */}
            <button
              onClick={this.resetError}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }

    /**
     * エラーが発生していない場合
     *
     * 通常通り子要素をレンダリング
     */
    return this.props.children;
  }
}
