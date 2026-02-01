/**
 * API レスポンスの型定義 (lib/api-types.ts)
 *
 * すべての API エンドポイントのレスポンス型を定義します。
 *
 * 主な機能:
 * - API レスポンスの型定義（成功レスポンス、エラーレスポンス）
 * - クライアント側での型安全性の確保
 * - fetch() や useSWR での型推論のサポート
 *
 * 使用箇所:
 * - クライアントコンポーネント（API 呼び出し時の型注釈）
 * - API Routes（レスポンスの型チェック）
 * - useSWR フック（データ取得時の型推論）
 *
 * ベストプラクティス:
 * - すべての API エンドポイントに対応する型を定義する
 * - レスポンス型は API Routes の実装と一致させる
 * - エラーレスポンスは ApiErrorResponse を使用する
 *
 * 命名規則:
 * - GET エンドポイント: Get{リソース名}Response
 * - POST エンドポイント: Post{リソース名}{アクション}Response
 * - PUT エンドポイント: Put{リソース名}Response
 * - DELETE エンドポイント: Delete{リソース名}Response
 *
 * 使用例:
 * ```typescript
 * // クライアントコンポーネントでの使用
 * import type { GetProductsResponse, ApiErrorResponse } from '@/lib/api-types';
 *
 * const response = await fetch('/api/products');
 * const data: GetProductsResponse | ApiErrorResponse = await response.json();
 *
 * if ('error' in data) {
 *   console.error(data.error); // エラーハンドリング
 * } else {
 *   console.log(data.products); // 型安全にアクセス
 * }
 * ```
 *
 * @see app/types.ts - Product, Category などのエンティティ型
 * @see lib/api-helpers.ts - API ヘルパー関数
 */

import type { Product, Category } from '@/app/types';

/**
 * 成功レスポンスの基本型（ジェネリック）
 *
 * API レスポンスの共通構造を定義します。
 * この型は直接使用せず、具体的なレスポンス型（GetProductsResponse など）を使用してください。
 *
 * @template T レスポンスデータの型
 *
 * 使用例:
 * ```typescript
 * // 直接使用する例（非推奨、代わりに具体的な型を使用）
 * const response: ApiSuccessResponse<Product[]> = {
 *   products: [...]
 * };
 *
 * // 推奨: 具体的な型を使用
 * const response: GetProductsResponse = {
 *   products: [...]
 * };
 * ```
 *
 * 注意点:
 * - インデックスシグネチャ（[key: string]: T）により、任意のキーを許可
 * - 具体的なレスポンス型の定義に役立つ
 */
export interface ApiSuccessResponse<T> {
  [key: string]: T;
}

/**
 * エラーレスポンスの型
 *
 * すべての API エラーレスポンスで使用される共通の型です。
 * handleApiError() や apiError() が返すレスポンスの形式と一致します。
 *
 * プロパティ:
 * - error: エラーメッセージ（ユーザーに表示される）
 * - code: エラーコード（オプション、例: "VALIDATION_ERROR", "NOT_FOUND"）
 *
 * 使用例:
 * ```typescript
 * // fetch でのエラーハンドリング
 * const response = await fetch('/api/products');
 * const data = await response.json();
 *
 * if (!response.ok) {
 *   const errorData = data as ApiErrorResponse;
 *   console.error(`Error: ${errorData.error} (${errorData.code})`);
 * }
 *
 * // Type Guard を使った判定
 * function isApiError(data: unknown): data is ApiErrorResponse {
 *   return typeof data === 'object' && data !== null && 'error' in data;
 * }
 *
 * if (isApiError(data)) {
 *   console.error(data.error);
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "error": "商品が見つかりません",
 *   "code": "NOT_FOUND"
 * }
 * ```
 *
 * @see lib/errors.ts - ErrorCodes 定義
 * @see lib/api-helpers.ts - handleApiError, apiError
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * 商品一覧取得 API のレスポンス
 *
 * エンドポイント: GET /api/products
 *
 * すべての商品データを取得します（公開/非公開を含む）。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products');
 * const data: GetProductsResponse = await response.json();
 * console.log(data.products); // Product[]
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "products": [
 *     { "id": 1, "name": "商品A", "price": "1000", ... },
 *     { "id": 2, "name": "商品B", "price": "2000", ... }
 *   ]
 * }
 * ```
 */
export interface GetProductsResponse {
  products: Product[];
}

/**
 * 商品作成 API のレスポンス
 *
 * エンドポイント: POST /api/products
 *
 * 新規商品を作成し、作成された商品データを返します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: '新商品', price: 1000, ... }),
 * });
 * const data: PostProductResponse = await response.json();
 * console.log(data.product); // 作成された商品データ
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "product": { "id": 3, "name": "新商品", "price": "1000", ... }
 * }
 * ```
 */
export interface PostProductResponse {
  product: Product;
}

/**
 * 商品更新 API のレスポンス
 *
 * エンドポイント: PUT /api/products/[id]
 *
 * 既存商品を更新し、更新された商品データを返します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products/1', {
 *   method: 'PUT',
 *   body: JSON.stringify({ name: '更新後の商品名', ... }),
 * });
 * const data: PutProductResponse = await response.json();
 * console.log(data.product); // 更新された商品データ
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "product": { "id": 1, "name": "更新後の商品名", ... }
 * }
 * ```
 */
export interface PutProductResponse {
  product: Product;
}

/**
 * 商品削除 API のレスポンス
 *
 * エンドポイント: DELETE /api/products/[id]
 *
 * 商品を削除し、成功メッセージを返します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products/1', { method: 'DELETE' });
 * const data: DeleteProductResponse = await response.json();
 * console.log(data.message); // "Product deleted successfully"
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "message": "Product deleted successfully"
 * }
 * ```
 *
 * 注意点:
 * - HTTP ステータスコード 204 (No Content) ではなく、200 でメッセージを返す
 */
export interface DeleteProductResponse {
  message: string;
}

/**
 * 商品取得 API のレスポンス
 *
 * エンドポイント: GET /api/products/[id]
 *
 * 指定された ID の商品データを取得します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products/1');
 * const data: GetProductResponse = await response.json();
 * console.log(data.product); // Product
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "product": { "id": 1, "name": "商品A", "price": "1000", ... }
 * }
 * ```
 *
 * エラー時:
 * - 404 Not Found: 商品が見つからない場合
 */
export interface GetProductResponse {
  product: Product;
}

/**
 * 商品順序更新 API のレスポンス
 *
 * エンドポイント: POST /api/products/reorder
 *
 * 商品の表示順序（displayOrder）を一括更新し、成功メッセージを返します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/products/reorder', {
 *   method: 'POST',
 *   body: JSON.stringify({ productIds: [3, 1, 2] }), // 新しい順序
 * });
 * const data: PostProductReorderResponse = await response.json();
 * console.log(data.message); // "Product order updated successfully"
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "message": "Product order updated successfully"
 * }
 * ```
 *
 * リクエストボディ:
 * - productIds: 商品 ID の配列（新しい表示順序）
 */
export interface PostProductReorderResponse {
  message: string;
}

/**
 * 画像アップロード API のレスポンス
 *
 * エンドポイント: POST /api/products/upload
 *
 * 画像をアップロードし、アップロードされた画像の URL とファイル名を返します。
 *
 * 使用例:
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', imageFile);
 *
 * const response = await fetch('/api/products/upload', {
 *   method: 'POST',
 *   body: formData,
 * });
 * const data: PostProductUploadResponse = await response.json();
 * console.log(data.url); // アップロードされた画像の URL
 * console.log(data.filename); // ファイル名
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "url": "https://xxx.public.blob.vercel-storage.com/products/abc123.jpg",
 *   "filename": "abc123.jpg"
 * }
 * ```
 *
 * 注意点:
 * - Content-Type は multipart/form-data を使用
 * - ファイルサイズの制限あり（config.ts 参照）
 */
export interface PostProductUploadResponse {
  url: string;
  filename: string;
}

/**
 * カテゴリー一覧取得 API のレスポンス
 *
 * エンドポイント: GET /api/categories
 *
 * すべてのカテゴリーデータを取得します。
 *
 * 使用例:
 * ```typescript
 * const response = await fetch('/api/categories');
 * const data: GetCategoriesResponse = await response.json();
 * console.log(data.categories); // Category[]
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "categories": [
 *     { "id": 1, "name": "カテゴリーA", ... },
 *     { "id": 2, "name": "カテゴリーB", ... }
 *   ]
 * }
 * ```
 */
export interface GetCategoriesResponse {
  categories: Category[];
}
