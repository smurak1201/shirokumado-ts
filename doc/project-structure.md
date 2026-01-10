# プロジェクト構造

白熊堂プロジェクトのディレクトリ構造と各ファイルの役割を説明します。

## 目次

- [ディレクトリ構造](#ディレクトリ構造)
- [各ディレクトリの詳細](#各ディレクトリの詳細)
  - [app/ - Next.js App Router](#app---nextjs-app-router)
  - [lib/ - ユーティリティ・ライブラリ](#lib---ユーティリティライブラリ)
  - [prisma/ - Prisma 設定](#prisma---prisma-設定)
  - [public/ - 静的ファイル](#public---静的ファイル)
- [ファイル命名規則](#ファイル命名規則)
- [ファイルの役割](#ファイルの役割)
  - [設定ファイル](#設定ファイル)
  - [ドキュメント](#ドキュメント)
- [ベストプラクティス](#ベストプラクティス)
  - [ファイルの配置](#ファイルの配置)
  - [インポートパス](#インポートパス)
- [参考リンク](#参考リンク)

## ディレクトリ構造

```
shirokumado-ts/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── products/     # 商品API
│   │   │   ├── route.ts  # GET, POST /api/products
│   │   │   ├── upload/   # 画像アップロード
│   │   │   │   └── route.ts
│   │   │   ├── reorder/  # 商品順序変更
│   │   │   │   └── route.ts
│   │   │   └── [id]/     # 個別商品操作
│   │   │       └── route.ts
│   │   └── categories/   # カテゴリーAPI
│   │       └── route.ts
│   ├── dashboard/         # ダッシュボード
│   │   ├── page.tsx      # ダッシュボードページ（Server Component）
│   │   ├── types.ts       # 共通型定義
│   │   ├── components/    # ダッシュボードコンポーネント
│   │   │   ├── DashboardContent.tsx
│   │   │   ├── DashboardForm.tsx
│   │   │   ├── DashboardFormWrapper.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductEditForm.tsx
│   │   │   ├── CategoryTabs.tsx
│   │   │   └── SortableProductItem.tsx
│   │   ├── hooks/        # カスタムフック
│   │   │   ├── useTabState.ts
│   │   │   └── useProductReorder.ts
│   │   └── utils/        # ユーティリティ関数
│   │       └── productUtils.ts
│   ├── types.ts          # フロントエンド共通型定義
│   ├── hooks/            # カスタムフック
│   │   ├── useModal.ts   # モーダル管理フック
│   │   └── useProductModal.ts # 商品モーダル管理フック
│   ├── utils/            # ユーティリティ関数
│   │   └── format.ts     # フォーマット関数
│   ├── components/       # フロントエンド共通コンポーネント
│   │   ├── icons/        # アイコンコンポーネント
│   │   │   └── CloseIcon.tsx # 閉じるアイコン
│   │   ├── Header.tsx    # ヘッダーコンポーネント
│   │   ├── Footer.tsx    # フッターコンポーネント
│   │   ├── ProductGrid.tsx # 商品グリッドコンポーネント
│   │   ├── ProductTile.tsx # 商品タイルコンポーネント
│   │   └── ProductModal.tsx # 商品詳細モーダルコンポーネント
│   ├── faq/              # FAQページ
│   │   └── page.tsx      # よくある質問ページ
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ホームページ
│
├── lib/                    # ユーティリティ・ライブラリ
│   ├── prisma.ts         # Prisma Clientインスタンス
│   ├── blob.ts           # Blobストレージユーティリティ
│   ├── env.ts            # 環境変数管理
│   ├── errors.ts         # 統一されたエラーハンドリング
│   ├── api-helpers.ts     # API Routes用ヘルパー
│   ├── config.ts         # アプリケーション設定
│   ├── image-compression.ts # 画像圧縮ユーティリティ
│   └── product-utils.ts  # 商品関連ユーティリティ
│
├── prisma/                 # Prisma設定
│   ├── schema.prisma     # データベーススキーマ定義
│   └── migrations/       # マイグレーションファイル
│
├── public/                 # 静的ファイル
│   ├── favicon.ico       # ファビコン
│   ├── logo.webp         # ロゴ画像
│   ├── logo-instagram.svg # Instagramアイコン
│   └── hero.webp         # ヒーロー画像
│
├── doc/                    # ドキュメント
│   ├── getting-started.md  # コードリーディングガイド
│   ├── architecture.md     # アーキテクチャと設計思想
│   ├── project-structure.md # プロジェクト構造（このファイル）
│   ├── tech-stack.md       # 技術スタック
│   ├── development-guide.md # 開発ガイドライン
│   ├── setup-prisma-blob.md # Prisma & Blob セットアップ
│   ├── deployment.md       # デプロイメントガイド
│   └── guides/            # ガイド系ドキュメント
│       ├── frontend-guide.md   # フロントエンドガイド
│       ├── dashboard-guide.md  # ダッシュボードガイド
│       ├── nextjs-guide.md     # Next.js ガイド
│       ├── app-router-guide.md # App Router ガイド
│       ├── react-guide.md      # React ガイド
│       ├── jsx-guide.md        # JSX ガイド
│       ├── typescript-guide.md # TypeScript ガイド
│       └── prisma-guide.md     # Prisma ガイド
│
├── .env                    # 環境変数（.gitignoreに含まれる）
├── .gitignore            # Git除外設定
├── eslint.config.mjs      # ESLint設定
├── next.config.ts         # Next.js設定
├── package.json           # 依存関係
├── prisma.config.ts       # Prisma設定（Prisma 7）
├── tsconfig.json          # TypeScript設定
└── README.md              # プロジェクト概要
```

## 各ディレクトリの詳細

### `app/` - Next.js App Router

Next.js 16 の App Router を使用しています。

##### `app/api/` - API Routes

サーバーサイドの API エンドポイントを定義します。App Router の規約に従い、各ディレクトリに `route.ts` ファイルを配置します。

**実際の構造**:

```
app/api/
├── products/
│   ├── route.ts          # GET, POST /api/products
│   ├── upload/
│   │   └── route.ts      # POST /api/products/upload
│   ├── reorder/
│   │   └── route.ts      # POST /api/products/reorder
│   └── [id]/
│       └── route.ts      # GET, PUT, DELETE /api/products/[id]
└── categories/
    └── route.ts          # GET /api/categories
```

**詳細については、[App Router ガイド](./guides/app-router-guide.md#api-routes) を参照してください。**

#### `app/types.ts` - フロントエンド共通型定義

フロントエンドで使用する型定義を一元管理します。

```
app/types.ts
├── Category              # カテゴリー情報
├── Product               # 商品情報（詳細表示用）
└── ProductTile          # 商品情報（タイル表示用）
```

**設計の特徴**:

- **型の一元管理**: 型定義の重複を防止
- **一貫性の確保**: 全コンポーネントで同じ型を使用
- **変更時の影響範囲が明確**: 型定義を変更する際の影響範囲が明確

#### `app/hooks/` - カスタムフック

フロントエンドで使用するカスタムフックを配置します。

```
app/hooks/
├── useModal.ts          # モーダル管理フック（ESCキー、スクロール無効化）
└── useProductModal.ts   # 商品モーダル管理フック（状態管理）
```

**設計の特徴**:

- **再利用性**: 複数のコンポーネントで使用可能
- **関心の分離**: UI ロジックと状態管理ロジックを分離
- **テストしやすさ**: フック単体でテスト可能

#### `app/utils/` - ユーティリティ関数

フロントエンドで使用するユーティリティ関数を配置します。

```
app/utils/
└── format.ts            # フォーマット関数（価格フォーマットなど）
```

**設計の特徴**:

- **純粋関数**: 副作用のない純粋関数として実装
- **再利用性**: 複数のコンポーネントで使用可能
- **テストしやすさ**: 純粋関数なのでテストが容易

#### `app/components/` - フロントエンド共通コンポーネント

フロントエンドで使用する共通コンポーネントを配置します。

```
app/components/
├── icons/               # アイコンコンポーネント
│   └── CloseIcon.tsx   # 閉じるアイコン
├── Header.tsx           # ヘッダー（ロゴ、Instagramリンク、ナビゲーション）
├── Footer.tsx           # フッター（店舗情報、地図、連絡先）
├── ProductGrid.tsx      # カテゴリーごとの商品グリッド表示（Client Component）
├── ProductTile.tsx      # 商品タイルコンポーネント
└── ProductModal.tsx     # 商品詳細モーダルコンポーネント
```

**設計の特徴**:

- **再利用性**: 複数のページで使用される共通コンポーネント
- **Server/Client 分離**: Server Component と Client Component を適切に使い分け
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **関心の分離**: UI コンポーネントとロジック（フック）を分離

#### `app/faq/` - FAQ ページ

よくある質問ページの実装です。

```
app/faq/
└── page.tsx              # FAQページ（Server Component）
```

#### `app/dashboard/` - ダッシュボード

商品管理ダッシュボードの実装です。

```
app/dashboard/
├── page.tsx              # ダッシュボードページ（Server Component）
├── types.ts              # 共通型定義（Category, Product）
├── components/           # コンポーネント
│   ├── DashboardContent.tsx      # メインコンテナ
│   ├── DashboardForm.tsx         # 新規商品登録フォーム
│   ├── DashboardFormWrapper.tsx  # フォームラッパー
│   ├── ProductList.tsx           # 商品一覧・配置変更
│   ├── ProductEditForm.tsx       # 商品編集フォーム
│   ├── CategoryTabs.tsx          # カテゴリータブ
│   └── SortableProductItem.tsx  # ドラッグ&ドロップ可能な商品アイテム
├── hooks/                # カスタムフック
│   ├── useTabState.ts            # タブ状態管理（localStorage連携）
│   └── useProductReorder.ts      # 商品順序変更ロジック
└── utils/                # ユーティリティ関数
    └── productUtils.ts           # 商品のグループ化・フィルタリング
```

**設計の特徴**:

- **型安全性**: `types.ts`で共通型を定義し、全コンポーネントで使用
- **コンポーネント分割**: 大きなコンポーネントを小さな単位に分割
- **カスタムフック**: 状態管理ロジックを再利用可能なフックに分離
- **ユーティリティ関数**: ビジネスロジックを純粋関数として実装

### `lib/` - ユーティリティ・ライブラリ

再利用可能な関数やユーティリティを定義します。

#### `lib/prisma.ts`

Prisma Client のシングルトンインスタンスを管理します。

```typescript
import { prisma, safePrismaOperation } from "@/lib/prisma";

// 使用例
const users = await safePrismaOperation(
  () => prisma.user.findMany(),
  "getUsers"
);
```

#### `lib/blob.ts`

Vercel Blob Storage の操作を提供します。

```typescript
import { uploadImage, deleteFile } from "@/lib/blob";

// 使用例
const blob = await uploadImage("images/product.jpg", buffer, "image/jpeg");
```

#### `lib/errors.ts`

統一されたエラーハンドリングを提供します。

```typescript
import { AppError, DatabaseError, ValidationError } from "@/lib/errors";

// 使用例
throw new ValidationError("Invalid input");
```

#### `lib/api-helpers.ts`

API Routes 用のヘルパー関数を提供します。

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

#### `lib/` - その他のユーティリティ

```
lib/
├── config.ts              # アプリケーション設定（画像サイズ、キャッシュなど）
├── image-compression.ts   # クライアントサイド画像圧縮
└── product-utils.ts       # 商品関連ユーティリティ（公開状態計算など）
```

**設定の一元管理** (`lib/config.ts`):

- 画像アップロード設定（最大サイズ、圧縮品質など）
- Blob Storage 設定（フォルダ名、キャッシュ期間など）
- API 設定（キャッシュ期間など）
- 表示設定（グリッド列数など）

### `prisma/` - Prisma 設定

データベーススキーマとマイグレーションを管理します。

#### `prisma/schema.prisma`

データベーススキーマを定義します。

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

#### `prisma/migrations/`

マイグレーションファイルが自動生成されます。

```
prisma/migrations/
├── 20240101000000_init/
│   └── migration.sql
└── 20240102000000_add_user_table/
    └── migration.sql
```

### `public/` - 静的ファイル

静的ファイル（画像、ファビコンなど）を配置します。

```
public/
├── images/
│   ├── logo.png
│   └── products/
├── favicon.ico
└── robots.txt
```

## ファイル命名規則

### コンポーネント

- **ページ**: `page.tsx`（Next.js App Router の規約）
- **レイアウト**: `layout.tsx`
- **ローディング**: `loading.tsx`
- **エラー**: `error.tsx`
- **404**: `not-found.tsx`

### API Routes

- **ルートハンドラー**: `route.ts`
- **動的ルート**: `[id]/route.ts`

### ユーティリティ

- **単一機能**: `camelCase.ts`（例: `formatDate.ts`）
- **複数機能**: `plural.ts`（例: `formatters.ts`）

## ファイルの役割

### 設定ファイル

- **`next.config.ts`**: Next.js の設定（画像最適化、環境変数など）
- **`tsconfig.json`**: TypeScript の設定
- **`prisma.config.ts`**: Prisma 7 の設定（接続情報など）
- **`eslint.config.mjs`**: ESLint の設定

### ドキュメント

- **`README.md`**: プロジェクトの概要とセットアップ手順
- **`doc/getting-started.md`**: コードリーディングガイド
- **`doc/architecture.md`**: アーキテクチャと設計思想
- **`doc/project-structure.md`**: プロジェクト構造（このファイル）
- **`doc/tech-stack.md`**: 技術スタックの詳細
- **`doc/guides/frontend-guide.md`**: フロントエンドガイド
- **`doc/guides/dashboard-guide.md`**: ダッシュボードガイド
- **`doc/development-guide.md`**: 開発ガイドライン
- **`doc/guides/nextjs-guide.md`**: Next.js の詳細な使用方法
- **`doc/guides/app-router-guide.md`**: Next.js App Router の詳細な使用方法
- **`doc/guides/react-guide.md`**: React の詳細な使用方法
- **`doc/guides/jsx-guide.md`**: JSX の構文と使用方法
- **`doc/guides/typescript-guide.md`**: TypeScript の詳細な使用方法
- **`doc/guides/prisma-guide.md`**: Prisma の詳細な使用方法
- **`doc/setup-prisma-blob.md`**: Prisma と Blob のセットアップガイド
- **`doc/deployment.md`**: デプロイメントガイド

## ベストプラクティス

### ファイルの配置

1. **コンポーネント**: 再利用可能なものは`app/components/`に配置
2. **ユーティリティ**: 汎用的なものは`lib/utils/`に配置
3. **型定義**: 共有型は`lib/types/`に配置（必要に応じて）

### インポートパス

- **絶対パス**: `@/lib/prisma`を使用（`tsconfig.json`で設定）
- **相対パス**: 同じディレクトリ内のみで使用

```typescript
// 良い例
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";

// 悪い例（深い相対パス）
import { prisma } from "../../../lib/prisma";
```

## 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
