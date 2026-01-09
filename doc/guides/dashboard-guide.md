# ダッシュボードガイド

白熊堂プロジェクトの商品管理ダッシュボードについて詳しく説明します。

## 📋 目次

- [概要](#概要)
- [アーキテクチャ](#アーキテクチャ)
- [主要機能](#主要機能)
- [コンポーネント構成](#コンポーネント構成)
- [データフロー](#データフロー)
- [状態管理](#状態管理)
- [API 連携](#api連携)
- [開発ガイド](#開発ガイド)

## 概要

商品管理ダッシュボードは、店舗スタッフが商品情報を管理するための管理画面です。商品の登録、編集、削除、順序変更などの機能を提供します。

### 技術スタック

- **Next.js 16** (App Router)
- **React 19** (Server Components / Client Components)
- **TypeScript**
- **Prisma** (ORM)
- **Tailwind CSS**
- **@dnd-kit** (ドラッグ&ドロップ)

### アクセス方法

`/dashboard` にアクセスすることで、ダッシュボードページにアクセスできます。

## アーキテクチャ

### Server Component + Client Component パターン

ダッシュボードは、Server Component と Client Component を組み合わせた実装です。

```
DashboardPage (Server Component)
  ↓ データ取得（Prisma）
  ↓ propsで渡す
DashboardContent (Client Component)
  ├── DashboardFormWrapper
  │   └── DashboardForm
  └── ProductList
      ├── CategoryTabs
      └── SortableProductItem
```

### ディレクトリ構造

```
app/dashboard/
├── page.tsx                    # エントリーポイント（Server Component）
├── types.ts                    # 共通型定義
├── components/                 # UIコンポーネント
│   ├── DashboardContent.tsx    # メインコンテナ
│   ├── DashboardForm.tsx       # 新規商品登録フォーム
│   ├── DashboardFormWrapper.tsx # フォームラッパー
│   ├── ProductList.tsx         # 商品一覧・配置変更
│   ├── ProductEditForm.tsx     # 商品編集フォーム
│   ├── CategoryTabs.tsx        # カテゴリータブ
│   └── SortableProductItem.tsx # ドラッグ&ドロップ可能な商品アイテム
├── hooks/                      # カスタムフック
│   ├── useTabState.ts          # タブ状態管理
│   └── useProductReorder.ts     # 商品順序変更ロジック
└── utils/                      # ユーティリティ関数
    └── productUtils.ts          # 商品のグループ化・フィルタリング
```

## 主要機能

### 1. 商品一覧表示

- カテゴリーごとのタブ表示
- 商品の一覧表示
- 検索機能
- 公開/非公開のフィルタリング

### 2. 商品登録

- 新規商品の登録
- 画像アップロード
- カテゴリー選択
- 価格設定（S サイズ、L サイズ）
- 公開設定（手動/自動）

### 3. 商品編集

- 既存商品の情報更新
- 画像の差し替え
- 公開状態の変更

### 4. 商品削除

- 商品の削除機能
- 削除確認ダイアログ

### 5. 商品順序変更

- ドラッグ&ドロップによる順序変更
- 楽観的 UI 更新
- カテゴリーごとの順序管理

## コンポーネント構成

### DashboardPage (`page.tsx`)

ダッシュボードページのエントリーポイントです。Server Component として実装されています。

**主な処理**:

- カテゴリーと商品データの取得
- データの形式変換（Decimal 型 → Number 型、Date 型 → ISO 文字列）
- Client Component へのデータ受け渡し

**実装例**:

```typescript
export default async function DashboardPage() {
  const { categories, products } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>
        <DashboardContent categories={categories} initialProducts={products} />
      </div>
    </div>
  );
}
```

### DashboardContent (`components/DashboardContent.tsx`)

ダッシュボードのメインコンテナです。Client Component として実装されています。

**主な機能**:

- 商品リストの状態管理（状態のリフトアップ）
- フォームの表示/非表示制御
- 商品一覧の更新処理

**状態管理**:

React のベストプラクティスに従い、共有状態（商品一覧）を親コンポーネントで管理しています。

```typescript
// 商品一覧の状態を親コンポーネントで管理（状態のリフトアップ）
const [products, setProducts] = useState<Product[]>(initialProducts);

// 商品登録フォームの開閉状態を管理
const [isFormOpen, setIsFormOpen] = useState(false);

// 商品一覧をサーバーから取得して更新する関数
const refreshProducts = async () => {
  const response = await fetch(`/api/products?t=${Date.now()}`, {
    cache: "no-store",
  });
  const data = await response.json();
  setProducts(data.products || []);
};
```

**設計の特徴**:

- `forwardRef`や`useImperativeHandle`を使わず、props でデータとコールバックを渡す
- データフローが明確になり、コンポーネント間の結合が緩くなる
- 子コンポーネント（`ProductList`）に`products`、`setProducts`、`refreshProducts`を props で渡す

### DashboardForm (`components/DashboardForm.tsx`)

新規商品登録フォームです。

**主な機能**:

- フォーム入力の管理
- 画像アップロード
- バリデーション
- フォーム送信

**フォーム項目**:

- 商品名
- 説明
- カテゴリー
- 画像
- S サイズ価格
- L サイズ価格
- 公開設定（手動/自動）
- 公開日（自動設定の場合）
- 終了日（自動設定の場合）

### ProductList (`components/ProductList.tsx`)

商品一覧の表示と配置変更機能を実装しています。

**主な機能**:

- カテゴリータブの表示
- 商品一覧の表示
- 検索機能
- ドラッグ&ドロップによる順序変更
- 商品の編集・削除

**Props**:

```typescript
interface ProductListProps {
  products: Product[]; // 商品一覧（親コンポーネントから受け取る）
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>; // 状態更新関数
  refreshProducts: () => Promise<void>; // 商品一覧を更新する関数
  categories: Category[]; // カテゴリー一覧
  onNewProductClick?: () => void; // 新規商品登録ボタンクリック時のコールバック
}
```

**実装の特徴**:

- React のベストプラクティスに従い、状態を親コンポーネントから受け取る
- `forwardRef`や`useImperativeHandle`を使わない設計
- `@dnd-kit`を使用したドラッグ&ドロップ
- 楽観的 UI 更新
- タブ状態の localStorage 連携

### CategoryTabs (`components/CategoryTabs.tsx`)

カテゴリータブの UI コンポーネントです。

**主な機能**:

- カテゴリーのタブ表示
- アクティブタブのハイライト
- スクロール可能なタブ

### SortableProductItem (`components/SortableProductItem.tsx`)

ドラッグ&ドロップ可能な商品アイテムコンポーネントです。

**主な機能**:

- 商品情報の表示
- ドラッグ&ドロップの実装
- 編集・削除ボタン

## データフロー

### 初期データ取得

```
DashboardPage (Server Component)
  ↓ getDashboardData()
  ↓ Prismaクエリ
Database
  ↓ データ変換
  ↓ propsで渡す
DashboardContent (Client Component)
  ↓ useStateで状態管理
子コンポーネント
```

### 商品追加フロー

```
DashboardForm
  ↓ フォーム入力
  ↓ バリデーション
  ↓ fetch('/api/products', { method: 'POST' })
API Route
  ↓ Prisma操作
Database
  ↓ レスポンス
DashboardContent
  ↓ refreshProducts() を呼び出し
  ↓ fetch('/api/products') で最新データを取得
  ↓ setProducts() で状態更新
  ↓ propsで ProductList に渡す
  ↓ UI更新
```

**設計のポイント**:

- 商品追加後は、親コンポーネント（`DashboardContent`）の`refreshProducts`を呼び出す
- 状態は親コンポーネントで管理され、props で子コンポーネントに渡される
- データフローが明確で、React のベストプラクティスに沿った実装

### 商品順序変更フロー

```
SortableProductItem
  ↓ ドラッグ&ドロップ
ProductList
  ↓ 楽観的UI更新（即座に状態更新）
  ↓ fetch('/api/products/reorder', { method: 'POST' })
API Route
  ↓ Prisma操作
Database
  ↓ 成功: 最新データを取得
  ↓ 失敗: エラー表示 + 元の状態に戻す
```

## 状態管理

### 状態のリフトアップ

React のベストプラクティスに従い、共有状態は親コンポーネントで管理します。

**状態管理の階層**:

1. **`DashboardContent`**（親コンポーネント）:

   - `products`: 商品リスト（共有状態）
   - `isFormOpen`: フォームの表示/非表示
   - `refreshProducts`: 商品一覧を更新する関数

2. **`ProductList`**（子コンポーネント）:
   - `editingProduct`: 編集中の商品（ローカル状態）
   - `searchName`: 検索条件（ローカル状態）
   - `searchPublished`: 公開状態フィルター（ローカル状態）
   - `searchCategoryId`: カテゴリーフィルター（ローカル状態）

**設計の利点**:

- データフローが明確（親から子へ props で流れる）
- コンポーネント間の結合が緩くなる
- `forwardRef`や`useImperativeHandle`を使わない宣言的な実装
- テストしやすく、再利用性が高い

### useState

基本的な状態管理は React の `useState` を使用します。

### カスタムフック

#### useTabState (`hooks/useTabState.ts`)

タブ状態を localStorage と同期するカスタムフックです。

**機能**:

- タブ状態の保存・復元
- localStorage との同期

**使用例**:

```typescript
const { activeTab, setActiveTab } = useTabState();
```

#### useProductReorder (`hooks/useProductReorder.ts`)

商品順序変更のロジックを実装したカスタムフックです。

**機能**:

- 楽観的 UI 更新
- API 呼び出し
- エラーハンドリング

**使用例**:

```typescript
const { reorderProducts } = useProductReorder(setProducts, refreshProducts);
```

## API 連携

### 商品一覧取得

```typescript
GET / api / products;
```

### 商品作成

```typescript
POST /api/products
Content-Type: application/json

{
  "name": "商品名",
  "description": "説明",
  "categoryId": 1,
  "imageUrl": "https://...",
  "priceS": 500,
  "priceL": 800,
  "published": true
}
```

### 商品更新

```typescript
PUT /api/products/[id]
Content-Type: application/json

{
  "name": "更新後の商品名",
  // ...
}
```

### 商品削除

```typescript
DELETE / api / products / [id];
```

### 商品順序変更

```typescript
POST /api/products/reorder
Content-Type: application/json

{
  "productId": 1,
  "newOrder": 2
}
```

### 画像アップロード

```typescript
POST /api/products/upload
Content-Type: multipart/form-data

file: [画像ファイル]
```

## 開発ガイド

### 新しい機能の追加

1. **型定義の追加**: `app/dashboard/types.ts`に追加
2. **コンポーネントの作成**: `app/dashboard/components/`に追加
3. **カスタムフックの作成**: `app/dashboard/hooks/`に追加（必要に応じて）
4. **API Route の作成**: `app/api/`に追加（必要に応じて）

### バリデーション

フォームのバリデーションは、クライアントサイドとサーバーサイドの両方で実装されています。

**クライアントサイド**:

- リアルタイムバリデーション
- エラーメッセージの表示

**サーバーサイド**:

- API Route での入力検証
- データベース制約の確認

### エラーハンドリング

エラーハンドリングは統一されています：

- **API Routes**: `lib/api-helpers.ts`の`withErrorHandling`を使用
- **エラークラス**: `lib/errors.ts`で定義
- **クライアントサイド**: try-catch でエラーをキャッチし、ユーザーに通知

### テスト

現在、テストは実装されていませんが、以下のようなテストを追加することを推奨します：

- **ユニットテスト**: ユーティリティ関数、カスタムフック
- **統合テスト**: API Routes
- **E2E テスト**: 主要なユーザーフロー

## パフォーマンス最適化

### 楽観的 UI 更新

商品順序変更時は、楽観的 UI 更新を実装しています：

1. ユーザーがドラッグ&ドロップ
2. ローカル状態を即座に更新
3. API 呼び出し（バックグラウンド）
4. 成功: サーバーから最新データを取得
5. 失敗: エラー表示 + 元の状態に戻す

### データフェッチング

- Server Component でデータを取得
- 必要なデータのみを取得（Prisma の`select`を使用）
- 並列データ取得（`Promise.all`を使用）

### 画像最適化

- クライアントサイドでの画像圧縮
- WebP 形式への変換
- 適切なサイズ制限

## セキュリティ

### 入力検証

- すべての入力を検証
- ファイルタイプとサイズの検証
- SQL インジェクション対策（Prisma が自動的に処理）

### 認証・認可

現在、認証・認可は実装されていません。本番環境では、適切な認証・認可を実装することを推奨します。

## 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Prisma Documentation](https://www.prisma.io/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
