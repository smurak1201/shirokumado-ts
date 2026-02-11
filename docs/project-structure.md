# プロジェクト構造

白熊堂プロジェクトのディレクトリ構造と各ファイルの役割を説明します。

## このドキュメントの役割

このドキュメントは「**何がどこにあるか**」を説明します。ファイルの配置場所や役割を確認したいときに参照してください。

| ドキュメント | 役割 |
|---|---|
| [architecture.md](./architecture.md) | 設計思想と全体像（「なぜ」） |
| [development-guide.md](./development-guide.md) | コーディング規約の詳細（「どう書くか」） |
| **project-structure.md（このドキュメント）** | ファイル配置のリファレンス（「何がどこに」） |

**注意**: App Router のディレクトリ構造については、[App Router ガイド](./guides/frontend/app-router-guide.md#app-router-のディレクトリ構造)を参照してください。設計思想については、[アーキテクチャドキュメント](./architecture.md#ディレクトリ構造の設計思想)を参照してください。

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

ルートディレクトリの主要な構成です。詳細は各ディレクトリのセクションを参照してください。

```
shirokumado-ts/
├── app/                    # Next.js App Router（ページ、API、コンポーネント）
├── docs/                   # ドキュメント
├── lib/                    # ユーティリティ・ライブラリ
├── prisma/                 # Prisma設定・スキーマ
├── public/                 # 静的ファイル（画像など）
├── types/                  # グローバル型定義
│
├── auth.ts                 # Auth.js エントリーポイント
├── eslint.config.mjs       # ESLint設定
├── next.config.ts          # Next.js設定
├── package.json            # 依存関係
├── postcss.config.mjs      # PostCSS設定
├── prisma.config.ts        # Prisma設定（Prisma 7）
├── tsconfig.json           # TypeScript設定
└── README.md               # プロジェクト概要
```

## 各ディレクトリの詳細

### `app/` - Next.js App Router

Next.js 16 の App Router を使用しています。

```
app/
├── (public)/             # 公開ページ（Route Group）
├── api/                  # API Routes
├── auth/                 # 認証ページ
├── components/           # フロントエンド共通コンポーネント
├── dashboard/            # ダッシュボード
├── hooks/                # カスタムフック
│
├── apple-icon.png        # iOSホーム画面用アイコン（180x180）
├── icon.png              # ファビコン（32x32 PNG）
├── globals.css           # グローバルスタイル
├── layout.tsx            # ルートレイアウト
├── not-found.tsx         # 404ページ
└── types.ts              # フロントエンド共通型定義
```

#### `app/(public)/` - 公開ページ

Route Group を使用して公開ページをグループ化しています。

```
app/(public)/
├── faq/                  # FAQページ
│   ├── data.ts           # FAQデータ
│   └── page.tsx          # FAQページ（Server Component）
├── shop/                 # ショップページ
│   └── page.tsx          # ショップページ（Server Component）
│
├── error.tsx             # エラーページ
├── HomeContent.tsx       # ホームページのコンテンツ（Client Component）
└── page.tsx              # ホームページ（Server Component）
```

#### `app/api/` - API Routes

サーバーサイドの API エンドポイントを定義します。App Router の規約に従い、各ディレクトリに `route.ts` ファイルを配置します。

```
app/api/
├── auth/                 # 認証API
│   └── [...nextauth]/
│       └── route.ts      # NextAuth.js ハンドラー
├── cron/                 # Cronジョブ
│   └── cleanup-sessions/
│       └── route.ts      # セッションクリーンアップ
└── products/             # 商品API
    ├── [id]/             # 個別商品操作
    │   ├── delete.ts     # DELETE処理
    │   ├── get.ts        # GET処理
    │   ├── put-validation.ts  # PUT用バリデーション
    │   ├── put.ts        # PUT処理
    │   └── route.ts      # GET, PUT, DELETE /api/products/[id]
    ├── reorder/          # 商品順序変更
    │   └── route.ts      # POST /api/products/reorder
    ├── upload/           # 画像アップロード
    │   └── route.ts      # POST /api/products/upload
    └── route.ts          # GET, POST /api/products
```

**詳細については、[App Router ガイド](./guides/frontend/app-router-guide.md#api-routes) を参照してください。**

#### `app/auth/` - 認証ページ

```
app/auth/
├── error/                # 認証エラーページ
│   └── page.tsx
└── signin/               # サインインページ
    └── page.tsx
```

#### `app/components/` - フロントエンド共通コンポーネント

フロントエンドで使用する共通コンポーネントを配置します。

```
app/components/
├── ui/                       # shadcn/ui コンポーネントとラッパー
│   ├── badge.tsx             # shadcn/ui の Badge
│   ├── badge-price.tsx       # 価格表示用ラッパー
│   ├── card.tsx              # shadcn/ui の Card
│   ├── card-modal.tsx        # モーダル用ラッパー
│   ├── card-product.tsx      # 商品タイル用ラッパー
│   ├── dialog.tsx            # shadcn/ui の Dialog
│   ├── sonner.tsx            # Toast通知（sonner ラッパー）
│   └── ...                   # その他のコンポーネント
│
├── ErrorBoundary.tsx         # エラーバウンダリー
├── FAQSection.tsx            # FAQセクション
├── FixedHeader.tsx           # 固定ヘッダー（ロゴ、ナビゲーション）
├── Footer.tsx                # フッター（店舗情報、地図、連絡先）
├── HeroSection.tsx           # ヒーローセクション
├── LoadingScreen.tsx         # ローディング画面
├── ProductCategoryTabs.tsx   # カテゴリータブ切り替え（Client Component）
├── ProductGrid.tsx           # 商品グリッド表示（Client Component）
├── ProductModal.tsx          # 商品詳細モーダル
└── ProductTile.tsx           # 商品タイル
```

**設計の特徴**:

- **再利用性**: 複数のページで使用される共通コンポーネント
- **Server/Client 分離**: Server Component と Client Component を適切に使い分け
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **shadcn/ui の活用**: 統一されたデザインシステムを実現

**詳細**: [shadcn/ui ガイド](./guides/frontend/shadcn-ui-guide.md) を参照してください。

#### `app/dashboard/` - ダッシュボード

商品管理ダッシュボードの実装です。

```
app/dashboard/
├── components/           # ダッシュボード共通コンポーネント
│   └── DashboardHeader.tsx
├── homepage/             # 商品管理ページ
│   ├── components/       # UIコンポーネント
│   │   ├── form/         # フォーム関連（10ファイル）
│   │   ├── layout/       # レイアウト関連（3ファイル）
│   │   ├── list/         # リスト表示関連（6ファイル）
│   │   └── DashboardContent.tsx
│   ├── hooks/            # カスタムフック（9ファイル）
│   ├── utils/            # ユーティリティ関数（3ファイル）
│   ├── page.tsx          # エントリーポイント（Server Component）
│   └── types.ts          # 共通型定義
├── shop/                 # ショップ管理ページ
│   └── page.tsx
│
├── layout.tsx            # ダッシュボードレイアウト（認証チェック）
└── page.tsx              # ダッシュボードルートページ
```

<details>
<summary>homepage/ の詳細構造</summary>

```
app/dashboard/homepage/
├── components/
│   ├── form/
│   │   ├── ProductBasicFields.tsx
│   │   ├── ProductDateFields.tsx
│   │   ├── ProductDateInput.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductFormFields.tsx
│   │   ├── ProductFormFooter.tsx
│   │   ├── ProductFormModal.tsx
│   │   ├── ProductImageField.tsx
│   │   ├── ProductPriceFields.tsx
│   │   └── ProductPublishedField.tsx
│   ├── layout/
│   │   ├── LayoutCategoryTabs.tsx
│   │   ├── ProductLayoutTab.tsx
│   │   └── SortableProductItem.tsx
│   ├── list/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCardContent.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductListContent.tsx
│   │   ├── ProductListTabs.tsx
│   │   └── ProductSearchFilters.tsx
│   └── DashboardContent.tsx
├── hooks/
│   ├── useImageCompression.ts
│   ├── useImageUpload.ts
│   ├── useLocalStorageState.ts
│   ├── useProductDelete.ts
│   ├── useProductForm.ts
│   ├── useProductReorder.ts
│   ├── useProductSearch.ts
│   ├── useScrollPosition.ts
│   └── useTabState.ts
├── utils/
│   ├── productFormData.ts
│   ├── productFormSubmit.ts
│   └── productUtils.ts
├── page.tsx
└── types.ts
```

</details>

**設計の特徴**:

- **型安全性**: `types.ts`で共通型を定義し、全コンポーネントで使用
- **コンポーネント分割**: 大きなコンポーネントを小さな単位に分割
- **カスタムフック**: 状態管理ロジックを再利用可能なフックに分離
- **ユーティリティ関数**: ビジネスロジックを純粋関数として実装

#### `app/hooks/` - カスタムフック

フロントエンドで使用するカスタムフックを配置します。

```
app/hooks/
└── useProductModal.ts    # 商品モーダル管理フック（状態管理）
```

#### [`app/types.ts`](../app/types.ts) - フロントエンド共通型定義

フロントエンドで使用する型定義を一元管理します。

- `Category` - カテゴリー情報
- `Product` - 商品情報（詳細表示用）
- `ProductTile` - 商品情報（タイル表示用）

### `lib/` - ユーティリティ・ライブラリ

再利用可能な関数やユーティリティを定義します。

```
lib/
├── image-compression/    # クライアントサイド画像圧縮
│   ├── bitmap-loader.ts  # ImageBitmap読み込み
│   ├── blob-handlers.ts  # Blob変換処理
│   ├── blob-loader.ts    # Blob URL読み込み
│   ├── canvas.ts         # Canvas描画処理
│   ├── errors.ts         # エラー定義
│   ├── heic.ts           # HEIC変換処理
│   ├── index.ts          # エントリーポイント
│   ├── load.ts           # 画像読み込み処理
│   └── utils.ts          # 圧縮用ユーティリティ
│
├── api-helpers.ts        # API Routes用ヘルパー
├── api-types.ts          # APIレスポンスの型定義
├── auth-config.ts        # 認証設定（許可リストチェック）
├── blob.ts               # Blobストレージユーティリティ
├── client-fetch.ts       # クライアントサイドAPI呼び出しユーティリティ
├── config.ts             # アプリケーション設定
├── env.ts                # 環境変数管理
├── errors.ts             # 統一されたエラーハンドリング
├── logger.ts             # 構造化ログユーティリティ
├── prisma.ts             # Prisma Clientインスタンス
├── product-utils.ts      # 商品関連ユーティリティ
├── products.ts           # 商品データ取得関数
└── utils.ts              # 汎用ユーティリティ（clsx/tailwind-merge）
```

#### [`lib/api-helpers.ts`](../lib/api-helpers.ts)

API Routes 用のヘルパー関数を提供します。

- `withErrorHandling<T extends unknown[]>`: エラーハンドリングラッパー
- `apiSuccess<T>`: 成功レスポンスの生成
- `apiError`: エラーレスポンスの生成

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

#### [`lib/client-fetch.ts`](../lib/client-fetch.ts)

クライアントサイドのAPI呼び出しユーティリティを提供します。

- `fetchJson<T>`: レスポンスの`ok`チェックとJSONパースを統一したfetchラッパー

```typescript
import { fetchJson } from "@/lib/client-fetch";

const data = await fetchJson<{ products: Product[] }>("/api/products");
```

#### [`lib/api-types.ts`](../lib/api-types.ts)

API レスポンスの型定義を提供します。

```typescript
import type { GetProductsResponse, PostProductResponse } from "@/lib/api-types";

const response: GetProductsResponse = await fetch("/api/products").then((r) =>
  r.json()
);
```

#### [`lib/blob.ts`](../lib/blob.ts)

Vercel Blob Storage の操作を提供します。

```typescript
import { uploadImage, deleteFile } from "@/lib/blob";

const blob = await uploadImage("images/product.jpg", buffer, "image/jpeg");
```

#### [`lib/config.ts`](../lib/config.ts)

アプリケーション設定の一元管理:

- 画像アップロード設定（最大サイズ、圧縮品質など）
- Blob Storage 設定（フォルダ名、キャッシュ期間など）
- API 設定（キャッシュ期間など）
- 表示設定（グリッド列数など）

#### [`lib/errors.ts`](../lib/errors.ts)

統一されたエラーハンドリングとエラーコード定数を提供します。

```typescript
import { AppError, DatabaseError, ValidationError, ErrorCodes } from "@/lib/errors";

throw new ValidationError("Invalid input");
```

#### [`lib/logger.ts`](../lib/logger.ts)

構造化ログユーティリティを提供します。

```typescript
import { log } from "@/lib/logger";

log.info("User logged in", { userId: user.id });
log.error("Database operation failed", { context: "getProducts", error });
```

#### [`lib/prisma.ts`](../lib/prisma.ts)

Prisma Client のシングルトンインスタンスを管理します。

```typescript
import { prisma, safePrismaOperation } from "@/lib/prisma";

const users = await safePrismaOperation(
  () => prisma.user.findMany(),
  "getUsers"
);
```

**詳細**: [ユーティリティ関数ガイド](./guides/backend/utilities-guide.md)、[TypeScript ガイド - ジェネリクス](./guides/basics/typescript-guide.md#ジェネリクス)を参照してください。

### `prisma/` - Prisma 設定

データベーススキーマとマイグレーションを管理します。

```
prisma/
├── migrations/           # マイグレーションファイル（自動生成）
├── seeds/                # テーブルごとのシードデータ
│   ├── roles.ts          # ロールマスター
│   ├── allowed-admins.ts # 許可管理者
│   ├── categories.ts     # カテゴリー
│   └── products.ts       # 商品
├── schema.prisma         # データベーススキーマ定義
└── seed.ts               # シーダーエントリーポイント（個別テーブル指定可能）
```

#### [`prisma/schema.prisma`](../prisma/schema.prisma)

データベーススキーマを定義します。

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

### `public/` - 静的ファイル

静的ファイル（画像など）を配置します。

```
public/
├── hero.webp             # ヒーロー画像
├── icon-192x192.png      # PWA用アイコン（192x192）
├── icon-512x512.png      # PWA用アイコン（512x512）
├── logo-instagram.svg    # Instagramアイコン
├── logo.webp             # ロゴ画像
└── manifest.webmanifest  # Web App Manifest
```

### `types/` - グローバル型定義

```
types/
└── next-auth.d.ts        # NextAuth.js の型拡張
```

## ファイル命名規則

命名規則の詳細（ファイル名、変数・関数名、コンポーネント名など）については、[開発ガイドライン - 命名規則](./development-guide.md#命名規則)を参照してください。

### Next.js の規約

- **ページ**: `page.tsx`
- **レイアウト**: `layout.tsx`
- **API Routes**: `route.ts`
- **動的ルート**: `[id]/route.ts`

## ファイルの役割

### 設定ファイル

- **[`auth.ts`](../auth.ts)**: Auth.js エントリーポイント
- **[`eslint.config.mjs`](../eslint.config.mjs)**: ESLint の設定
- **[`next.config.ts`](../next.config.ts)**: Next.js の設定（画像最適化、セキュリティヘッダーなど）
- **[`postcss.config.mjs`](../postcss.config.mjs)**: PostCSS の設定
- **[`prisma.config.ts`](../prisma.config.ts)**: Prisma 7 の設定（接続情報など）
- **[`tsconfig.json`](../tsconfig.json)**: TypeScript の設定

### ドキュメント

```
docs/
├── guides/                    # ガイド系ドキュメント
│   ├── app-router-guide.md    # App Router ガイド
│   ├── async-await-guide.md   # Async/Await ガイド
│   ├── authjs-guide.md        # Auth.js ガイド
│   ├── claude-skills-guide.md # Claude スキルガイド
│   ├── dashboard-guide.md     # ダッシュボードガイド
│   ├── frontend-guide.md      # フロントエンドガイド
│   ├── git-github-guide.md    # Git/GitHub ガイド
│   ├── jsx-guide.md           # JSX ガイド
│   ├── learning-guide.md      # 勉強用ガイド
│   ├── nextjs-guide.md        # Next.js ガイド
│   ├── prisma-guide.md        # Prisma ガイド
│   ├── react-guide.md         # React ガイド
│   ├── shadcn-ui-guide.md     # shadcn/ui ガイド
│   ├── styling-best-practices.md # スタイリングベストプラクティス
│   ├── typescript-guide.md    # TypeScript ガイド
│   └── utilities-guide.md     # ユーティリティ関数ガイド
│
├── architecture.md            # アーキテクチャと設計思想
├── authentication.md          # 認証の詳細
├── development-guide.md       # 開発ガイドライン
├── project-structure.md       # プロジェクト構造（このファイル）
├── setup-prisma-blob.md       # Prisma & Blob セットアップ
└── tech-stack.md              # 技術スタック
```

- **[`README.md`](../README.md)**: プロジェクトの概要とセットアップ手順

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
```

**理由**:

- **可読性**: パスの起点が明確で、どこからインポートしているかが一目でわかる
- **保守性**: ファイルの移動時にパスの変更が不要で、リファクタリングが容易
- **一貫性**: プロジェクト全体で統一されたインポートパスが使用される
- **IDE 支援**: TypeScript のパスエイリアスにより、自動補完や型チェックが機能する

```typescript
// 悪い例（深い相対パス）
import { prisma } from "../../../lib/prisma";
```

**理由**:

- **可読性**: 深い相対パスは読みにくく、どこからインポートしているかが不明確
- **保守性**: ファイルの移動時にパスの変更が必要で、リファクタリングが困難
- **エラーの発生**: パスの階層を間違えやすく、インポートエラーが発生しやすい
- **一貫性**: ファイルの場所によって異なるパス形式が使用され、コードが不統一になる

## 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
