"use client";

import { Component, type ReactNode } from "react";

/**
 * ErrorBoundary の Props
 */
interface ErrorBoundaryProps {
  children: ReactNode; // エラーバウンダリーで囲む子コンポーネント
  fallback?: ReactNode; // エラー発生時に表示するフォールバックUI（オプション）
}

/**
 * ErrorBoundary の State
 */
interface ErrorBoundaryState {
  hasError: boolean; // エラーが発生したかどうか
  error: Error | null; // 発生したエラー
}

/**
 * エラーバウンダリーコンポーネント
 *
 * Reactのエラーバウンダリー機能を実装したコンポーネントです。
 * 子コンポーネントで発生したエラーをキャッチし、エラーUIを表示します。
 *
 * Reactのベストプラクティスに従い、クラスコンポーネントとして実装されています。
 * （関数コンポーネントではエラーバウンダリーを実装できないため）
 *
 * 使用例:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * カスタムフォールバックUIを指定する場合:
 * ```tsx
 * <ErrorBoundary fallback={<div>エラーが発生しました</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * エラーが発生したときに呼ばれるライフサイクルメソッド
   * エラー状態を更新します
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * エラーが発生したときに呼ばれるライフサイクルメソッド
   * エラーログを出力します
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーログを出力（本番環境ではエラートラッキングサービスに送信）
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  /**
   * エラー状態をリセットする
   * ユーザーが再試行できるようにするためのメソッド
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが指定されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUIを表示
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              エラーが発生しました
            </h2>
            <p className="mb-6 text-gray-600">
              申し訳ございませんが、予期しないエラーが発生しました。
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  エラー詳細（開発環境のみ）
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
