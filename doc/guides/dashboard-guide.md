# ダッシュボードガイド

白熊堂プロジェクトの商品管理ダッシュボードについて詳しく説明します。

## 目次

- [概要](#概要)
- [アーキテクチャ](#アーキテクチャ)
- [主要機能](#主要機能)
- [コンポーネント構成](#コンポーネント構成)
- [データフロー](#データフロー)
- [状態管理](#状態管理)
- [API 連携](#api連携)
- [開発ガイド](#開発ガイド)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [セキュリティ](#セキュリティ)
- [参考リンク](#参考リンク)

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
page.tsx (Server Component)
  ↓ データ取得（Prisma）
  ↓ propsで渡す
DashboardContent (Client Component)
  ├── DashboardFormWrapper
  │   └── DashboardForm
  │       ├── useProductForm (カスタムフック)
  │       └── ProductFormFields
  └── ProductList
      ├── ProductSearchFilters
      ├── ProductListView
      ├── ProductEditForm
      │   ├── useProductForm (カスタムフック)
      │   └── ProductFormFields
      ├── CategoryTabs
      └── SortableProductItem
```

### ディレクトリ構造

```
app/dashboard/
├── page.tsx                    # エントリーポイント（Server Component）
├── types.ts                    # 共通型定義
├── components/                 # UI コンポーネント
│   ├── DashboardContent.tsx    # メインコンテナ
│   ├── DashboardForm.tsx       # 新規商品登録フォーム
│   ├── DashboardFormWrapper.tsx # フォームラッパー
│   ├── ProductList.tsx         # 商品一覧・配置変更
│   ├── ProductEditForm.tsx     # 商品編集フォーム
│   ├── ProductFormFields.tsx   # 商品フォームフィールド（共通）
│   ├── ProductListView.tsx    # 商品一覧表示
│   ├── ProductSearchFilters.tsx # 商品検索フィルター
│   ├── CategoryTabs.tsx        # カテゴリータブ
│   └── SortableProductItem.tsx # ドラッグ&ドロップ可能な商品アイテム
├── hooks/                      # カスタムフック
│   ├── useTabState.ts          # タブ状態管理
│   ├── useProductForm.ts       # 商品フォームの状態管理
│   └── useProductReorder.ts    # 商品順序変更ロジック
└── utils/                      # ユーティリティ関数
    └── productUtils.ts         # 商品のグループ化・フィルタリング
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

### DashboardPage ([`page.tsx`](../../app/dashboard/page.tsx))

ダッシュボードページのエントリーポイントです。Server Component として実装されています。

**主な処理**:

- カテゴリーと商品データの取得
- データの形式変換（Decimal 型 → Number 型、Date 型 → ISO 文字列）
- Client Component へのデータ受け渡し

**実装例**:

```typescript
const { categories, products } = await getDashboardData();

return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="mx-auto max-w-4xl px-4">
      <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>
      <DashboardContent categories={categories} initialProducts={products} />
    </div>
  </div>
);
```

### DashboardContent ([`components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx))

ダッシュボードのメインコンテナです。Client Component として実装されています。

**主な機能**:

- 商品リストの状態管理（状態のリフトアップ）
- フォームの表示/非表示制御
- 商品一覧の更新処理

**状態管理**:

React のベストプラクティスに従い、共有状態（商品一覧）を親コンポーネントで管理しています。

```typescript
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

### DashboardForm ([`components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx))

新規商品登録フォームです。

**主な機能**:

- フォーム入力の管理（`useProductForm`フックを使用）
- 画像アップロード
- バリデーション
- フォーム送信

**設計の特徴**:

- `useProductForm`フックでフォームの状態管理を行う
- `ProductFormFields`コンポーネントで共通のフォームフィールドを表示
- モーダル形式で表示

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

### ProductEditForm ([`components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx))

商品編集フォームです。

**主な機能**:

- 既存商品の情報更新
- 画像の差し替え（古い画像を削除してから新しい画像をアップロード）
- 公開状態の変更

**設計の特徴**:

- `useProductForm`フックでフォームの状態管理を行う（初期値として既存商品情報を設定）
- `ProductFormFields`コンポーネントで共通のフォームフィールドを表示（`fieldPrefix="edit-"`を使用）
- モーダル形式で表示

### ProductList ([`components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx))

商品一覧の表示と配置変更機能を実装しています。

**主な機能**:

- タブ切り替え（「登録済み商品一覧」と「配置変更」）
- 商品一覧の表示（`ProductListView`コンポーネントを使用）
- 検索機能（`ProductSearchFilters`コンポーネントを使用）
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

**設計の特徴**:

- React のベストプラクティスに従い、状態を親コンポーネントから受け取る
- `forwardRef`や`useImperativeHandle`を使わない設計
- `@dnd-kit`を使用したドラッグ&ドロップ
- 楽観的 UI 更新
- タブ状態の localStorage 連携
- コンポーネントの分割（`ProductListView`、`ProductSearchFilters`、`CategoryTabs`）

### ProductFormFields ([`components/ProductFormFields.tsx`](../../app/dashboard/components/ProductFormFields.tsx))

商品作成・編集フォームで使用する共通のフォームフィールドコンポーネントです。

**主な機能**:

- 商品名、説明、画像、価格、カテゴリー、公開情報、公開日・終了日の入力フィールド
- フォーム作成と編集の両方で使用可能（`fieldPrefix`プロップで識別子を付与）

### ProductListView ([`components/ProductListView.tsx`](../../app/dashboard/components/ProductListView.tsx))

フィルタリングされた商品一覧を3列グリッドで表示するコンポーネントです。

**主な機能**:

- 商品一覧の3列グリッド表示
- 公開状態に応じた視覚的な表示
- 編集・削除ボタン

### ProductSearchFilters ([`components/ProductSearchFilters.tsx`](../../app/dashboard/components/ProductSearchFilters.tsx))

商品名、カテゴリー、公開状態による検索・フィルタリング機能を提供するコンポーネントです。

**主な機能**:

- 商品名での検索（ひらがな・カタカナの区別なし）
- カテゴリーでのフィルタリング
- 公開状態でのフィルタリング

### CategoryTabs ([`components/CategoryTabs.tsx`](../../app/dashboard/components/CategoryTabs.tsx))

カテゴリータブの UI コンポーネントです。

**主な機能**:

- カテゴリーのタブ表示
- アクティブタブのハイライト
- スクロール可能なタブ
- スクロール可能な場合の視覚的インジケーター（グラデーション）
- アクティブなタブの自動スクロール

### SortableProductItem ([`components/SortableProductItem.tsx`](../../app/dashboard/components/SortableProductItem.tsx))

ドラッグ&ドロップ可能な商品アイテムコンポーネントです。

**主な機能**:

- 商品情報の表示
- ドラッグ&ドロップの実装
- 編集・削除ボタン

## データフロー

### 初期データ取得

```
page.tsx (Server Component)
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
フォーム入力
  ↓ バリデーション
  ↓ fetch('/api/products', { method: 'POST' })
API Route
  ↓ Prisma 操作
Database
  ↓ レスポンス
DashboardContent
  ↓ refreshProducts() を呼び出し
  ↓ fetch('/api/products') で最新データを取得
  ↓ setProducts() で状態更新
  ↓ props で ProductList に渡す
  ↓ UI 更新
```

**設計のポイント**:

- 商品追加後は、親コンポーネント（`DashboardContent`）の`refreshProducts`を呼び出す
- 状態は親コンポーネントで管理され、props で子コンポーネントに渡される
- データフローが明確で、React のベストプラクティスに沿った実装

### 商品順序変更フロー

```
ProductList
  ↓ ドラッグ&ドロップ
  ↓ 楽観的 UI 更新（即座に状態更新）
  ↓ fetch('/api/products/reorder', { method: 'POST' })
API Route
  ↓ Prisma 操作
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

#### useTabState ([`hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts))

タブ状態を localStorage と同期するカスタムフックです。

**機能**:

- タブ状態の保存・復元
- localStorage との同期

**使用例**:

```typescript
const { activeTab, setActiveTab } = useTabState();
```

#### useCategoryTabState ([`hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts))

カテゴリータブの状態を管理するカスタムフックです。

**機能**:

- カテゴリータブの状態を localStorage に保存・復元
- 公開商品がある最初のカテゴリーを自動選択

**使用例**:

```typescript
const { activeCategoryTab, setActiveCategoryTab, initialCategoryTab } = useCategoryTabState(
  products,
  categories
);
```

#### useProductForm ([`hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts))

商品フォームの状態管理を行うカスタムフックです。

**機能**:

- フォームデータの状態管理
- 画像の圧縮とアップロード
- 公開日・終了日に基づく公開状態の自動計算

**使用例**:

```typescript
const {
  formData,
  setFormData,
  submitting,
  setSubmitting,
  uploading,
  compressing,
  imagePreview,
  handleImageChange,
  uploadImage,
  hasDateRangeValue,
} = useProductForm({
  initialImageUrl: product?.imageUrl,
  initialFormData: {
    name: product?.name || "",
    description: product?.description || "",
    // ...
  },
});
```

#### useProductReorder ([`hooks/useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts))

商品順序変更のロジックを実装したカスタムフックです。

**機能**:

- 楽観的 UI 更新
- API 呼び出し
- エラーハンドリング

**使用例**:

```typescript
const { reorderProducts } = useProductReorder(
  setProducts,
  refreshProducts
);

// 使用
await reorderProducts(categoryGroup, oldIndex, newIndex);
```

## API 連携

### 商品一覧取得

**エンドポイント**: `GET /api/products`

**レスポンス**:

```typescript
{
  products: Product[];
}
```

### 商品作成

**エンドポイント**: `POST /api/products`

**リクエストボディ**:

```typescript
{
  name: string;
  description: string;
  categoryId: number;
  imageUrl?: string;
  priceS?: number;
  priceL?: number;
  published: boolean;
  publishedAt?: string; // ISO 8601形式
  endedAt?: string; // ISO 8601形式
}
```

**レスポンス**:

```typescript
{
  product: Product;
}
```

### 商品更新

**エンドポイント**: `PUT /api/products/[id]`

**リクエストボディ**:

```typescript
{
  name?: string;
  description?: string;
  categoryId?: number;
  imageUrl?: string;
  priceS?: number;
  priceL?: number;
  published?: boolean;
  publishedAt?: string;
  endedAt?: string;
}
```

**レスポンス**:

```typescript
{
  product: Product;
}
```

### 商品削除

**エンドポイント**: `DELETE /api/products/[id]`

**レスポンス**:

```typescript
{
  success: boolean;
}
```

### 商品順序変更

**エンドポイント**: `POST /api/products/reorder`

**リクエストボディ**:

```typescript
{
  productId: number;
  newOrder: number;
  categoryId: number;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
}
```

### 画像アップロード

**エンドポイント**: `POST /api/products/upload`

**リクエスト**: `multipart/form-data`

```
file: [画像ファイル]
```

**レスポンス**:

```typescript
{
  url: string; // アップロードされた画像のURL
}
```

#### ファイルサイズの制限と推奨サイズ

画像アップロード時のファイルサイズに関する制限と推奨事項です。

**推奨サイズ**: **10MB 以下**（確実に処理可能）

- **理論上の上限**: 50MB（コード上の制限）
- **推奨サイズ**: **10MB 以下**（確実に処理可能）
- **実際のテスト結果**:
  - 14MB: 成功（ただし推奨しない）
  - 17MB: 失敗（ブラウザのメモリ制限により読み込みエラー）
- **問題が起きやすい**: 15MB 以上

**運用時の注意事項**: 必ず 10MB 以下の画像を使用してください。14MB 程度でも成功する場合がありますが、デバイスやブラウザによっては失敗する可能性があるため推奨しません。

10MB 以上のファイルを選択した場合、警告ダイアログが表示され、続行するかキャンセルするかを選択できます。

**圧縮後のサイズ制限**:

- **最大ファイルサイズ**: 4MB（Vercel の関数ペイロードサイズ制限に合わせて設定）
- **圧縮後の目標サイズ**: 3.5MB（安全マージンを確保）

詳細は [画像圧縮ユーティリティ - 画像ファイルサイズの制限と推奨サイズ](./utilities-guide.md#画像ファイルサイズの制限と推奨サイズ) を参照してください。

## 開発ガイド

### 新しい機能の追加

1. **型定義の追加**: [`app/dashboard/types.ts`](../../app/dashboard/types.ts)に追加
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

エラーハンドリングの詳細については、[ユーティリティ関数ガイド - エラーハンドリング](./utilities-guide.md#エラーハンドリング-liberrorsts) を参照してください。

**このアプリでの実装**:

- **API Routes**: [`lib/api-helpers.ts`](../../lib/api-helpers.ts)の`withErrorHandling`を使用
- **エラークラス**: [`lib/errors.ts`](../../lib/errors.ts)で定義
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

- **Server Component でデータを取得** - **このアプリで使用中**
  - [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): Prisma を使用してデータベースから直接データを取得
- **Client Component で API Routes にアクセス** - **このアプリで使用中**
  - [`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx): `fetch` API を使用して `/api/products` にアクセス
  - [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx): `fetch` API を使用して `/api/products` に POST リクエスト
  - [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx): `fetch` API を使用して `/api/products/[id]` に PUT リクエスト
  - [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx): `fetch` API を使用して `/api/products/[id]` に DELETE リクエスト
  - [`app/dashboard/hooks/useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts): `fetch` API を使用して `/api/products/reorder` に POST リクエスト
- **並列データ取得（`Promise.all`を使用）** - **このアプリで使用中**（詳細は [Async/Await ガイド - Promise.all](./async-await-guide.md#promiseall---このアプリで使用中) を参照）

**Prisma の`select`について**:

このアプリでは、`select`オプションは使用されていませんが、知っておくと便利な機能です。

**使用例**:

```typescript
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    category: {
      select: {
        name: true,
      },
    },
  },
});
```

**利点**:

- 必要なデータのみを取得できるため、ネットワーク転送量を削減
- パフォーマンスの向上（特に大量のデータを扱う場合）

**このアプリで使用しない理由**:

- 商品情報は比較的少ないデータ量のため、すべてのフィールドを取得してもパフォーマンスへの影響が小さい
- `include`を使用してカテゴリー情報も一緒に取得する方が、コードがシンプルで保守しやすい
- 商品データの構造が比較的シンプルで、不要なフィールドが少ない

詳細は [Prisma ガイド - select（このアプリでは未使用）](./prisma-guide.md#selectこのアプリでは未使用) を参照してください。

### 画像最適化

**Next.js の画像最適化**: Next.js Image コンポーネントの詳細については、[Next.js ガイド - 画像最適化](./nextjs-guide.md#画像最適化) を参照してください。

**このアプリでのクライアントサイド画像処理**:

- **クライアントサイドでの画像圧縮**: アップロード前にブラウザで自動的に圧縮・リサイズ
- **WebP 形式への変換**: JPEG よりも約 25-35% 小さなファイルサイズを実現
- **適切なサイズ制限**:
  - 推奨サイズ: 10MB 以下
  - 最大ファイルサイズ: 4MB（圧縮後）
  - 最大画像サイズ: 1920x1920px（自動リサイズ）

**処理の流れ**:

1. ユーザーが画像ファイルを選択
2. 10MB 以上の場合は警告ダイアログを表示
3. 画像を自動的に圧縮・リサイズ（WebP 形式）
4. 圧縮後のサイズが 4MB を超える場合はエラーを表示
5. アップロード

詳細は [画像圧縮ユーティリティ](./utilities-guide.md#画像圧縮ユーティリティ-libimage-compressionts) を参照してください。

## セキュリティ

### 入力検証

- すべての入力を検証
- ファイルタイプとサイズの検証
- SQL インジェクション対策（Prisma が自動的に処理）

### 認証・認可

現在、認証・認可は実装されていません。本番環境では、適切な認証・認可を実装することを推奨します。

## 参考リンク

- **[App Router ガイド](./app-router-guide.md)**: Next.js App Router の詳細な使用方法
- **[Async/Await ガイド](./async-await-guide.md)**: async/await と Promise の使用方法
- **[Prisma ガイド](./prisma-guide.md)**: Prisma の詳細な使用方法
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Prisma Documentation](https://www.prisma.io/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
