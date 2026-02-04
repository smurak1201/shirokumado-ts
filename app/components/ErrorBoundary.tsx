/**
 * エラーバウンダリーコンポーネント
 *
 * 子コンポーネントのレンダリング中に発生したエラーをキャッチし、
 * フォールバックUIを表示する。
 */
"use client";

import { Component, type ReactNode } from "react";
import { log } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// React のエラーバウンダリーは getDerivedStateFromError と componentDidCatch を使用するため、
// これらのライフサイクルメソッドを持つクラスコンポーネントとして実装
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

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error("ErrorBoundaryでエラーをキャッチしました", {
      context: "ErrorBoundary.componentDidCatch",
      error,
      metadata: { errorInfo },
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-100 flex-col items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              エラーが発生しました
            </h2>
            <p className="mb-6 text-gray-600">
              申し訳ございませんが、予期しないエラーが発生しました。
            </p>
            {/* 設計判断: 本番環境ではエラー詳細を表示しない(セキュリティ対策) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  エラー詳細(開発環境のみ)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
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

    return this.props.children;
  }
}
