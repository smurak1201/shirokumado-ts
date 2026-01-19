import { NextResponse } from 'next/server';
import { AppError, getUserFriendlyMessage } from './errors';
import { log } from './logger';

/**
 * API Routes用のエラーハンドリングヘルパー
 * Next.js App Routerのベストプラクティスに従います
 */

/**
 * API Routeのエラーハンドリングラッパー
 * エラーを適切に処理し、NextResponseを返します
 */
export function handleApiError(error: unknown): NextResponse {
  log.error('API Routeでエラーが発生しました', {
    context: 'API Route',
    error,
  });

  if (error instanceof AppError) {
    const response = NextResponse.json(
      {
        error: getUserFriendlyMessage(error),
        code: error.code,
      },
      { status: error.statusCode }
    );
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }

  // 予期しないエラーの場合
  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.json(
    {
      error: isProduction
        ? 'An unexpected error occurred'
        : getUserFriendlyMessage(error),
    },
    { status: 500 }
  );
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

/**
 * API Routeの成功レスポンス
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

/**
 * API Routeのエラーレスポンス
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
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
