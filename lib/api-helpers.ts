import { NextResponse } from 'next/server';
import { AppError, getUserFriendlyMessage, logError } from './errors';

/**
 * API Routes用のエラーハンドリングヘルパー
 * Next.js App Routerのベストプラクティスに従います
 */

/**
 * API Routeのエラーハンドリングラッパー
 * エラーを適切に処理し、NextResponseを返します
 */
export function handleApiError(error: unknown): NextResponse {
  logError(error, 'API Route');

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: getUserFriendlyMessage(error),
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // 予期しないエラーの場合
  const isProduction = process.env.NODE_ENV === 'production';
  return NextResponse.json(
    {
      error: isProduction
        ? 'An unexpected error occurred'
        : getUserFriendlyMessage(error),
    },
    { status: 500 }
  );
}

/**
 * API Routeの成功レスポンス
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * API Routeのエラーレスポンス
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
}

/**
 * 非同期API Routeハンドラーをラップします
 * エラーを自動的に処理します
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
