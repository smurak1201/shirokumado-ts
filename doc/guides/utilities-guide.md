# ユーティリティ関数ガイド

## 目次

- [概要](#概要)
- [商品関連ユーティリティ (`lib/product-utils.ts`)](#商品関連ユーティリティ-libproduct-utilsts)
  - [getJapanTime](#getjapantime)
  - [calculatePublishedStatus](#calculatepublishedstatus)
  - [hasDateRange](#hasdaterange)
  - [formatPrice](#formatprice)
  - [parsePrice](#parseprice)
  - [isNumericKey](#isnumerickey)
- [画像圧縮ユーティリティ (`lib/image-compression.ts`)](#画像圧縮ユーティリティ-libimage-compressionts)
  - [compressImage](#compressimage)
  - [画像圧縮の仕組み](#画像圧縮の仕組み)
- [Blob Storage ユーティリティ (`lib/blob.ts`)](#blob-storage-ユーティリティ-libblobts)
  - [uploadFile](#uploadfile)
  - [uploadImage](#uploadimage)
  - [listFiles](#listfiles)
  - [getBlobInfo](#getblobinfo)
  - [deleteFile](#deletefile)
  - [deleteFiles](#deletefiles)
- [エラーハンドリング (`lib/errors.ts`)](#エラーハンドリング-liberrorsts)
  - [エラーコードの定数定義](#エラーコードの定数定義)
  - [エラークラス](#エラークラス)
- [API レスポンスの型定義 (`lib/api-types.ts`)](#api-レスポンスの型定義-libapi-typests)
  - [型定義の一覧](#型定義の一覧)
  - [使用例](#使用例)
- [構造化ログ (`lib/logger.ts`)](#構造化ログ-libloggerts)
  - [ログレベルの種類](#ログレベルの種類)
  - [使用例](#使用例-1)
- [設定の一元管理 (`lib/config.ts`)](#設定の一元管理-libconfigts)
  - [設定値の構成](#設定値の構成)
  - [設定値の変更方法](#設定値の変更方法)
- [環境変数の型安全な管理 (`lib/env.ts`)](#環境変数の型安全な管理-libenvts)
  - [getServerEnv](#getserverenv)
  - [getClientEnv](#getclientenv)
  - [環境変数の使い分け](#環境変数の使い分け)
- [このアプリでのユーティリティ関数の使用例まとめ](#このアプリでのユーティリティ関数の使用例まとめ)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

このアプリケーションでは、`lib/` ディレクトリに共通のユーティリティ関数を配置し、プロジェクト全体で再利用可能な機能を提供しています。

**ユーティリティ関数の主な特徴**:

- **型安全性**: TypeScript で型定義され、型安全な操作が可能
- **再利用性**: 複数のコンポーネントや API Routes で使用可能
- **保守性**: 一箇所で管理され、変更が容易
- **テスト容易性**: 純粋関数として実装され、テストしやすい

**このアプリでの使用箇所**:

- **商品関連ユーティリティ**: 商品の公開状態判定、価格フォーマットなど
- **画像圧縮**: クライアントサイドでの画像圧縮・リサイズ
- **Blob Storage**: 画像のアップロード・削除・管理
- **エラーハンドリング**: 統一されたエラークラスとエラーコードの定数定義
- **API レスポンスの型定義**: クライアント側での型安全性を確保
- **構造化ログ**: JSON 形式の構造化ログ出力（本番環境）
- **設定管理**: アプリケーション全体の設定値を一元管理
- **環境変数**: 型安全な環境変数の取得

## 商品関連ユーティリティ (`lib/product-utils.ts`)

商品関連のビジネスロジックを実装したユーティリティ関数です。

**このアプリでの使用箇所**:

- [`app/page.tsx`](../../app/page.tsx): 公開商品のフィルタリング
- [`app/api/products/route.ts`](../../app/api/products/route.ts): 商品作成時の公開状態判定
- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 商品更新時の公開状態判定
- [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx): 価格フォーマット、数値入力の検証

### getJapanTime

日本時間の現在日時を取得します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`getJapanTime`関数)

```typescript
export function getJapanTime(): Date {
  const now = new Date();
  // 日本時間（UTC+9）に変換
  const japanTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  return japanTime;
}
```

**使用例**:

```typescript
import { getJapanTime } from "@/lib/product-utils";

const japanTime = getJapanTime();
console.log(japanTime); // 日本時間の現在日時
```

**理由**:

- **タイムゾーンの統一**: アプリケーション全体で日本時間を使用し、一貫性を保つ
- **公開状態の判定**: 公開日・終了日の判定で日本時間を使用

### calculatePublishedStatus

公開日・終了日から公開情報を自動判定します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`calculatePublishedStatus`関数)

```typescript
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  const now = getJapanTime();

  // 公開日が設定されている場合
  if (publishedAt) {
    const publishedDate = new Date(publishedAt);
    // 公開日が未来の場合は非公開
    if (publishedDate > now) {
      return false;
    }
  }

  // 終了日が設定されている場合
  if (endedAt) {
    const endedDate = new Date(endedAt);
    // 終了日が過去の場合は非公開
    if (endedDate < now) {
      return false;
    }
  }

  // 公開日が過去または未設定、かつ終了日が未来または未設定の場合は公開
  return true;
}
```

**使用例**:

```typescript
import { calculatePublishedStatus } from "@/lib/product-utils";

// 公開日が未来の場合
const futureProduct = calculatePublishedStatus(new Date("2025-12-31"), null); // false（非公開）

// 終了日が過去の場合
const endedProduct = calculatePublishedStatus(null, new Date("2020-01-01")); // false（非公開）

// 公開期間内の場合
const activeProduct = calculatePublishedStatus(
  new Date("2020-01-01"),
  new Date("2025-12-31")
); // true（公開）
```

**理由**:

- **自動判定**: 公開日・終了日の設定に基づいて自動的に公開状態を判定
- **時間ベースの管理**: 手動での公開状態変更が不要になり、運用が簡素化

### hasDateRange

公開日・終了日が設定されているかどうかを判定します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`hasDateRange`関数)

```typescript
export function hasDateRange(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  return publishedAt !== null || endedAt !== null;
}
```

**使用例**:

```typescript
import { hasDateRange } from "@/lib/product-utils";

if (hasDateRange(product.publishedAt, product.endedAt)) {
  // 日付範囲が設定されている場合の処理
}
```

### formatPrice

数値をカンマ区切りの文字列に変換します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`formatPrice`関数)

```typescript
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return numValue.toLocaleString("ja-JP");
}
```

**使用例**:

```typescript
import { formatPrice } from "@/lib/product-utils";

formatPrice(1000); // "1,000"
formatPrice("2000"); // "2,000"
formatPrice(null); // ""
```

**理由**:

- **表示形式の統一**: 価格を常にカンマ区切りで表示し、ユーザー体験を向上
- **null 安全**: null や undefined を安全に処理

### parsePrice

カンマ区切りの文字列を数値に変換します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`parsePrice`関数)

```typescript
export function parsePrice(value: string): string {
  // カンマを除去して数字のみを抽出（小数点は除外）
  const cleaned = value.replace(/,/g, "").replace(/[^\d]/g, "");
  return cleaned;
}
```

**使用例**:

```typescript
import { parsePrice } from "@/lib/product-utils";

parsePrice("1,000"); // "1000"
parsePrice("2,500円"); // "2500"
```

**理由**:

- **入力値の正規化**: ユーザー入力から数値のみを抽出し、データベースに保存しやすい形式に変換

### isNumericKey

キー入力が数字かどうかを判定します。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`isNumericKey`関数)

```typescript
export function isNumericKey(
  e: React.KeyboardEvent<HTMLInputElement>
): boolean {
  // 数字キー（0-9）
  if (e.key >= "0" && e.key <= "9") {
    return true;
  }
  // 許可する制御キー
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(e.key)) {
    return true;
  }
  // Ctrl/Cmd + A, C, V, X などのコピー&ペースト操作
  if (
    (e.ctrlKey || e.metaKey) &&
    ["a", "c", "v", "x"].includes(e.key.toLowerCase())
  ) {
    return true;
  }
  return false;
}
```

**使用例**:

```typescript
import { isNumericKey } from "@/lib/product-utils";

<input
  onKeyDown={(e) => {
    if (!isNumericKey(e)) {
      e.preventDefault();
    }
  }}
/>;
```

**理由**:

- **入力検証**: 価格入力フィールドで数字以外の入力を防止
- **ユーザー体験**: コピー&ペーストなどの操作は許可し、使いやすさを維持

## 画像圧縮ユーティリティ (`lib/image-compression.ts`)

クライアントサイドで画像を圧縮・リサイズするユーティリティです。

**このアプリでの使用箇所**:

- [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx): 商品画像のアップロード前の圧縮
- [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx): 商品画像の更新時の圧縮

### compressImage

画像ファイルを圧縮・リサイズします。

[`lib/image-compression.ts`](../../lib/image-compression.ts) (`compressImage`関数)

```typescript
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File>;
```

**パラメータ**:

- `file`: 元の画像ファイル
- `options`: 圧縮オプション
  - `maxWidth`: 最大幅（デフォルト: 1920px）
  - `maxHeight`: 最大高さ（デフォルト: 1920px）
  - `quality`: 圧縮品質（デフォルト: 0.85）
  - `maxSizeMB`: 目標ファイルサイズ（デフォルト: 3.5MB）
  - `format`: 出力形式（デフォルト: 'webp'）

**使用例**:

```typescript
import { compressImage } from "@/lib/image-compression";

const compressedFile = await compressImage(file, {
  maxSizeMB: 3.5,
  quality: 0.85,
});
```

**理由**:

- **ファイルサイズの削減**: アップロード前に画像を圧縮し、ストレージ容量と転送時間を削減
- **WebP 形式**: JPEG よりも約 25-35% 小さなファイルサイズを実現
- **自動リサイズ**: 大きな画像を自動的にリサイズし、表示に適したサイズに調整

### 画像圧縮の仕組み

1. **WebP サポートの判定**: ブラウザが WebP をサポートしているか確認
2. **画像の読み込み**: FileReader API で画像を読み込み
3. **リサイズ**: アスペクト比を保ちながら最大サイズにリサイズ
4. **品質調整**: 目標ファイルサイズに達するまで品質を段階的に調整（最小品質: 0.5）
5. **フォーマット変換**: WebP 形式で出力（サポートされていない場合は JPEG にフォールバック）

**アルゴリズム**:

- 品質を 0.1 ずつ下げながら、目標ファイルサイズに近づける
- 最小品質は 0.5 に設定（それ以下だと画質が著しく低下するため）

## Blob Storage ユーティリティ (`lib/blob.ts`)

Vercel Blob Storage へのファイルアップロード・管理を行うユーティリティです。

**このアプリでの使用箇所**:

- [`app/api/products/upload/route.ts`](../../app/api/products/upload/route.ts): 画像のアップロード
- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 画像の削除

### uploadFile

ファイルを Blob ストレージにアップロードします。

[`lib/blob.ts`](../../lib/blob.ts) (`uploadFile`関数)

```typescript
export async function uploadFile(
  filename: string,
  content: Buffer | ReadableStream | string,
  options?: {
    contentType?: string;
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
    access?: "public" | "private";
  }
): Promise<Blob>;
```

**使用例**:

```typescript
import { uploadFile } from "@/lib/blob";

const blob = await uploadFile("products/image.jpg", buffer, {
  contentType: "image/jpeg",
  access: "public",
  cacheControlMaxAge: 31536000, // 1年
});
```

### uploadImage

画像を Blob ストレージにアップロードします（画像専用のヘルパー関数）。

[`lib/blob.ts`](../../lib/blob.ts) (`uploadImage`関数)

```typescript
export async function uploadImage(
  filename: string,
  imageBuffer: Buffer,
  contentType: string = "image/jpeg"
): Promise<Blob>;
```

**使用例**:

```typescript
import { uploadImage } from "@/lib/blob";

const blob = await uploadImage("products/image.jpg", buffer, "image/jpeg");
// 自動的に public アクセスとキャッシュ設定が適用される
```

**理由**:

- **簡潔な API**: 画像アップロードに特化した関数で、コードが簡潔になる
- **自動設定**: キャッシュ制御やアクセス設定が自動的に適用される

### listFiles

Blob ストレージ内のファイル一覧を取得します。

[`lib/blob.ts`](../../lib/blob.ts) (`listFiles`関数)

```typescript
export async function listFiles(options?: {
  prefix?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ blobs: Blob[]; cursor: string }>;
```

**使用例**:

```typescript
import { listFiles } from "@/lib/blob";

const { blobs, cursor } = await listFiles({
  prefix: "products/",
  limit: 100,
});
```

### getBlobInfo

Blob のメタデータを取得します。

[`lib/blob.ts`](../../lib/blob.ts) (`getBlobInfo`関数)

```typescript
export async function getBlobInfo(url: string): Promise<Blob>;
```

**使用例**:

```typescript
import { getBlobInfo } from "@/lib/blob";

const blobInfo = await getBlobInfo("https://...");
console.log(blobInfo.size, blobInfo.uploadedAt);
```

### deleteFile

Blob ストレージからファイルを削除します。

[`lib/blob.ts`](../../lib/blob.ts) (`deleteFile`関数)

```typescript
export async function deleteFile(url: string): Promise<boolean>;
```

**使用例**:

```typescript
import { deleteFile } from "@/lib/blob";

await deleteFile("https://...");
```

**このアプリでの使用箇所**:

- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 商品更新時に古い画像を削除
- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 商品削除時に画像を削除

### deleteFiles

複数の Blob を削除します。

[`lib/blob.ts`](../../lib/blob.ts) (`deleteFiles`関数)

```typescript
export async function deleteFiles(urls: string[]): Promise<boolean>;
```

**使用例**:

```typescript
import { deleteFiles } from "@/lib/blob";

await deleteFiles(["https://...", "https://..."]);
```

## エラーハンドリング (`lib/errors.ts`)

統一されたエラーハンドリングとエラーコードの定数定義を提供します。

**このアプリでの使用箇所**:

- すべての API Routes: エラーハンドリングとエラーコードの使用
- [`lib/api-helpers.ts`](../../lib/api-helpers.ts): エラーレスポンスの生成

### エラーコードの定数定義

[`lib/errors.ts`](../../lib/errors.ts) (`ErrorCodes`定数)

```typescript
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  BLOB_STORAGE_ERROR: "BLOB_STORAGE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

**使用例**:

```typescript
import { ErrorCodes } from "@/lib/errors";

// エラーコードを参照
if (error.code === ErrorCodes.VALIDATION_ERROR) {
  // バリデーションエラーの処理
}
```

**理由**:

- **一元管理**: エラーコードを一箇所で管理し、変更が容易
- **型安全性**: TypeScript で型定義され、タイポを防止
- **一貫性**: プロジェクト全体で統一されたエラーコードを使用

### エラークラス

[`lib/errors.ts`](../../lib/errors.ts) では、以下のエラークラスを提供しています。

- `AppError`: 基底エラークラス
- `DatabaseError`: データベースエラー（`ErrorCodes.DATABASE_ERROR` を使用）
- `BlobStorageError`: Blob Storage エラー（`ErrorCodes.BLOB_STORAGE_ERROR` を使用）
- `ValidationError`: バリデーションエラー（`ErrorCodes.VALIDATION_ERROR` を使用）
- `NotFoundError`: リソースが見つからないエラー（`ErrorCodes.NOT_FOUND` を使用）

**使用例**:

```typescript
import { ValidationError, NotFoundError } from "@/lib/errors";

// バリデーションエラー
if (!name || name.trim().length === 0) {
  throw new ValidationError("商品名は必須です");
}

// リソースが見つからないエラー
if (!product) {
  throw new NotFoundError("商品");
}
```

**理由**:

- **統一されたエラーハンドリング**: すべてのエラーが同じ形式で処理される
- **適切な HTTP ステータスコード**: エラーの種類に応じた適切なステータスコードが設定される
- **エラーコードの自動設定**: エラークラスを使用すると、適切なエラーコードが自動的に設定される

## API レスポンスの型定義 (`lib/api-types.ts`)

API レスポンスの型定義を提供します。クライアント側での型安全性を確保します。

**このアプリでの使用箇所**:

- クライアント側での API 呼び出し: 型安全なレスポンスの処理

### 型定義の一覧

[`lib/api-types.ts`](../../lib/api-types.ts) では、以下の型定義を提供しています。

- `GetProductsResponse`: 商品一覧取得 API のレスポンス
- `PostProductResponse`: 商品作成 API のレスポンス
- `PutProductResponse`: 商品更新 API のレスポンス
- `DeleteProductResponse`: 商品削除 API のレスポンス
- `GetProductResponse`: 商品取得 API のレスポンス
- `PostProductReorderResponse`: 商品順序更新 API のレスポンス
- `PostProductUploadResponse`: 画像アップロード API のレスポンス
- `GetCategoriesResponse`: カテゴリー一覧取得 API のレスポンス

### 使用例

```typescript
import type { GetProductsResponse, PostProductResponse } from "@/lib/api-types";

// 商品一覧の取得
const response = await fetch("/api/products");
const data: GetProductsResponse = await response.json();
// data.products は Product[] 型として推論される

// 商品の作成
const createResponse = await fetch("/api/products", {
  method: "POST",
  body: JSON.stringify(productData),
});
const created: PostProductResponse = await createResponse.json();
// created.product は Product 型として推論される
```

**理由**:

- **型安全性**: クライアント側での型安全性を確保
- **API の契約**: API のレスポンス形式が明確になる
- **IDE サポート**: 自動補完や型チェックが機能する

## 構造化ログ (`lib/logger.ts`)

構造化ログユーティリティを提供します。本番環境では JSON 形式で出力し、開発環境では読みやすい形式で出力します。

**このアプリでの使用箇所**:

- エラーログの出力: 構造化されたエラーログ
- デバッグ情報の出力: 構造化されたデバッグログ

### ログレベルの種類

[`lib/logger.ts`](../../lib/logger.ts) では、以下のログレベルを提供しています。

- `log.debug()`: デバッグ情報
- `log.info()`: 情報
- `log.warn()`: 警告
- `log.error()`: エラー

### 使用例

```typescript
import { log } from "@/lib/logger";

// 情報レベルのログ
log.info("User logged in", {
  context: "authentication",
  userId: user.id,
});

// エラーレベルのログ
log.error("Database operation failed", {
  context: "getProducts",
  error: error,
  metadata: {
    query: "findMany",
    table: "products",
  },
});
```

**本番環境での出力形式**:

```json
{
  "level": "error",
  "message": "Database operation failed",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "context": "getProducts",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "..."
  },
  "metadata": {
    "query": "findMany",
    "table": "products"
  }
}
```

**開発環境での出力形式**:

```
ERROR [getProducts] Database operation failed
```

**理由**:

- **ログ分析ツールとの統合**: JSON 形式により、ログ分析ツールとの統合が容易
- **デバッグの容易さ**: 開発環境では読みやすい形式で出力
- **構造化された情報**: メタデータを含む構造化されたログにより、トラブルシューティングが容易

## 設定の一元管理 (`lib/config.ts`)

アプリケーション全体の設定値を一元管理するファイルです。

**このアプリでの使用箇所**:

- [`lib/image-compression.ts`](../../lib/image-compression.ts): 画像圧縮の設定
- [`lib/blob.ts`](../../lib/blob.ts): Blob Storage の設定
- [`app/api/products/route.ts`](../../app/api/products/route.ts): API キャッシュの設定
- [`app/api/categories/route.ts`](../../app/api/categories/route.ts): API キャッシュの設定

### 設定値の構成

[`lib/config.ts`](../../lib/config.ts) (`config`オブジェクト)

```typescript
export const config = {
  imageConfig: {
    MAX_FILE_SIZE_MB: 4,
    MAX_FILE_SIZE_BYTES: 4 * 1024 * 1024,
    COMPRESSION_TARGET_SIZE_MB: 3.5,
    MAX_IMAGE_WIDTH: 1920,
    MAX_IMAGE_HEIGHT: 1920,
    COMPRESSION_QUALITY: 0.85,
  },
  blobConfig: {
    PRODUCT_IMAGE_FOLDER: "products",
    CACHE_CONTROL_MAX_AGE: 31536000, // 1年
  },
  apiConfig: {
    PRODUCT_LIST_CACHE_SECONDS: 60,
    PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS: 120,
    CATEGORY_LIST_CACHE_SECONDS: 300,
    CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS: 600,
  },
  displayConfig: {
    GRID_COLUMNS: 3,
  },
};
```

**理由**:

- **一元管理**: 設定値を一箇所で管理し、変更が容易
- **型安全性**: TypeScript で型定義され、型安全な設定アクセスが可能
- **保守性**: 設定値の変更がコード全体に反映される

### 設定値の変更方法

設定値を変更する場合は、[`lib/config.ts`](../../lib/config.ts) を編集するだけです。

**例**: 画像の最大サイズを変更する場合

```typescript
// lib/config.ts
export const config = {
  imageConfig: {
    MAX_FILE_SIZE_MB: 5, // 4MB から 5MB に変更
    // ...
  },
  // ...
};
```

変更後は、この設定値を使用しているすべての箇所に自動的に反映されます。

## 環境変数の型安全な管理 (`lib/env.ts`)

環境変数を型安全に取得するユーティリティです。

**このアプリでの使用箇所**:

- [`lib/prisma.ts`](../../lib/prisma.ts): データベース接続情報の取得
- [`lib/blob.ts`](../../lib/blob.ts): Blob Storage トークンの取得

### getServerEnv

サーバーサイド環境変数を取得します（型安全）。

[`lib/env.ts`](../../lib/env.ts) (`getServerEnv`関数)

```typescript
export function getServerEnv(): ServerEnv {
  // アプリケーション用: Prisma AccelerateのURL
  const accelerateUrl = process.env.DATABASE_URL_ACCELERATE;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!accelerateUrl) {
    throw new Error(
      "DATABASE_URL_ACCELERATE is not set. " +
        "Please set it to your Prisma Accelerate URL (prisma://accelerate.prisma-data.net/?api_key=...). " +
        "Get your Accelerate URL from https://console.prisma.io/accelerate"
    );
  }

  // Prisma AccelerateのURL形式を確認
  if (!accelerateUrl.startsWith("prisma://")) {
    throw new Error(
      "DATABASE_URL_ACCELERATE must be a Prisma Accelerate URL (starting with prisma://). " +
        "Get your Accelerate URL from https://console.prisma.io/accelerate"
    );
  }

  if (!blobToken) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. " +
        "Please set it in your .env file or environment variables."
    );
  }

  return {
    DATABASE_URL_ACCELERATE: accelerateUrl,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BLOB_READ_WRITE_TOKEN: blobToken,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  };
}
```

**使用例**:

```typescript
import { getServerEnv } from "@/lib/env";

// Server Component や API Route で使用
const env = getServerEnv();
const accelerateUrl = env.DATABASE_URL_ACCELERATE; // 型安全
const blobToken = env.BLOB_READ_WRITE_TOKEN; // 型安全
```

**注意**: このアプリでは、Prisma Accelerate を使用しているため、`DATABASE_URL_ACCELERATE` が必須です。`POSTGRES_URL` はマイグレーション用に推奨されますが、アプリケーション実行時には必須ではありません。

**理由**:

- **型安全性**: 環境変数が型定義され、型安全なアクセスが可能
- **バリデーション**: 必須の環境変数が設定されていない場合、エラーを早期に検出
- **明確な分離**: サーバーサイドとクライアントサイドの環境変数を明確に分離

### getClientEnv

クライアントサイド環境変数を取得します（型安全）。

[`lib/env.ts`](../../lib/env.ts) (`getClientEnv`関数)

```typescript
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  };
}
```

**使用例**:

```typescript
import { getClientEnv } from "@/lib/env";

// Client Component で使用
const env = getClientEnv();
const projectId = env.NEXT_PUBLIC_STACK_PROJECT_ID; // 型安全
```

**理由**:

- **セキュリティ**: クライアントサイドで公開可能な環境変数のみを取得
- **型安全性**: クライアントサイド環境変数が型定義され、型安全なアクセスが可能

### 環境変数の使い分け

- **`getServerEnv()`**: Server Components や API Routes で使用
  - 機密情報（データベース URL、Blob Storage トークンなど）を含む
- **`getClientEnv()`**: Client Components で使用
  - `NEXT_PUBLIC_` プレフィックスが付いた公開可能な環境変数のみ

**注意**: `getEnv()` は deprecated です。代わりに `getServerEnv()` または `getClientEnv()` を使用してください。

## このアプリでのユーティリティ関数の使用例まとめ

### 商品関連ユーティリティ

1. **公開状態の自動判定**: [`app/page.tsx`](../../app/page.tsx) で `calculatePublishedStatus()` を使用
2. **価格フォーマット**: [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx) で `formatPrice()` を使用
3. **数値入力の検証**: [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx) で `isNumericKey()` を使用

### 画像圧縮

1. **商品画像の圧縮**: [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx) で `compressImage()` を使用

### Blob Storage

1. **画像のアップロード**: [`app/api/products/upload/route.ts`](../../app/api/products/upload/route.ts) で `uploadImage()` を使用
2. **画像の削除**: [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts) で `deleteFile()` を使用

### 設定管理

1. **画像サイズの制限**: [`lib/image-compression.ts`](../../lib/image-compression.ts) で `config.imageConfig` を使用
2. **API キャッシュの設定**: [`app/api/products/route.ts`](../../app/api/products/route.ts) で `config.apiConfig` を使用

## まとめ

このアプリケーションでは、`lib/` ディレクトリに以下のユーティリティ関数を配置し、プロジェクト全体で再利用可能な機能を提供しています：

1. **商品関連ユーティリティ**: 公開状態の判定、価格フォーマット、数値入力の検証
2. **画像圧縮**: クライアントサイドでの画像圧縮・リサイズ
3. **Blob Storage**: 画像のアップロード・削除・管理
4. **設定管理**: アプリケーション全体の設定値を一元管理
5. **環境変数**: 型安全な環境変数の取得

すべてのユーティリティ関数は型安全に実装され、エラーハンドリングが適切に行われています。また、設定値は [`lib/config.ts`](../../lib/config.ts) で一元管理され、変更が容易になっています。

## 参考リンク

- **[Prisma & Blob セットアップガイド](../setup-prisma-blob.md)**: Blob Storage のセットアップ方法
- **[開発ガイドライン](../development-guide.md)**: コーディング規約とベストプラクティス
- **[TypeScript ガイド](./typescript-guide.md)**: TypeScript の使用方法
- **[Vercel Blob Storage 公式ドキュメント](https://vercel.com/docs/storage/vercel-blob)**: Vercel Blob Storage の詳細
