# React ガイド

## 目次

- [概要](#概要)
- [React とは](#react-とは)
- [Next.js との統合](#nextjs-との統合)
  - [Server Components と Client Components](#server-components-と-client-components)
- [React Hooks](#react-hooks)
  - [useState](#usestate)
  - [副作用（Side Effects）とは](#副作用side-effectsとは)
  - [useEffect](#useeffect)
  - [useMemo](#usememo)
  - [useRef](#useref)
- [カスタムフック](#カスタムフック)
  - [useModal](#usemodal)
  - [useProductModal](#useproductmodal)
  - [useTabState](#usetabstate)
  - [useCategoryTabState](#usecategorytabstate)
  - [useProductReorder](#useproductreorder)
- [コンポーネント設計](#コンポーネント設計)
  - [コンポーネントの分割原則](#コンポーネントの分割原則)
  - [コンポーネントの階層構造](#コンポーネントの階層構造)
  - [コンポーネントの実装例](#コンポーネントの実装例)
- [状態管理](#状態管理)
  - [状態管理の戦略](#状態管理の戦略)
  - [状態管理の例](#状態管理の例)
- [イベントハンドリング](#イベントハンドリング)
  - [イベントハンドリングの例](#イベントハンドリングの例)
- [このアプリでの React の使用例まとめ](#このアプリでの-react-の使用例まとめ)
  - [コンポーネント構成](#コンポーネント構成)
  - [カスタムフック構成](#カスタムフック構成)
  - [状態管理のパターン](#状態管理のパターン)
- [React のベストプラクティス](#react-のベストプラクティス)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

React は、ユーザーインターフェースを構築するための JavaScript ライブラリです。コンポーネントベースのアーキテクチャにより、再利用可能で保守しやすい UI を構築できます。

このアプリケーションでは、**React 19.2.3** を使用して、Next.js App Router と統合し、Server Components と Client Components を適切に使い分けながら、インタラクティブな UI を実装しています。

**関連ドキュメント**: JSX の構文について詳しく知りたい場合は、[JSX ガイド](./jsx-guide.md)を参照してください。このガイドでは、React の概念と実装パターンに焦点を当てています。

**React の主な特徴**:

- **コンポーネントベース**: UI を独立したコンポーネントに分割し、再利用性と保守性を向上
- **仮想 DOM**: 効率的な DOM 更新により、パフォーマンスを最適化
- **単方向データフロー**: データの流れが明確で、予測可能な動作を実現
- **Hooks**: 関数コンポーネントで状態管理や副作用を扱える仕組み
- **豊富なエコシステム**: 多数のサードパーティライブラリと統合可能

## React とは

React は、Facebook（現 Meta）が開発した、ユーザーインターフェースを構築するための JavaScript ライブラリです。コンポーネントベースのアーキテクチャを採用し、宣言的な UI の記述を可能にします。

**主な特徴**:

- **コンポーネントベース**: UI を独立したコンポーネントに分割し、再利用性と保守性を向上
- **仮想 DOM**: 効率的な DOM 更新により、パフォーマンスを最適化
- **単方向データフロー**: データの流れが明確で、予測可能な動作を実現
- **Hooks**: 関数コンポーネントで状態管理や副作用を扱える仕組み
- **豊富なエコシステム**: 多数のサードパーティライブラリと統合可能

**このアプリでの使われ方**:

- Server Components と Client Components を適切に使い分け
- Client Components（`'use client'`）でインタラクティブな機能（モーダル、商品選択など）を実装
- カスタムフック（`useModal`, `useProductModal`, `useTabState`, `useProductReorder`）で状態管理ロジックを分離
- コンポーネントの再利用性を重視し、`Header`, `Footer`, `ProductGrid` などを共通コンポーネントとして実装

## Next.js との統合

### Server Components と Client Components

Next.js App Router では、React コンポーネントはデフォルトで Server Components として動作します。インタラクティブな機能が必要な場合のみ、`'use client'` ディレクティブを使用して Client Components として実装します。

**Server Components（デフォルト）**:

- サーバーサイドでレンダリングされる
- データベースに直接アクセス可能
- クライアントサイドの JavaScript が送信されない（バンドルサイズの削減）
- `'use client'` ディレクティブは不要

**Client Components**:

- ブラウザで実行される
- `useState`、`useEffect` などの React Hooks が使用可能
- イベントハンドラー（`onClick`、`onChange` など）が使用可能
- `'use client'` ディレクティブが必要

**このアプリでの使い分け**:

- **Server Components**: [`app/page.tsx`](../../app/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボードページ）
- **Client Components**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)、[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)、[`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx)

## React Hooks

React Hooks は、関数コンポーネントで状態管理や副作用を扱うための仕組みです。このアプリでは、標準の Hooks とカスタムフックを組み合わせて使用しています。

**このアプリでの使用箇所**:

- **フロントエンド（Client Components）**: React Hooks を使用して状態管理や副作用を実装
  - [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx): `useProductModal` カスタムフックを使用
  - [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx): `useModal` カスタムフックを使用
  - [`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx): `useState` を使用
  - [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx): `useState`、`useEffect` を使用
  - [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts): `useState`、`useEffect`、`localStorage` を使用
  - [`app/hooks/useModal.ts`](../../app/hooks/useModal.ts): `useEffect`、`useRef` を使用
  - [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts): `useState`、`useRef` を使用
- **バックエンド（Server Components、API Routes）**: React Hooks は使用していない。サーバーサイドで実行されるため、状態管理は不要

### useState

**説明**: コンポーネントの状態を管理するための Hook です。状態が変更されると、コンポーネントが再レンダリングされます。

**基本的な使い方**:

```typescript
const [state, setState] = useState(initialValue);
```

**このアプリでの使用箇所**:

1. **`app/hooks/useProductModal.ts`** - 商品モーダルの状態管理

**参照**: [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (行 12-16)

```12:16:app/hooks/useProductModal.ts
export function useProductModal() {
  // 選択された商品を管理（モーダル表示用）
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);
```

**説明**: 商品モーダルの開閉状態と選択された商品を管理しています。

2. **`app/dashboard/components/DashboardContent.tsx`** - フォームの開閉状態管理

**参照**: [`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx) (行 30-31)

```30:31:app/dashboard/components/DashboardContent.tsx
  // 商品登録フォームの開閉状態を管理
  const [isFormOpen, setIsFormOpen] = useState(false);
```

**説明**: 商品登録フォームの表示/非表示を管理しています。

3. **`app/dashboard/hooks/useTabState.ts`** - タブ状態の管理（localStorage と同期）

**参照**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (行 30-40)

```30:40:app/dashboard/hooks/useTabState.ts
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      // 保存された値が有効なタブタイプか確認
      if (saved === "list" || saved === "layout") {
        return saved;
      }
    }
    // デフォルトは "list" タブ
    return "list";
  });
```

**説明**: 初期値を関数で指定することで、localStorage から値を読み込んで初期化しています。

**useState の特徴**:

- **初期値**: 直接値を指定するか、関数を指定して遅延初期化が可能
- **更新関数**: `setState` は新しい値を直接指定するか、関数を指定して前の状態に基づいて更新可能
- **再レンダリング**: 状態が変更されると、コンポーネントが再レンダリングされる

### 副作用（Side Effects）とは

**説明**: 副作用（side effects）とは、コンポーネントのレンダリング以外で発生する処理のことです。React コンポーネントは、基本的には props と state に基づいて UI を描画する純粋関数として動作しますが、実際のアプリケーションでは、以下のような副作用が必要になります。

**副作用の例**:

1. **API 呼び出し**: サーバーからデータを取得する
2. **DOM 操作**: 要素に直接アクセスする（例: フォーカス、スクロール）
3. **イベントリスナーの登録/削除**: キーボードイベント、ウィンドウイベントなど
4. **タイマーの設定/クリア**: `setTimeout`、`setInterval` など
5. **外部ライブラリとの連携**: チャートライブラリ、マップライブラリなど
6. **ブラウザ API の使用**: `localStorage`、`sessionStorage` など

**副作用が必要な理由**:

- **データフェッチング**: コンポーネントがマウントされた時に、サーバーからデータを取得する必要がある
- **イベント処理**: ユーザーの操作（クリック、キー入力など）に応答する必要がある
- **ライフサイクル管理**: コンポーネントのマウント/アンマウント時に処理を実行する必要がある
- **外部リソースの管理**: タイマーやイベントリスナーなどのリソースを適切に管理する必要がある

**React での副作用の扱い**:

React では、副作用を `useEffect` Hook を使用して処理します。`useEffect` により、副作用をコンポーネントのレンダリングサイクルと適切に統合できます。

**副作用のクリーンアップ**:

副作用によって作成されたリソース（イベントリスナー、タイマーなど）は、コンポーネントがアンマウントされる時や、依存配列の値が変更される前にクリーンアップする必要があります。これにより、メモリリークを防ぎ、パフォーマンスを向上させます。

**このアプリでの副作用の使用例**:

- **イベントリスナーの登録**: `useModal` で ESC キーのイベントリスナーを登録
- **DOM 操作**: `useModal` で背景のスクロールを無効化
- **localStorage への保存**: `useTabState` でタブの状態を保存
- **API 呼び出し**: `useProductReorder` で商品の順序を更新

### useEffect

**説明**: 副作用（side effects）を扱うための Hook です。コンポーネントのマウント、更新、アンマウント時に処理を実行できます。

**基本的な使い方**:

```typescript
useEffect(() => {
  // 副作用の処理
  return () => {
    // クリーンアップ処理（オプション）
  };
}, [dependencies]);
```

**このアプリでの使用箇所**:

1. **`app/hooks/useModal.ts`** - ESC キー処理と背景スクロール無効化

**参照**: [`app/hooks/useModal.ts`](../../app/hooks/useModal.ts) (行 12-48)

```12:48:app/hooks/useModal.ts
export function useModal(isOpen: boolean, onClose: () => void) {
  // onCloseの最新の参照を保持するref
  // これにより、onCloseが変更されてもuseEffectを再実行せずに最新の関数を呼び出せる
  const onCloseRef = useRef(onClose);

  // onCloseが変更されたらrefを更新
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    /**
     * ESCキーでモーダルを閉じる処理
     */
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // refから最新のonCloseを呼び出す
        onCloseRef.current();
      }
    };

    if (isOpen) {
      // ESCキーのイベントリスナーを追加
      document.addEventListener("keydown", handleEscape);
      // モーダルが開いている時は背景のスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      // クリーンアップ: イベントリスナーを削除し、スクロールを有効化
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]); // onCloseを依存配列から削除（refで最新の値を保持しているため）
}
```

**説明**: モーダルが開いている時に ESC キーのイベントリスナーを追加し、背景のスクロールを無効化します。`useRef`を使用して`onClose`の最新の参照を保持することで、`onClose`が変更されても`useEffect`を再実行せずに済みます。クリーンアップ関数で、イベントリスナーを削除し、スクロールを有効化します。

2. **`app/dashboard/hooks/useTabState.ts`** - localStorage への保存

**参照**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (行 42-47)

```42:47:app/dashboard/hooks/useTabState.ts
  // タブが変更されたら localStorage に保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab]);
```

**説明**: タブの状態が変更されるたびに、localStorage に保存します。

**useEffect の特徴**:

- **依存配列**: 依存配列に指定した値が変更された時のみ、副作用が実行される
- **クリーンアップ**: クリーンアップ関数を返すことで、コンポーネントのアンマウント時や依存配列の値が変更される前に処理を実行できる
- **マウント時のみ実行**: 依存配列を空配列 `[]` にすることで、マウント時のみ実行可能

### useMemo

**説明**: 計算コストの高い値をメモ化するための Hook です。依存配列の値が変更されない限り、前回計算した値を再利用します。

**基本的な使い方**:

```typescript
const memoizedValue = useMemo(() => {
  // 計算コストの高い処理
  return computedValue;
}, [dependencies]);
```

**このアプリでの使用箇所**:

1. **`app/dashboard/hooks/useTabState.ts`** - 初期カテゴリータブの計算

**参照**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (行 75-101)

```75:101:app/dashboard/hooks/useTabState.ts
  const initialCategoryTab = useMemo(() => {
    // localStorage から保存されたカテゴリータブを読み込む
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
      if (saved) {
        // 保存されたカテゴリーが現在も存在するか確認
        const categoryExists = categories.some((c) => c.name === saved);
        if (categoryExists) {
          return saved;
        }
      }
    }

    // 公開商品があるカテゴリーを探す
    const published = products.filter((p) => p.published);
    // カテゴリーをID順でソート（小さい順）
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    if (published.length > 0) {
      // 公開商品がある最初のカテゴリーを探す
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    // 公開商品がない場合は最初のカテゴリーを返す
    return sortedCategories[0]?.name || "";
  }, [products, categories]);
```

**説明**: 初期カテゴリータブを決定する処理をメモ化しています。`products` と `categories` が変更されない限り、前回計算した値を再利用します。

**useMemo の特徴**:

- **パフォーマンス最適化**: 計算コストの高い処理をメモ化することで、不要な再計算を防ぐ
- **依存配列**: 依存配列の値が変更された時のみ、再計算が実行される
- **使用タイミング**: 計算コストが高い処理や、参照の同一性が重要な場合に使用

2. **`app/dashboard/components/ProductList.tsx`** - 商品のフィルタリングとグループ化

**参照**: [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (行 158-163)

```158:163:app/dashboard/components/ProductList.tsx
  const publishedProductsByCategory = useMemo(
    () => groupProductsByCategory(products, categories),
    [products, categories]
  );
```

**説明**: 公開商品をカテゴリーごとにグループ化する処理をメモ化しています。`products` と `categories` が変更されない限り、前回計算した値を再利用します。

**参照**: [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (行 214-218)

```214:218:app/dashboard/components/ProductList.tsx
  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );
```

**説明**: 検索条件に基づいて商品をフィルタリングする処理をメモ化しています。検索条件や商品一覧が変更されない限り、前回計算した値を再利用します。

### useCallback

**説明**: コールバック関数をメモ化するための Hook です。依存配列の値が変更されない限り、前回作成した関数を再利用します。これにより、子コンポーネントの不要な再レンダリングを防止できます。

**基本的な使い方**:

```typescript
const memoizedCallback = useCallback(() => {
  // コールバック関数の処理
}, [dependencies]);
```

**このアプリでの使用箇所**:

1. **`app/dashboard/components/CategoryTabs.tsx`** - スクロール位置のチェック

**参照**: [`app/dashboard/components/CategoryTabs.tsx`](../../app/dashboard/components/CategoryTabs.tsx) (行 54-72)

```54:72:app/dashboard/components/CategoryTabs.tsx
  const checkScrollPosition = useCallback(() => {
    // ...
  }, []);
```

**説明**: スクロール位置をチェックする関数をメモ化しています。依存配列が空のため、コンポーネントのライフサイクル全体を通じて同じ関数参照を保持します。

2. **`app/hooks/useProductModal.ts`** - 商品モーダルの操作関数

**参照**: [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (行 28-31)

```28:31:app/hooks/useProductModal.ts
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);
```

**説明**: 商品クリック時のハンドラーをメモ化しています。依存配列が空のため、常に同じ関数参照を返します。これにより、`ProductGrid` コンポーネントの再レンダリングを最小限に抑えます。

**参照**: [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (行 37-48)

```37:48:app/hooks/useProductModal.ts
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // ...
  }, []);
```

**説明**: モーダルを閉じるハンドラーをメモ化しています。依存配列が空のため、常に同じ関数参照を返します。これにより、`ProductModal` コンポーネントの再レンダリングを最小限に抑えます。

3. **`app/dashboard/components/ProductList.tsx`** - 商品操作のコールバック関数

**参照**: [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (行 87-89)

```87:89:app/dashboard/components/ProductList.tsx
  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);
```

**説明**: 商品編集を開始する関数をメモ化しています。依存配列が空のため、常に同じ関数参照を返します。

**参照**: [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (行 95-121)

```95:121:app/dashboard/components/ProductList.tsx
  const handleDelete = useCallback(
    async (productId: number) => {
      // ...
    },
    [refreshProducts]
  );
```

**説明**: 商品を削除する関数をメモ化しています。`refreshProducts` が変更されたときのみ再作成されます。

**useCallback の特徴**:

- **パフォーマンス最適化**: コールバック関数をメモ化することで、子コンポーネントの不要な再レンダリングを防止
- **依存配列**: 依存配列の値が変更された時のみ、新しい関数が作成される
- **使用タイミング**: メモ化されたコンポーネント（`React.memo`）に渡すコールバック関数や、`useEffect` の依存配列に含める関数に使用

### React.memo

**説明**: コンポーネントをメモ化するための高階コンポーネント（HOC）です。props が変更されない限り、前回レンダリングした結果を再利用します。これにより、不要な再レンダリングを防止し、パフォーマンスを向上させます。

**基本的な使い方**:

```typescript
import { memo } from "react";

const MemoizedComponent = memo(Component);
```

**このアプリでの使用箇所**:

1. **`app/components/ProductTile.tsx`** - 商品タイルコンポーネント

**参照**: [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (行 29-62)

```29:62:app/components/ProductTile.tsx
function ProductTile({ product, onClick }: ProductTileProps) {
  // ...
}

export default memo(ProductTile);
```

**説明**: `ProductTile` コンポーネントをメモ化しています。`product` と `onClick` の props が変更されない限り、再レンダリングされません。これにより、商品グリッドのパフォーマンスが向上します。

**React.memo の特徴**:

- **パフォーマンス最適化**: props が変更されない限り、再レンダリングをスキップ
- **浅い比較**: props の浅い比較（shallow comparison）を実行
- **使用タイミング**: 頻繁に再レンダリングされる可能性があるコンポーネントや、レンダリングコストが高いコンポーネントに使用
- **useCallback との組み合わせ**: `useCallback` でメモ化されたコールバック関数と組み合わせることで、より効果的にパフォーマンスを向上

### useRef

**説明**: コンポーネントのライフサイクル全体を通じて、変更可能な値を保持するための Hook です。再レンダリングを引き起こさない点が `useState` と異なります。

**基本的な使い方**:

```typescript
const ref = useRef(initialValue);
```

**このアプリでの使用箇所**:

1. **`app/dashboard/components/CategoryTabs.tsx`** - DOM 要素への参照

**参照**: [`app/dashboard/components/CategoryTabs.tsx`](../../app/dashboard/components/CategoryTabs.tsx) (行 39-41)

```39:41:app/dashboard/components/CategoryTabs.tsx
  // スクロール可能なコンテナへの参照
  // useRef を使用して DOM 要素に直接アクセスします
  const scrollContainerRef = useRef<HTMLDivElement>(null);
```

**説明**: スクロール可能なタブコンテナの DOM 要素への参照を保持しています。スクロール位置のチェックや自動スクロールに使用されます。

2. **`app/hooks/useProductModal.ts`** - タイマー ID の保持

**参照**: [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (行 19-20)

```19:20:app/hooks/useProductModal.ts
  // setTimeoutのIDを保持するためのref（クリーンアップ用）
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**説明**: `setTimeout`の ID を保持するために使用しています。コンポーネントのアンマウント時にタイマーをクリーンアップするために必要です。これにより、メモリリークを防ぎます。

**useRef の特徴**:

- **再レンダリングを引き起こさない**: `ref.current` を変更しても、コンポーネントは再レンダリングされない
- **DOM 要素への参照**: DOM 要素への直接アクセスが可能
- **値の保持**: コンポーネントのライフサイクル全体を通じて、値を保持

### 未使用の React Hooks

このアプリでは、以下の React Hooks は使用されていませんが、知っておくと便利な機能です：

**useContext** - コンテキストの値にアクセス

複数のコンポーネント間で状態を共有するために使用します。Props のバケツリレーを避けることができます。

**使用例**:

```typescript
// コンテキストの作成
const ThemeContext = createContext("light");

// プロバイダーで値を提供
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Component />
    </ThemeContext.Provider>
  );
}

// コンポーネントで値を使用
function Component() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>テーマ: {theme}</div>;
}
```

**このアプリで使用しない理由**:

- 状態管理は親コンポーネントから props で渡す方が、データフローが明確で理解しやすい
- 状態の共有が必要な範囲が限定的で、props で十分に対応できる

**useReducer** - 複雑な状態管理

`useState`の代替として、複雑な状態ロジックを管理するために使用します。複数の状態を 1 つのオブジェクトで管理し、アクションに基づいて状態を更新します。

**使用例**:

```typescript
function reducer(state: State, action: Action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <div>
      <p>カウント: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </div>
  );
}
```

**このアプリで使用しない理由**:

- 状態管理が比較的シンプルで、`useState`で十分に対応できる
- 複数の状態を個別に管理する方が、コードが読みやすい

**useImperativeHandle と forwardRef** - 親コンポーネントからの参照制御

親コンポーネントから子コンポーネントのメソッドや値を直接参照できるようにします。

**使用例**:

```typescript
// 子コンポーネント
const ChildComponent = forwardRef((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    getValue: () => {
      return inputRef.current?.value;
    },
  }));

  return <input ref={inputRef} />;
});

// 親コンポーネント
function ParentComponent() {
  const childRef = useRef<{ focus: () => void; getValue: () => string }>(null);

  return (
    <div>
      <ChildComponent ref={childRef} />
      <button onClick={() => childRef.current?.focus()}>フォーカス</button>
    </div>
  );
}
```

**このアプリで使用しない理由**:

- React のベストプラクティスに従い、props とコールバック関数で親子間の通信を行っている
- データフローが明確で、コンポーネント間の結合が緩くなる
- 宣言的な実装により、コードが理解しやすくなる

## カスタムフック

カスタムフックは、状態管理ロジックを再利用可能な関数に抽出するための仕組みです。このアプリでは、複数のカスタムフックを実装し、コンポーネントのロジックを分離しています。

### useModal

**説明**: モーダルの開閉状態と ESC キー処理を管理するカスタムフックです。

**このアプリでの使用箇所**:

- [`app/hooks/useModal.ts`](../../app/hooks/useModal.ts): フックの実装
- [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx): 商品モーダルで使用

**実装コード**:

**参照**: [`app/hooks/useModal.ts`](../../app/hooks/useModal.ts) (行 12-48)

```12:48:app/hooks/useModal.ts
export function useModal(isOpen: boolean, onClose: () => void) {
  // onCloseの最新の参照を保持するref
  // これにより、onCloseが変更されてもuseEffectを再実行せずに最新の関数を呼び出せる
  const onCloseRef = useRef(onClose);

  // onCloseが変更されたらrefを更新
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    /**
     * ESCキーでモーダルを閉じる処理
     */
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // refから最新のonCloseを呼び出す
        onCloseRef.current();
      }
    };

    if (isOpen) {
      // ESCキーのイベントリスナーを追加
      document.addEventListener("keydown", handleEscape);
      // モーダルが開いている時は背景のスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      // クリーンアップ: イベントリスナーを削除し、スクロールを有効化
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]); // onCloseを依存配列から削除（refで最新の値を保持しているため）
}
```

**使用例**:

**参照**: [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (行 40-41)

```40:41:app/components/ProductModal.tsx
  // ESCキー処理と背景スクロール無効化を管理
  useModal(isOpen, onClose);
```

**機能**:

- ESC キーでモーダルを閉じる
- モーダル表示時の背景スクロール無効化
- クリーンアップ処理によるメモリリークの防止
- `useRef`を使用して`onClose`の最新の参照を保持し、不要な再実行を防止

### useProductModal

**説明**: 商品モーダルの状態管理を行うカスタムフックです。

**このアプリでの使用箇所**:

- [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts): フックの実装
- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx): 商品グリッドで使用

**実装コード**:

**参照**: [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (行 12-65)

```12:65:app/hooks/useProductModal.ts
export function useProductModal() {
  // 選択された商品を管理（モーダル表示用）
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  // setTimeoutのIDを保持するためのref（クリーンアップ用）
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 商品タイルクリック時のハンドラー
   * 選択された商品を設定してモーダルを開きます
   *
   * @param product - クリックされた商品
   */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  /**
   * モーダル閉じる時のハンドラー
   * モーダルを閉じ、アニメーション完了後に選択をクリアします
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 既存のタイマーをクリア（複数回呼ばれた場合に備える）
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // モーダルが閉じた後に選択をクリア（アニメーション完了を待つ）
    timeoutRef.current = setTimeout(() => {
      setSelectedProduct(null);
      timeoutRef.current = null;
    }, 300);
  };

  // コンポーネントのアンマウント時にタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    selectedProduct,
    isModalOpen,
    handleProductClick,
    handleCloseModal,
  };
}
```

**使用例**:

**参照**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (行 31-37)

```31:37:app/components/ProductGrid.tsx
  // モーダルの状態管理（カスタムフックで実装）
  const {
    selectedProduct,
    isModalOpen,
    handleProductClick,
    handleCloseModal,
  } = useProductModal();
```

**機能**:

- 商品タイルクリック時にモーダルを開く
- モーダル閉じる時にアニメーション完了を待ってから選択をクリア
- `setTimeout`のクリーンアップ処理によりメモリリークを防止

- 選択された商品の管理
- モーダルの開閉状態管理
- 商品クリック時のハンドリング
- モーダル閉じる時のアニメーション考慮（300ms 後に選択をクリア）

### useTabState

**説明**: ダッシュボードのタブ状態を管理するカスタムフックです。localStorage と同期して、ページリロード後も選択していたタブを保持します。

**このアプリでの使用箇所**:

- [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts): フックの実装
- [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx): 商品一覧で使用

**実装コード**:

**参照**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (行 27-50)

```27:50:app/dashboard/hooks/useTabState.ts
export function useTabState() {
  // 初期値を localStorage から読み込む
  // サーバーサイドレンダリング時は window が存在しないため、typeof window チェックが必要
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      // 保存された値が有効なタブタイプか確認
      if (saved === "list" || saved === "layout") {
        return saved;
      }
    }
    // デフォルトは "list" タブ
    return "list";
  });

  // タブが変更されたら localStorage に保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab]);

  return { activeTab, setActiveTab };
}
```

**機能**:

- タブの状態を localStorage に保存・復元
- ページリロード後も選択していたタブを保持
- サーバーサイドレンダリング時の `window` チェック

### useCategoryTabState

**説明**: カテゴリータブの状態を管理するカスタムフックです。localStorage と同期し、公開商品がある最初のカテゴリーを自動選択します。

**このアプリでの使用箇所**:

- [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts): フックの実装
- [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx): 商品一覧で使用

**実装コード**:

**参照**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (行 64-116)

```64:116:app/dashboard/hooks/useTabState.ts
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  /**
   * 初期カテゴリータブを決定
   * 優先順位:
   * 1. localStorage に保存されたカテゴリー（存在する場合）
   * 2. 公開商品がある最初のカテゴリー
   * 3. 最初のカテゴリー（ID順）
   */
  const initialCategoryTab = useMemo(() => {
    // localStorage から保存されたカテゴリータブを読み込む
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB);
      if (saved) {
        // 保存されたカテゴリーが現在も存在するか確認
        const categoryExists = categories.some((c) => c.name === saved);
        if (categoryExists) {
          return saved;
        }
      }
    }

    // 公開商品があるカテゴリーを探す
    const published = products.filter((p) => p.published);
    // カテゴリーをID順でソート（小さい順）
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    if (published.length > 0) {
      // 公開商品がある最初のカテゴリーを探す
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    // 公開商品がない場合は最初のカテゴリーを返す
    return sortedCategories[0]?.name || "";
  }, [products, categories]);

  // カテゴリータブの状態を管理
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(
    initialCategoryTab
  );

  // カテゴリータブが変更されたら localStorage に保存
  useEffect(() => {
    if (typeof window !== "undefined" && activeCategoryTab) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY_TAB, activeCategoryTab);
    }
  }, [activeCategoryTab]);

  return { activeCategoryTab, setActiveCategoryTab, initialCategoryTab };
}
```

**機能**:

- カテゴリータブの状態を localStorage に保存・復元
- 公開商品がある最初のカテゴリーを自動選択
- ページリロード後も選択していたカテゴリーを保持
- `useMemo` を使用して初期値の計算を最適化

### useProductReorder

**説明**: 商品の順序変更を処理するカスタムフックです。楽観的 UI 更新を実装しており、API 呼び出し前に UI を更新することで、ユーザーに即座にフィードバックを提供します。

**このアプリでの使用箇所**:

- [`app/dashboard/hooks/useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts): フックの実装
- [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx): 商品一覧で使用

**実装コード**:

**参照**: [`app/dashboard/hooks/useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts) (行 21-118)

```21:118:app/dashboard/hooks/useProductReorder.ts
export function useProductReorder(
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  refreshProducts: () => Promise<void>
) {
  /**
   * 商品の順序を変更する関数
   *
   * この関数は以下の処理を行います：
   * 1. 商品の配列を新しい順序に並び替え
   * 2. 各商品に displayOrder を割り当て
   * 3. 楽観的 UI 更新（API 呼び出し前に UI を更新）
   * 4. API を呼び出してサーバーに保存
   * 5. 成功時は最新データを取得、失敗時は元の状態に戻す
   *
   * @param categoryGroup - 操作対象のカテゴリーとその商品一覧
   * @param oldIndex - 移動元のインデックス
   * @param newIndex - 移動先のインデックス
   * @throws エラーが発生した場合は例外を投げる
   */
  const reorderProducts = async (
    categoryGroup: { name: string; products: Product[] },
    oldIndex: number,
    newIndex: number
  ) => {
    // arrayMove を使用して商品の配列を新しい順序に並び替え
    // 例: [A, B, C] で oldIndex=0, newIndex=2 の場合 → [B, C, A]
    const newProducts = arrayMove(
      categoryGroup.products,
      oldIndex,
      newIndex
    );

    // 新しい順序に基づいて各商品に displayOrder を割り当て
    // displayOrder は 1 から始まる連番
    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index + 1, // 1, 2, 3, ...
    }));

    /**
     * 楽観的 UI 更新: API 呼び出し前にローカル状態を更新
     *
     * これにより、ユーザーは即座に変更を確認できます。
     * API 呼び出しが完了するのを待つ必要がありません。
     */
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        // 順序が変更された商品を探す
        const order = productOrders.find((o) => o.id === product.id);
        if (order) {
          // displayOrder を更新
          return { ...product, displayOrder: order.displayOrder };
        }
        // 順序が変更されていない商品はそのまま返す
        return product;
      });
    });

    try {
      // API を呼び出して商品の順序をサーバーに保存
      const response = await fetch("/api/products/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productOrders }),
      });

      // レスポンスがエラーの場合は例外を投げる
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "順序の更新に失敗しました");
      }

      /**
       * 成功した場合は、サーバーから最新の状態を取得して同期
       *
       * これにより、他のユーザーによる変更やサーバー側での検証結果を反映できます。
       * 楽観的更新で設定した値とサーバーの値が一致していることを確認します。
       */
      await refreshProducts();
    } catch (error) {
      // エラーをコンソールに出力（デバッグ用）
      console.error("順序更新エラー:", error);
      /**
       * エラーが発生した場合は、元の状態に戻すために再取得
       *
       * 楽観的更新で変更した UI を、サーバーの実際の状態に戻します。
       * これにより、エラーが発生しても UI とサーバーの状態が一致します。
       */
      await refreshProducts();
      // エラーを再スローして、呼び出し元でエラーハンドリングできるようにする
      throw error;
    }
  };

  return { reorderProducts };
}
```

**機能**:

- 楽観的 UI 更新（API 呼び出し前に UI を更新）
- API 呼び出しによるサーバーへの保存
- エラーハンドリング（失敗時は元の状態に戻す）
- 成功時の最新データ取得

**楽観的 UI 更新のメリット**:

- **即座のフィードバック**: ユーザーは API 呼び出しの完了を待たずに、変更を確認できる
- **UX の向上**: レスポンスタイムが短く感じられる
- **エラー処理**: 失敗時は元の状態に戻すことで、データの整合性を保つ

## コンポーネント設計

このアプリでは、コンポーネントを適切に分割し、再利用性と保守性を向上させています。

### コンポーネントの分割原則

1. **単一責任の原則**: 各コンポーネントは 1 つの責務を持つ
2. **再利用性**: 汎用的なコンポーネントは分離（例: `ProductTile`, `ProductModal`）
3. **関心の分離**: UI とロジックを分離（カスタムフックを使用）

### コンポーネントの階層構造

**フロントエンドコンポーネント**:

```
app/page.tsx (Server Component)
  └── ProductGrid (Client Component)
      ├── ProductTile (Client Component)
      └── ProductModal (Client Component)
          └── CloseIcon (Client Component)
```

**ダッシュボードコンポーネント**:

```
app/dashboard/page.tsx (Server Component)
  └── DashboardContent (Client Component)
      ├── DashboardFormWrapper (Client Component)
      └── ProductList (Client Component)
          ├── CategoryTabs (Client Component)
          └── SortableProductItem (Client Component)
```

### コンポーネントの実装例

1. **[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)** - 商品グリッドコンポーネント

**参照**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (行 30-78)

```30:78:app/components/ProductGrid.tsx
export default function ProductGrid({ category, products }: ProductGridProps) {
  // モーダルの状態管理（カスタムフックで実装）
  const {
    selectedProduct,
    isModalOpen,
    handleProductClick,
    handleCloseModal,
  } = useProductModal();

  // 商品がない場合は何も表示しない
  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-8 md:mb-16 lg:mb-12">
        {/* カテゴリータイトル */}
        <div className="mb-4 border-b border-gray-200 pb-2 md:mb-10 md:pb-5 lg:mb-6 lg:pb-3">
          <h2 className="text-center text-lg font-light tracking-widest text-gray-800 md:text-3xl lg:text-2xl">
            {category.name}
          </h2>
        </div>

        {/* 商品グリッド（常に3列） */}
        <div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-6">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </section>

      {/* モーダルウィンドウ */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
```

**説明**: `useProductModal` フックを使用してモーダルの状態を管理し、`ProductTile` と `ProductModal` コンポーネントを組み合わせて商品グリッドを実装しています。

2. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)** - 商品モーダルコンポーネント

**参照**: [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (行 35-119)

```35:119:app/components/ProductModal.tsx
export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  // ESCキー処理と背景スクロール無効化を管理
  useModal(isOpen, onClose);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン - スクロールしても右上に固定表示 */}
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4">
          <button
            onClick={onClose}
            className="rounded-full bg-white/90 p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-800 shadow-md"
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 商品画像 */}
        {product.imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
              priority
            />
          </div>
        ) : (
          <div className="aspect-square w-full bg-linear-to-br from-gray-50 to-gray-100" />
        )}

        {/* 商品情報 */}
        <div className="p-6 md:p-8">
          {/* 商品名 */}
          <div className="mb-4 flex h-[4em] items-center justify-center md:h-[4.25em]">
            <h2 className="line-clamp-2 whitespace-pre-wrap text-center text-2xl font-medium leading-relaxed text-gray-800 md:text-3xl">
              {product.name}
            </h2>
          </div>

          {/* 商品説明 */}
          {product.description && (
            <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-gray-600 md:text-lg">
              {product.description}
            </p>
          )}

          {/* 価格 */}
          {(product.priceS || product.priceL) && (
            <div className="flex items-baseline gap-3 border-t border-gray-200 pt-6">
              {product.priceS && (
                <span className="text-2xl font-medium tracking-wide text-gray-800 md:text-3xl">
                  S: {formatPrice(product.priceS)}
                </span>
              )}
              {product.priceS && product.priceL && (
                <span className="text-xl text-gray-300">/</span>
              )}
              {product.priceL && (
                <span className="text-2xl font-medium tracking-wide text-gray-800 md:text-3xl">
                  L: {formatPrice(product.priceL)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**説明**: `useModal` フックを使用して ESC キー処理と背景スクロール無効化を実装し、商品の詳細情報を表示するモーダルを実装しています。閉じるボタンは `sticky` を使用してスクロールしても右上に固定表示されるため、長いコンテンツでも常にアクセス可能です。

## 状態管理

このアプリでは、React の標準的な状態管理機能とカスタムフックを組み合わせて、状態を管理しています。

### 状態管理の戦略

1. **Server State**: Server Components で直接データフェッチ
2. **Client State**: React の `useState` とカスタムフック
3. **Persistent State**: `localStorage` をカスタムフックで管理

### 状態管理の例

1. **ローカル状態**: `useState` を使用してコンポーネント内の状態を管理

```typescript
const [isFormOpen, setIsFormOpen] = useState(false);
```

2. **永続化された状態**: `localStorage` と `useState` を組み合わせて状態を永続化

```typescript
const [activeTab, setActiveTab] = useState(() => {
  const saved = localStorage.getItem("activeTab");
  return saved || "default";
});
```

3. **楽観的更新**: API 呼び出し前に UI を更新し、エラー時は元に戻す

```typescript
// 楽観的更新
setProducts(newProducts);

try {
  await updateProducts(newProducts);
} catch (error) {
  // エラー時は元の状態に戻す
  await refreshProducts();
}
```

## イベントハンドリング

React では、イベントハンドラーを props として渡すことで、コンポーネント間でイベントを処理できます。

**関連**: JSX でのイベントハンドラーの書き方については、[JSX ガイド - イベントハンドラー](./jsx-guide.md#イベントハンドラー)を参照してください。

### イベントハンドリングの例

1. **`app/components/ProductTile.tsx`** - クリックイベントの処理

**参照**: [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (行 29-62)

```29:62:app/components/ProductTile.tsx
export default function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
      aria-label={`${product.name}の詳細を見る`}
    >
      {/* 商品画像 */}
      {product.imageUrl ? (
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
            loading="lazy"
          />
          {/* ホバー時のオーバーレイ */}
          <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
        </div>
      ) : (
        <div className="aspect-square w-full bg-linear-to-br from-gray-50 to-gray-100" />
      )}

      {/* 商品名 */}
      <div className="flex h-[3em] items-center justify-center p-1.5 md:h-[4em] md:p-5 lg:h-[3.5em] lg:p-4">
        <h3 className="line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-medium leading-relaxed text-gray-800 md:text-lg lg:text-base">
          {product.name}
        </h3>
      </div>
    </button>
  );
}
```

**説明**: `onClick` プロップを受け取り、ボタンクリック時に親コンポーネントに通知します。

2. **`app/components/ProductModal.tsx`** - イベント伝播の制御

**参照**: [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (行 50-54)

```50:54:app/components/ProductModal.tsx
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
```

**説明**: `e.stopPropagation()` を使用して、モーダル内のクリックイベントが背景に伝播しないようにしています。

## このアプリでの React の使用例まとめ

### コンポーネント構成

1. **フロントエンドコンポーネント** (`app/components/`)

   - [`ProductGrid.tsx`](../../app/components/ProductGrid.tsx): 商品グリッド（モーダル表示などのインタラクティブ機能）
   - [`ProductTile.tsx`](../../app/components/ProductTile.tsx): 商品タイル（クリックイベント処理）
   - [`ProductModal.tsx`](../../app/components/ProductModal.tsx): 商品詳細モーダル（ESC キー処理、背景スクロール無効化）
   - [`Header.tsx`](../../app/components/Header.tsx): ヘッダー（Server Component）
   - [`Footer.tsx`](../../app/components/Footer.tsx): フッター（Server Component）

2. **ダッシュボードコンポーネント** (`app/dashboard/components/`)

   - [`DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx): ダッシュボードコンテンツ（フォーム送信、状態管理）
   - [`ProductList.tsx`](../../app/dashboard/components/ProductList.tsx): 商品一覧（タブ切り替え、ドラッグ&ドロップ）
   - [`CategoryTabs.tsx`](../../app/dashboard/components/CategoryTabs.tsx): カテゴリータブ（タブ切り替え UI）
   - [`SortableProductItem.tsx`](../../app/dashboard/components/SortableProductItem.tsx): ドラッグ&ドロップ可能な商品アイテム

### カスタムフック構成

1. **フロントエンド用フック** (`app/hooks/`)

   - [`useModal.ts`](../../app/hooks/useModal.ts): モーダルの開閉状態と ESC キー処理を管理
   - [`useProductModal.ts`](../../app/hooks/useProductModal.ts): 商品モーダルの状態管理

2. **ダッシュボード用フック** (`app/dashboard/hooks/`)

   - [`useTabState.ts`](../../app/dashboard/hooks/useTabState.ts): タブ状態管理（localStorage との連携）
   - [`useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts): 商品順序変更ロジック（楽観的 UI 更新）

### 状態管理のパターン

1. **ローカル状態**: `useState` を使用してコンポーネント内の状態を管理
2. **永続化された状態**: `localStorage` と `useState` を組み合わせて状態を永続化
3. **楽観的更新**: API 呼び出し前に UI を更新し、エラー時は元に戻す

## React のベストプラクティス

### 1. コンポーネントの分割

**原則**: 単一責任の原則に従い、各コンポーネントは 1 つの責務を持つ

**例**: `ProductGrid` は商品グリッドの表示とモーダルの管理、`ProductTile` は個別商品の表示を担当

### 2. カスタムフックの活用

**原則**: 状態管理ロジックをカスタムフックに分離し、再利用性を向上

**例**: `useModal`、`useProductModal`、`useTabState`、`useProductReorder`

### 3. パフォーマンスの最適化

**原則**: パフォーマンス最適化のためのメモ化を適切に使用する

**コンポーネントのメモ化**:

- `React.memo` を使用してコンポーネントをメモ化し、props が変更されない限り再レンダリングを防止
- **例**: `ProductTile` コンポーネントを `React.memo` でメモ化

```tsx
import { memo } from "react";

function ProductTile({ product, onClick }: ProductTileProps) {
  // ...
}

export default memo(ProductTile);
```

**値のメモ化**:

- `useMemo` を使用して計算コストの高い値をメモ化
- **例**: `useCategoryTabState` で初期カテゴリータブの計算をメモ化
- **例**: `ProductList` で `filteredProducts` を `useMemo` でメモ化

**コールバック関数のメモ化**:

- `useCallback` を使用してコールバック関数をメモ化し、子コンポーネントの不要な再レンダリングを防止
- **例**: `useProductModal` フック内の `handleProductClick` と `handleCloseModal` を `useCallback` でメモ化
- **例**: `ProductList` の `handleEdit`, `handleDelete`, `handleUpdated`, `handleDragEnd` を `useCallback` でメモ化

### 4. クリーンアップ処理

**原則**: `useEffect` のクリーンアップ関数で、イベントリスナーやタイマーを適切に削除

**例**:

- `useModal` で ESC キーのイベントリスナーを削除
- `useProductModal` で `setTimeout` のタイマーをクリーンアップ
- `CategoryTabs` でスクロールイベントリスナーを削除

### 5. 状態のリフトアップ

**原則**: 共有状態は親コンポーネントで管理し、props で子コンポーネントに渡す

**例**: `DashboardContent` で商品一覧の状態を管理し、`ProductList` に props で渡す

**利点**:

- データフローが明確になる
- `forwardRef`や`useImperativeHandle`を使わない宣言的な実装
- コンポーネント間の結合が緩くなる

### 6. 型安全性

**原則**: TypeScript を使用して、コンポーネントの props と状態に型を付ける

**例**: `ProductGridProps`、`ProductModalProps`、`ProductListProps` などの型定義

### 7. アクセシビリティ

**原則**: `aria-label` などの属性を使用して、アクセシビリティを向上

**例**: `ProductTile` で `aria-label` を設定

### 8. useCallback と useMemo の適切な使用

**原則**: パフォーマンス最適化が必要な場合のみ使用する

**useCallback の使用例**:

- `CategoryTabs` で `checkScrollPosition` を `useCallback` でメモ化
- `useProductModal` フック内の `handleProductClick` と `handleCloseModal` を `useCallback` でメモ化
- `ProductList` の `handleEdit`, `handleDelete`, `handleUpdated`, `handleDragEnd` を `useCallback` でメモ化

**useMemo の使用例**:

- `ProductList` で `filteredProducts` を `useMemo` でメモ化
- `ProductList` で `publishedProductsByCategory` を `useMemo` でメモ化
- `useCategoryTabState` で `initialCategoryTab` を `useMemo` でメモ化

**React.memo の使用例**:

- `ProductTile` コンポーネントを `React.memo` でメモ化し、props が変更されない限り再レンダリングを防止

### 9. エラーバウンダリー

**原則**: 予期しないエラーからアプリケーションを保護するためにエラーバウンダリーを実装する

**実装**:

- `ErrorBoundary` コンポーネントをクラスコンポーネントとして実装（関数コンポーネントではエラーバウンダリーを実装できないため）
- 子コンポーネントで発生したエラーをキャッチし、エラー UI を表示
- 開発環境ではエラー詳細を表示し、本番環境ではユーザーフレンドリーなメッセージを表示

**例**: [`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx)

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**機能**:

- エラーのキャッチと表示
- 再試行機能
- 開発環境でのエラー詳細表示

## まとめ

このアプリケーションでは、**React 19.2.3** を使用して以下の機能を実装しています：

1. **コンポーネントベースの設計**: UI を独立したコンポーネントに分割し、再利用性と保守性を向上
2. **Hooks の活用**: `useState`、`useEffect`、`useMemo`、`useRef`、`useCallback` を使用して状態管理と副作用を処理
3. **カスタムフック**: 状態管理ロジックをカスタムフックに分離し、再利用性を向上
4. **状態のリフトアップ**: 共有状態を親コンポーネントで管理し、props で子コンポーネントに渡す（React のベストプラクティスに準拠）
5. **Next.js との統合**: Server Components と Client Components を適切に使い分け、パフォーマンスを最適化
6. **楽観的 UI 更新**: API 呼び出し前に UI を更新し、ユーザーに即座にフィードバックを提供
7. **メモリリーク対策**: `useEffect` のクリーンアップ関数で、イベントリスナーやタイマーを適切に削除
8. **パフォーマンス最適化**: `React.memo`、`useCallback`、`useMemo` を適切に使用して、不要な再レンダリングを防止
9. **エラーハンドリング**: エラーバウンダリーを実装し、予期しないエラーからアプリケーションを保護

すべてのコンポーネントは TypeScript で型安全に実装され、アクセシビリティにも配慮されています。また、カスタムフックを使用してロジックを分離し、コンポーネントの再利用性と保守性を向上させています。`forwardRef`や`useImperativeHandle`を使わず、React の推奨パターンに沿った実装となっています。

## 参考リンク

- **[JSX ガイド](./jsx-guide.md)**: JSX の構文と使用方法
- **[Next.js ガイド](./nextjs-guide.md)**: Next.js での React の使用方法
- **[TypeScript ガイド](./typescript-guide.md)**: TypeScript での React の使用方法
- **[App Router ガイド](./app-router-guide.md)**: Server Components と Client Components の使い分け
- **[React 公式ドキュメント](https://react.dev/)**: React の包括的なドキュメント
