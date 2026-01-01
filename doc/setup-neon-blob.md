# Neon & Blob セットアップガイド

## 概要
白熊堂プロジェクトでのVercel Neon（PostgreSQL）とVercel Blob Storageのセットアップと使用方法を説明します。

## インストール済みパッケージ

- `@neondatabase/serverless` `^1.0.2` - Neonデータベース接続用
- `@vercel/blob` `^2.0.0` - Blobストレージ操作用

## 環境変数

`.env`ファイルに以下の環境変数が設定されています：

```env
# データベース接続（Neon）
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## データベース（Neon）の使用方法

### 基本的な使用方法

`lib/db.ts`から必要な関数をインポートして使用します。

```typescript
import { query, queryOne, execute } from '@/lib/db';

// 複数行を取得
const users = await query('SELECT * FROM users WHERE active = $1', [true]);

// 単一行を取得
const user = await queryOne('SELECT * FROM users WHERE id = $1', [userId]);

// INSERT、UPDATE、DELETE
const rowCount = await execute(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  ['山田太郎', 'yamada@example.com']
);
```

### 型安全なクエリ

TypeScriptの型を指定してクエリを実行できます：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

const users = await query<User>('SELECT * FROM users');
const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [1]);
```

### トランザクション

```typescript
import { transaction } from '@/lib/db';

await transaction(async (sql) => {
  await sql.query('INSERT INTO users (name) VALUES ($1)', ['User 1']);
  await sql.query('INSERT INTO users (name) VALUES ($1)', ['User 2']);
  // エラーが発生した場合、自動的にロールバックされます
});
```

### 直接sqlオブジェクトを使用

より複雑なクエリが必要な場合は、直接`sql`オブジェクトを使用できます：

```typescript
import { sql } from '@/lib/db';

// @neondatabase/serverlessでは、sqlは関数として直接呼び出せます
const result = await sql('SELECT * FROM users');
const resultWithParams = await sql('SELECT * FROM users WHERE id = $1', [1]);
```

## Blob Storageの使用方法

### ファイルのアップロード

`lib/blob.ts`から必要な関数をインポートして使用します。

```typescript
import { uploadFile, uploadImage } from '@/lib/blob';

// 一般的なファイルのアップロード
const blob = await uploadFile(
  'documents/report.pdf',
  fileBuffer,
  {
    contentType: 'application/pdf',
    access: 'public',
  }
);

// 画像のアップロード（推奨）
const imageBlob = await uploadImage(
  'images/product.jpg',
  imageBuffer,
  'image/jpeg'
);

console.log(blob.url); // アップロードされたファイルのURL
```

### ファイル一覧の取得

```typescript
import { listFiles } from '@/lib/blob';

// すべてのファイルを取得
const { blobs } = await listFiles();

// プレフィックスでフィルタリング
const { blobs: images } = await listFiles({
  prefix: 'images/',
  limit: 100,
});
```

### ファイル情報の取得

```typescript
import { getBlobInfo } from '@/lib/blob';

const info = await getBlobInfo('https://...blob.vercel-storage.com/...');
console.log(info.size); // ファイルサイズ
console.log(info.uploadedAt); // アップロード日時
```

### ファイルの削除

```typescript
import { deleteFile, deleteFiles } from '@/lib/blob';

// 単一ファイルの削除
await deleteFile('https://...blob.vercel-storage.com/...');

// 複数ファイルの削除
await deleteFiles([
  'https://...blob.vercel-storage.com/file1.jpg',
  'https://...blob.vercel-storage.com/file2.jpg',
]);
```

## API Routesでの使用例

### データベースを使用するAPI Route

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const users = await query('SELECT * FROM users ORDER BY created_at DESC');
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

### Blob Storageを使用するAPI Route

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await uploadImage(file.name, buffer, file.type);

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

## データベーススキーマの作成

初期スキーマを作成する場合は、以下のようなSQLファイルを作成し、実行できます：

```sql
-- lib/schema.sql など
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

スキーマを実行するには、NeonのダッシュボードからSQLエディタを使用するか、マイグレーションツールを使用します。

## ベストプラクティス

### データベース

1. **接続プールの使用**: `DATABASE_URL`（pooler）を通常のクエリに使用し、`DATABASE_URL_UNPOOLED`はトランザクションや長時間実行されるクエリに使用します。

2. **エラーハンドリング**: すべてのデータベース操作で適切なエラーハンドリングを実装してください。

3. **SQLインジェクション対策**: パラメータ化クエリ（`$1`, `$2`など）を必ず使用してください。

4. **型安全性**: TypeScriptの型を活用して、クエリ結果の型安全性を確保してください。

### Blob Storage

1. **ファイル名の管理**: 一意のファイル名を生成するために、`addRandomSuffix`オプションを使用するか、UUIDなどを含めることを検討してください。

2. **キャッシュ制御**: 画像などの静的ファイルには適切な`cacheControlMaxAge`を設定してください。

3. **アクセス制御**: 公開する必要のないファイルは`access: 'private'`に設定してください。

4. **ファイルサイズ制限**: アップロード前にファイルサイズをチェックしてください（Vercel Blobの制限を確認）。

5. **エラーハンドリング**: アップロード失敗時の適切なエラーハンドリングを実装してください。

## トラブルシューティング

### データベース接続エラー

- 環境変数`DATABASE_URL`が正しく設定されているか確認してください
- Neonダッシュボードでデータベースがアクティブか確認してください
- SSL接続が必要な場合は、接続文字列に`?sslmode=require`が含まれているか確認してください

### Blob Storageエラー

- 環境変数`BLOB_READ_WRITE_TOKEN`が正しく設定されているか確認してください
- VercelダッシュボードでBlob Storageが有効になっているか確認してください
- ファイルサイズが制限を超えていないか確認してください

## 参考リンク

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Neon Documentation](https://neon.tech/docs)
- [@neondatabase/serverless GitHub](https://github.com/neondatabase/serverless)
- [@vercel/blob GitHub](https://github.com/vercel/storage/tree/main/packages/blob)
