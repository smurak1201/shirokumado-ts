/**
 * API Routes 用のヘルパー関数 (lib/api-helpers.ts)
 *
 * Next.js App Router の API Routes で使用するヘルパー関数を提供します。
 *
 * 主な機能:
 * - エラーハンドリングの統一（handleApiError, withErrorHandling）
 * - レスポンスの生成（apiSuccess, apiError）
 * - バリデーション（parseProductId）
 * - ログの自動記録
 *
 * 使用箇所:
 * - すべての API Routes（app/api/ 配下）
 * - 商品 CRUD 操作（GET, POST, PUT, DELETE）
 * - カテゴリ CRUD 操作
 *
 * ベストプラクティス:
 * - すべての API Routes で withErrorHandling を使用してエラーを自動処理
 * - 成功レスポンスは apiSuccess で返す
 * - エラーレスポンスは apiError で返す（または throw new ValidationError など）
 * - すべてのエラーはログに記録される（log.error）
 *
 * Next.js App Router のベストプラクティス:
 * - Content-Type ヘッダーを明示的に設定（charset=utf-8）
 * - HTTP ステータスコードを適切に設定
 * - エラーメッセージはユーザーフレンドリーに変換
 *
 * @see lib/errors.ts - カスタムエラークラス
 * @see lib/logger.ts - ログ記録
 */

import { NextResponse } from 'next/server';
import { AppError, getUserFriendlyMessage, ValidationError } from './errors';
import { log } from './logger';

/**
 * API Route のエラーハンドリングラッパー
 *
 * エラーを適切に処理し、NextResponse を返します。
 * すべてのエラーはログに記録され、ユーザーフレンドリーなメッセージに変換されます。
 *
 * @param error エラーオブジェクト（AppError, Error, または unknown）
 * @returns エラーレスポンス（NextResponse）
 *
 * 使用例:
 * ```typescript
 * export async function GET(request: Request) {
 *   try {
 *     const products = await getProducts();
 *     return apiSuccess(products);
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 *
 * 処理の流れ:
 * 1. エラーをログに記録（log.error）
 * 2. AppError のインスタンスかどうかを判定
 *    - AppError: statusCode と code を含むレスポンスを返す
 *    - その他: 500 エラーとして返す（本番環境では詳細を隠す）
 * 3. Content-Type ヘッダーを設定
 *
 * レスポンスの形式:
 * - AppError の場合:
 *   ```json
 *   {
 *     "error": "エラーメッセージ",
 *     "code": "VALIDATION_ERROR"
 *   }
 *   ```
 * - その他のエラー:
 *   ```json
 *   {
 *     "error": "An unexpected error occurred"
 *   }
 *   ```
 *
 * セキュリティ上の注意:
 * - 本番環境では予期しないエラーの詳細を隠す
 * - AppError のメッセージはユーザーに表示される前提で記述
 *
 * @see withErrorHandling - この関数を自動的に呼び出すラッパー
 */
export function handleApiError(error: unknown): NextResponse {
  // エラーをログに記録（トラブルシューティング用）
  // 理由: すべての API エラーを記録することで、問題の早期発見が可能
  log.error('API Routeでエラーが発生しました', {
    context: 'API Route',
    error,
  });

  // AppError（またはそのサブクラス）の場合
  // 理由: AppError には statusCode と code が含まれており、適切なレスポンスを生成できる
  if (error instanceof AppError) {
    const response = NextResponse.json(
      {
        error: getUserFriendlyMessage(error),
        code: error.code,
      },
      { status: error.statusCode }
    );
    // Content-Type ヘッダーを明示的に設定
    // 理由: charset=utf-8 を指定することで、日本語などの多バイト文字が正しく表示される
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }

  // 予期しないエラーの場合（AppError 以外）
  // 理由: 未知のエラーが発生した場合、安全なエラーメッセージを返す
  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.json(
    {
      // 本番環境では汎用メッセージ、開発環境では詳細メッセージ
      // 理由: セキュリティリスクを避けるため、本番環境では詳細を隠す
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
 * API Route の成功レスポンスを生成します
 *
 * データを JSON 形式で返し、適切なヘッダーを設定します。
 *
 * @template T データの型
 * @param data レスポンスデータ（オブジェクト、配列、プリミティブ型など）
 * @param status HTTP ステータスコード（デフォルト: 200）
 * @returns 成功レスポンス（NextResponse）
 *
 * 使用例:
 * ```typescript
 * // GET /api/products - 商品一覧を返す
 * const products = await getProducts();
 * return apiSuccess(products); // 200
 *
 * // POST /api/products - 商品作成成功（201 Created）
 * const newProduct = await createProduct(data);
 * return apiSuccess(newProduct, 201);
 *
 * // DELETE /api/products/:id - 削除成功（204 No Content）
 * return apiSuccess(null, 204);
 * ```
 *
 * HTTP ステータスコードの使い分け:
 * - 200 OK: GET, PUT で成功（デフォルト）
 * - 201 Created: POST で新規作成成功
 * - 204 No Content: DELETE で削除成功（データなし）
 *
 * 実装の理由:
 * - Content-Type ヘッダーを明示的に設定（charset=utf-8）
 * - 統一されたレスポンス形式を提供
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  // JSON レスポンスを生成
  const response = NextResponse.json(data, { status });
  // Content-Type ヘッダーを設定（日本語などの多バイト文字対応）
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

/**
 * API Route のエラーレスポンスを生成します
 *
 * エラーメッセージと HTTP ステータスコードを指定してエラーレスポンスを返します。
 * handleApiError と異なり、エラーオブジェクトではなくメッセージ文字列を直接指定します。
 *
 * @param message エラーメッセージ（ユーザーに表示される）
 * @param status HTTP ステータスコード（デフォルト: 400）
 * @param code エラーコード（オプション、例: "VALIDATION_ERROR"）
 * @returns エラーレスポンス（NextResponse）
 *
 * 使用例:
 * ```typescript
 * // バリデーションエラー（400 Bad Request）
 * if (!productName) {
 *   return apiError('商品名は必須です', 400, ErrorCodes.VALIDATION_ERROR);
 * }
 *
 * // リソースが見つからない（404 Not Found）
 * if (!product) {
 *   return apiError('商品が見つかりません', 404, ErrorCodes.NOT_FOUND);
 * }
 *
 * // 認証エラー（401 Unauthorized）
 * if (!user) {
 *   return apiError('ログインが必要です', 401, ErrorCodes.UNAUTHORIZED);
 * }
 * ```
 *
 * HTTP ステータスコードの使い分け:
 * - 400 Bad Request: バリデーションエラー（デフォルト）
 * - 401 Unauthorized: 認証エラー
 * - 403 Forbidden: 権限エラー
 * - 404 Not Found: リソースが見つからない
 * - 500 Internal Server Error: サーバーエラー
 *
 * handleApiError との違い:
 * - apiError: メッセージ文字列を直接指定（簡易的）
 * - handleApiError: エラーオブジェクトを受け取り、型に応じて処理（高機能）
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  // エラーレスポンスを生成
  const response = NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
  // Content-Type ヘッダーを設定
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

/**
 * 非同期 API Route ハンドラーをラップします
 *
 * エラーを自動的に処理し、try-catch ブロックの記述を不要にします。
 * すべての API Routes でこの関数を使用することを推奨します。
 *
 * @template T ハンドラーの引数の型（タプル）
 * @param handler API Route ハンドラー関数
 * @returns ラップされたハンドラー関数
 *
 * 使用例:
 * ```typescript
 * // 従来の書き方（try-catch が必要）
 * export async function GET(request: Request) {
 *   try {
 *     const products = await getProducts();
 *     return apiSuccess(products);
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 *
 * // withErrorHandling を使った書き方（try-catch 不要）
 * export const GET = withErrorHandling(async (request: Request) => {
 *   const products = await getProducts();
 *   return apiSuccess(products);
 * });
 *
 * // パラメータ付き（Dynamic Routes）
 * export const GET = withErrorHandling(
 *   async (request: Request, { params }: { params: { id: string } }) => {
 *     const productId = parseProductId(params.id);
 *     const product = await getProduct(productId);
 *     return apiSuccess(product);
 *   }
 * );
 * ```
 *
 * 実装の理由:
 * - すべての API Routes で統一されたエラーハンドリングを提供
 * - try-catch ブロックの記述を不要にし、コードを簡潔にする
 * - エラーログの記録を自動化
 *
 * トレードオフ:
 * - 利点: コードが簡潔、エラーハンドリングの一貫性
 * - 欠点: 特殊なエラーハンドリングが必要な場合は使いにくい
 *   （その場合は手動で try-catch を記述する）
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      // ハンドラーを実行
      return await handler(...args);
    } catch (error) {
      // エラーが発生した場合、handleApiError で処理
      // 理由: エラーログの記録とレスポンスの生成を自動化
      return handleApiError(error);
    }
  };
}

/**
 * 商品 ID 文字列を数値に変換し、バリデーションを行います
 *
 * Dynamic Routes のパラメータ（文字列）を数値に変換します。
 * 無効な ID の場合は ValidationError をスローします。
 *
 * @param id 商品 ID 文字列（例: "123", "abc"）
 * @returns 変換された商品 ID（数値）
 * @throws {ValidationError} 無効な商品 ID の場合（例: "abc", "12.34"）
 *
 * 使用例:
 * ```typescript
 * // GET /api/products/:id
 * export const GET = withErrorHandling(
 *   async (request: Request, { params }: { params: { id: string } }) => {
 *     const productId = parseProductId(params.id); // "123" → 123
 *     const product = await getProduct(productId);
 *     return apiSuccess(product);
 *   }
 * );
 * ```
 *
 * バリデーションの詳細:
 * - 数値変換可能な文字列: OK（例: "123" → 123）
 * - 文字列や不正な値: NG（例: "abc", "12.34"）
 * - NaN チェック: parseInt の結果が NaN の場合はエラー
 *
 * 実装の理由:
 * - Dynamic Routes のパラメータは常に文字列
 * - データベースクエリでは数値が必要
 * - 不正な ID を早期に検出してエラーレスポンスを返す
 *
 * 注意点:
 * - parseInt は小数点以下を切り捨てる（"12.34" → 12）
 * - 空文字列や null は NaN になる
 */
export function parseProductId(id: string): number {
  // 文字列を整数に変換
  const productId = parseInt(id);
  // NaN チェック（無効な ID の場合）
  // 理由: 不正な ID を早期に検出し、ValidationError をスロー
  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }
  return productId;
}
