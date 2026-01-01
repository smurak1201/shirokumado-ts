# Prisma & Blob セットアップガイド

## 概要
白熊堂プロジェクトでのPrisma（Neon PostgreSQL）とVercel Blob Storageのセットアップと使用方法を説明します。

## インストール済みパッケージ

- **Prisma** `^7.2.0` - ORMとマイグレーションツール
- **@prisma/client** `^7.2.0` - Prisma Client（型安全なデータベースクライアント）
- **@vercel/blob** `^2.0.0` - Blobストレージ操作用

## 環境変数

`.env`ファイルに以下の環境変数が設定されています：

```env
# データベース接続（Neon）
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Prismaの使用方法

### Prisma Clientのインポート

`lib/prisma.ts`からPrisma Clientをインポートして使用します。

```typescript
import { prisma } from '@/lib/prisma';

// すべてのユーザーを取得
const users = await prisma.user.findMany();

// 条件付きで取得
const activeUsers = await prisma.user.findMany({
  where: {
    active: true,
  },
});

// 単一レコードを取得
const user = await prisma.user.findUnique({
  where: {
    id: 1,
  },
});

// レコードを作成
const newUser = await prisma.user.create({
  data: {
    name: '山田太郎',
    email: 'yamada@example.com',
  },
});

// レコードを更新
const updatedUser = await prisma.user.update({
  where: {
    id: 1,
  },
  data: {
    name: '山田花子',
  },
});

// レコードを削除
await prisma.user.delete({
  where: {
    id: 1,
  },
});
```

### スキーマの定義

`prisma/schema.prisma`でデータベーススキーマを定義します。

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  active    Boolean  @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?  @map("image_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("products")
}
```

### マイグレーション

スキーマを変更した後、マイグレーションを作成・適用します。

```bash
# マイグレーションファイルを作成
npm run db:migrate

# スキーマを直接データベースにプッシュ（開発時のみ）
npm run db:push

# 本番環境でマイグレーションを適用
npm run db:migrate:deploy
```

### Prisma Clientの生成

スキーマを変更した後、Prisma Clientを再生成する必要があります。

```bash
npm run db:generate
```

ビルド時には自動的に実行されます。

### トランザクション

```typescript
import { prisma } from '@/lib/prisma';

// トランザクションを使用
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      name: '山田太郎',
      email: 'yamada@example.com',
    },
  });

  await tx.order.create({
    data: {
      userId: user.id,
      total: 1000,
    },
  });
});
```

### リレーション

```typescript
// リレーションを含めて取得
const userWithOrders = await prisma.user.findUnique({
  where: {
    id: 1,
  },
  include: {
    orders: true,
  },
});

// ネストしたリレーション
const userWithOrdersAndItems = await prisma.user.findUnique({
  where: {
    id: 1,
  },
  include: {
    orders: {
      include: {
        items: true,
      },
    },
  },
});
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

### Prismaを使用するAPI Route（ベストプラクティス）

```typescript
// app/api/users/route.ts
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { apiSuccess, handleApiError, withErrorHandling } from '@/lib/api-helpers';
import { NotFoundError, ValidationError } from '@/lib/errors';

// エラーハンドリングを自動化
export const GET = withErrorHandling(async () => {
  const users = await safePrismaOperation(
    () => prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }),
    'GET /api/users'
  );

  return apiSuccess({ users });
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();

  // バリデーション
  if (!body.name || !body.email) {
    throw new ValidationError('Name and email are required');
  }

  const user = await safePrismaOperation(
    () => prisma.user.create({
      data: body,
    }),
    'POST /api/users'
  );

  return apiSuccess({ user }, 201);
});
```

### Blob Storageを使用するAPI Route（ベストプラクティス）

```typescript
// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { uploadImage } from '@/lib/blob';
import { apiSuccess, withErrorHandling } from '@/lib/api-helpers';
import { ValidationError } from '@/lib/errors';

// ファイルサイズ制限（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new ValidationError('No file provided');
  }

  // ファイルサイズの検証
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError('File size exceeds 5MB limit');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await uploadImage(file.name, buffer, file.type);

  return apiSuccess({ url: blob.url });
});
```

### PrismaとBlob Storageを組み合わせた例

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const file = formData.get('image') as File;

    let imageUrl: string | undefined;

    // 画像をアップロード
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await uploadImage(`products/${file.name}`, buffer, file.type);
      imageUrl = blob.url;
    }

    // データベースに保存
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
```

## Prisma Studio

データベースの内容を視覚的に確認・編集するには、Prisma Studioを使用します。

```bash
npm run db:studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認できます。

## ベストプラクティス

### Prisma

1. **スキーマの管理**: `prisma/schema.prisma`でスキーマを一元管理します。

2. **マイグレーション**: 本番環境では必ずマイグレーションを使用してください。`db:push`は開発環境のみで使用します。

3. **Prisma Clientの生成**: スキーマを変更した後は必ず`npm run db:generate`を実行してください。

4. **型安全性**: Prisma Clientは自動的に型を生成するため、TypeScriptの型チェックを活用してください。

5. **接続プール**: Neonでは`DATABASE_URL`（pooler）を通常のクエリに使用し、`DATABASE_URL_UNPOOLED`はマイグレーションや長時間実行されるクエリに使用します。

6. **エラーハンドリング**: すべてのPrisma操作で適切なエラーハンドリングを実装してください。

### Blob Storage

1. **ファイル名の管理**: 一意のファイル名を生成するために、`addRandomSuffix`オプションを使用するか、UUIDなどを含めることを検討してください。

2. **キャッシュ制御**: 画像などの静的ファイルには適切な`cacheControlMaxAge`を設定してください。

3. **アクセス制御**: 公開する必要のないファイルは`access: 'private'`に設定してください。

4. **ファイルサイズ制限**: アップロード前にファイルサイズをチェックしてください（Vercel Blobの制限を確認）。

5. **エラーハンドリング**: アップロード失敗時の適切なエラーハンドリングを実装してください。

## トラブルシューティング

### Prisma関連

- **マイグレーションエラー**: スキーマとデータベースの状態が一致しない場合、`npm run db:push`で強制的に同期できます（開発環境のみ）。

- **Prisma Clientが見つからない**: `npm run db:generate`を実行してPrisma Clientを生成してください。

- **接続エラー**: 環境変数`DATABASE_URL`が正しく設定されているか確認してください。

### Blob Storage関連

- **アップロードエラー**: 環境変数`BLOB_READ_WRITE_TOKEN`が正しく設定されているか確認してください。

- **ファイルサイズエラー**: Vercel Blobの制限を確認してください。

## 参考リンク

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
