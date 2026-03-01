# React ガイド

## このドキュメントの役割

このドキュメントは「**React の基礎とフック**」を説明します。useState、useEffect、カスタムフックなど、React でのコンポーネント開発を理解したいときに参照してください。

**関連ドキュメント**:
- [JavaScript 基本構文ガイド](../basics/javascript-basics-guide.md): JavaScript の基本構文（分割代入、配列メソッド等）
- [JSX ガイド](../basics/jsx-guide.md): JSX の構文
- [Next.js ガイド](./nextjs-guide.md): Next.js との統合
- [App Router ガイド](./app-router-guide.md): Server/Client Components

## 目次

- [概要](#概要)
- [React とは](#react-とは)
- [Next.js との統合](#nextjs-との統合)
  - [Server Components と Client Components](#server-components-と-client-components)
- [React Hooks](#react-hooks)
  - [useState](#usestate)
  - [副作用（Side Effects）とは](#副作用（side-effects）とは)
  - [useEffect](#useeffect)
  - [useMemo](#usememo)
  - [useRef](#useref)
- [カスタムフック](#カスタムフック)
  - [useProductModal](#useproductmodal)
  - [useTabState](#usetabstate)
  - [useCategoryTabState](#usecategorytabstate)
  - [useProductForm](#useproductform)
  - [useProductReorder](#useproductreorder)
  - [useImageCompression](#useimagecompression)
  - [useImageUpload](#useimageupload)
  - [useScrollPosition](#usescrollposition)
- [コンポーネント設計](#コンポーネント設計)
  - [コンポーネントの分割原則](#コンポーネントの分割原則)
  - [コンポーネントの階層構造](#コンポーネントの階層構造)
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

**関連ドキュメント**: JSX の構文について詳しく知りたい場合は、[JSX ガイド](../basics/jsx-guide.md)を参照してください。このガイドでは、React の概念と実装パターンに焦点を当てています。

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
- カスタムフック（`useProductModal`, `useTabState`, `useProductForm`, `useProductReorder`）で状態管理ロジックを分離
- コンポーネントの再利用性を重視し、`Header`, `Footer`, `ProductGrid` などを共通コンポーネントとして実装

## Next.js との統合

### Server Components と Client Components

Next.js App Router では、React コンポーネントはデフォルトで Server Components として動作します。インタラクティブな機能が必要な場合のみ、`'use client'` ディレクティブを使用して Client Components として実装します。

**詳細な説明**: Server Components と Client Components の詳細な説明、使い分け、データフェッチングの方法については、[App Router ガイド - Server Components と Client Components](./app-router-guide.md#server-components-と-client-components) を参照してください。

**このアプリでの使い分け**:

- **Server Components**: [`app/page.tsx`](../../app/(public)/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/(public)/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボードページ）
- **Client Components**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)、[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)、[`app/dashboard/homepage/components/DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx)

## React Hooks

React Hooks は、関数コンポーネントで状態管理や副作用を扱うための仕組みです。このアプリでは、標準の Hooks とカスタムフックを組み合わせて使用しています。

**このアプリでの使用箇所**:

- **フロントエンド（Client Components）**: React Hooks を使用して状態管理や副作用を実装
  - [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx): `useProductModal` カスタムフックを使用
  - [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx): shadcn/ui の Dialog コンポーネントを使用
  - [`app/dashboard/homepage/components/DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx): `useState` を使用
  - [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx): `useProductForm` カスタムフックを使用
  - [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx): `useProductForm` カスタムフックを使用
  - [`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts): `useState`、`useEffect`、`localStorage` を使用
  - [`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts): `useState`、`useEffect`、`useCallback` を使用
  - [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts): `useState` を使用
  - [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts): `useState`、`useRef` を使用
- **バックエンド（Server Components、API Routes）**: React Hooks は使用していない。サーバーサイドで実行されるため、状態管理は不要

### useState

**説明**: コンポーネントの状態を管理するための Hook です。状態が変更されると、コンポーネントが再レンダリングされます。

**基本的な使い方**:

1. **[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (`useProductModal`フック)** - 商品モーダルの状態管理

```typescript
// 選択された商品を管理（モーダル表示用）
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
// モーダルの開閉状態を管理
const [isModalOpen, setIsModalOpen] = useState(false);
```

2. **[`app/dashboard/homepage/components/DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx) (`DashboardContent`コンポーネント)** - フォームの開閉状態管理

```typescript
const [isFormOpen, setIsFormOpen] = useState(false);
```

3. **[`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts) (`useTabState`フック)** - タブ状態の管理（localStorage と同期）

内部で `useLocalStorageState` を使用してhydrationエラーを防止しています。

```typescript
const [activeTab, setActiveTab] = useLocalStorageState<TabType>(
  STORAGE_KEYS.ACTIVE_TAB,
  "list",
  { validate: (v) => TAB_VALUES.includes(v as TabType) }
);
```

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

- **イベントリスナーの登録**: shadcn/ui の Dialog コンポーネントが自動的に ESC キーのイベントリスナーを登録
- **DOM 操作**: shadcn/ui の Dialog コンポーネントが自動的に背景のスクロールを無効化
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

1. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModal`コンポーネント)** - shadcn/ui の Dialog コンポーネントを使用

`ProductModal`コンポーネントでは、shadcn/ui の Dialog コンポーネントを使用しており、ESC キー処理と背景スクロール無効化が自動的に行われます。詳細については、[shadcn/ui ガイド](./shadcn-ui-guide.md) を参照してください。

2. **[`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts) (`useTabState`フック内の`useEffect`)** - localStorage への保存

`useTabState`フックでは、`useEffect`を使用してタブの状態を localStorage に保存しています。詳細な実装については、[useTabState](#usetabstate)セクションを参照してください。

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

1. **[`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts) (`useCategoryTabState`フック内の`initialCategoryTab`)** - 初期カテゴリータブの計算

`useCategoryTabState`フックでは、`useMemo`を使用して初期カテゴリータブを計算しています。詳細な実装については、[useCategoryTabState](#usecategorytabstate)セクションを参照してください。

**useMemo の特徴**:

- **パフォーマンス最適化**: 計算コストの高い処理をメモ化することで、不要な再計算を防ぐ
- **依存配列**: 依存配列の値が変更された時のみ、再計算が実行される
- **使用タイミング**: 計算コストが高い処理や、参照の同一性が重要な場合に使用

2. **[`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx) (`publishedProductsByCategory`の計算)** - 商品のフィルタリングとグループ化

```typescript
const publishedProductsByCategory = useMemo(
  () => groupProductsByCategory(products, categories),
  [products, categories]
);
```

[`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx) (`filteredProducts`の計算)

```typescript
const filteredProducts = useMemo(
  () => filterProducts(products, searchName, searchPublished, searchCategoryId),
  [products, searchName, searchPublished, searchCategoryId] // 依存配列
);
```

### useCallback

**説明**: コールバック関数をメモ化するための Hook です。依存配列の値が変更されない限り、前回作成した関数を再利用します。これにより、子コンポーネントの不要な再レンダリングを防止できます。

**基本的な使い方**:

```typescript
const memoizedCallback = useCallback(() => {
  // コールバック関数の処理
}, [dependencies]);
```

1. **[`app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx`](../../app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx) (`checkScrollPosition`関数)** - スクロール位置のチェック

```typescript
const checkScrollPosition = useCallback(() => {
  if (!scrollContainerRef.current) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
  // 左側にスクロールできる場合（scrollLeft > 0）は左側のグラデーションを表示
  setShowLeftGradient(scrollLeft > 0);
  // 右側にスクロールできる場合（scrollLeft < scrollWidth - clientWidth - 1）は右側のグラデーションを表示
  // -1 は丸め誤差を考慮したマージン
  setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
}, []);
```

2. **[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (`handleProductClick`関数と`handleCloseModal`関数)** - 商品モーダルの操作関数

`useProductModal`フックでは、`useCallback`を使用して`handleProductClick`と`handleCloseModal`関数をメモ化しています。詳細な実装については、[useProductModal](#useproductmodal)セクションを参照してください。

3. **[`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx) (`handleEdit`関数)** - 商品操作のコールバック関数

```typescript
const handleEdit = useCallback((product: Product) => {
  setEditingProduct(product);
}, []);
```

商品削除処理は `useProductDelete` カスタムフックに分離されています。

```typescript
// app/dashboard/homepage/hooks/useProductDelete.ts
const { handleDelete } = useProductDelete(refreshProducts);
```

**useCallback の特徴**:

- **パフォーマンス最適化**: コールバック関数をメモ化することで、子コンポーネントの不要な再レンダリングを防止
- **依存配列**: 依存配列の値が変更された時のみ、新しい関数が作成される
- **使用タイミング**: メモ化されたコンポーネント（`React.memo`）に渡すコールバック関数や、`useEffect` の依存配列に含める関数に使用

### React.memo

**説明**: コンポーネントをメモ化するための高階コンポーネント（HOC）です。props が変更されない限り、前回レンダリングした結果を再利用します。これにより、不要な再レンダリングを防止し、パフォーマンスを向上させます。

**基本的な使い方**:

```typescript
const MemoizedComponent = memo(Component);
```

1. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)** - 商品タイルコンポーネント

```typescript
function ProductTile({ product, onClick }: ProductTileProps) {
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

export default memo(ProductTile);
```

**React.memo の特徴**:

- **パフォーマンス最適化**: props が変更されない限り、再レンダリングをスキップ
- **浅い比較**: props の浅い比較（shallow comparison）を実行
- **使用タイミング**: 頻繁に再レンダリングされる可能性があるコンポーネントや、レンダリングコストが高いコンポーネントに使用
- **useCallback との組み合わせ**: `useCallback` でメモ化されたコールバック関数と組み合わせることで、より効果的にパフォーマンスを向上

### useRef

**説明**: コンポーネントのライフサイクル全体を通じて、変更可能な値を保持するための Hook です。再レンダリングを引き起こさない点が `useState` と異なります。

**基本的な使い方**:

1. **[`app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx`](../../app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx) (`scrollContainerRef`)** - DOM 要素への参照

```typescript
// useRef を使用して DOM 要素に直接アクセスします
const scrollContainerRef = useRef<HTMLDivElement>(null);
```

2. **[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (`timeoutRef`)** - タイマー ID の保持

```typescript
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
```

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

- 状態管理は親コンポーネントから props で渡す方が、データフローが明確で理解しやすい
- 状態の共有が必要な範囲が限定的で、props で十分に対応できる

**useReducer** - 複雑な状態管理

`useState`の代替として、複雑な状態ロジックを管理するために使用します。複数の状態を 1 つのオブジェクトで管理し、アクションに基づいて状態を更新します。

**使用例**:

```typescript
function reducer(state: { count: number }, action: { type: string }) {
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

- 状態管理が比較的シンプルで、`useState`で十分に対応できる
- 複数の状態を個別に管理する方が、コードが読みやすい

**useImperativeHandle と forwardRef** - 親コンポーネントからの参照制御

親コンポーネントから子コンポーネントのメソッドや値を直接参照できるようにします。

**使用例**:

```typescript
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

- React のベストプラクティスに従い、props とコールバック関数で親子間の通信を行っている
- データフローが明確で、コンポーネント間の結合が緩くなる
- 宣言的な実装により、コードが理解しやすくなる

## カスタムフック

カスタムフックは、状態管理ロジックを再利用可能な関数に抽出するための仕組みです。このアプリでは、複数のカスタムフックを実装し、コンポーネントのロジックを分離しています。

**注意**: このアプリでは、モーダルコンポーネントに shadcn/ui の Dialog コンポーネントを使用しています。Dialog コンポーネントは、ESC キー処理と背景スクロール無効化を自動的に行うため、専用のカスタムフックは不要です。

**このアプリでの使用箇所**:

- [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx): shadcn/ui の Dialog コンポーネントを使用

**詳細**: shadcn/ui の使用方法については、[shadcn/ui ガイド](./shadcn-ui-guide.md) を参照してください。

- ESC キーでモーダルを閉じる
- モーダル表示時の背景スクロール無効化
- クリーンアップ処理によるメモリリークの防止
- `useRef`を使用して`onClose`の最新の参照を保持し、不要な再実行を防止

### useTabState

**説明**: ダッシュボードのタブ状態を管理するカスタムフックです。localStorage と同期して、ページリロード後も選択していたタブを保持します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts): フックの実装
- [`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx): 商品一覧で使用

**実装コード**:

[`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts) (`useTabState`フック)

```typescript
export function useTabState() {
  const [activeTab, setActiveTab] = useLocalStorageState<TabType>(
    STORAGE_KEYS.ACTIVE_TAB,
    "list",
    { validate: (v) => TAB_VALUES.includes(v as TabType) }
  );

  return { activeTab, setActiveTab };
}
```

- 内部で `useLocalStorageState` を使用してhydrationエラーを防止
- タブの状態を localStorage に保存・復元
- `validate` 関数で保存値の検証を行い、無効な値はデフォルト値にフォールバック

### useCategoryTabState

**説明**: カテゴリータブの状態を管理するカスタムフックです。localStorage と同期し、公開商品がある最初のカテゴリーを自動選択します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts): フックの実装
- [`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx): 商品一覧で使用

### useProductForm

**説明**: 商品フォームの状態管理を行うカスタムフックです。商品作成・編集フォームで使用する共通ロジックを提供します。

**主な機能**:

- フォームデータの状態管理
- 画像の圧縮とアップロード
- 公開日・終了日に基づく公開状態の自動計算

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts): フックの実装
- [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx): 新規商品登録フォームで使用
- [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx): 商品編集フォームで使用

**詳細**: このフックの詳細な説明については、[ダッシュボードガイド - useProductForm](./dashboard-guide.md#useproductform-hooksuseproductformtsappdashboardhomepagehooksuseproductformts)を参照してください。

**実装コード**:

[`app/dashboard/homepage/hooks/useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts) (`useCategoryTabState`フック)

```typescript
export function useCategoryTabState(
  products: Product[],
  categories: Category[]
) {
  // 公開商品があるカテゴリーを優先的に選択
  const defaultCategoryTab = useMemo(() => {
    const published = products.filter((p) => p.published);
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

    if (published.length > 0) {
      const firstCategory = sortedCategories.find((c) =>
        published.some((p) => p.category.id === c.id)
      );
      return firstCategory?.name || sortedCategories[0]?.name || "";
    }
    return sortedCategories[0]?.name || "";
  }, [products, categories]);

  const [activeCategoryTab, setActiveCategoryTab] =
    useLocalStorageState<string>(
      STORAGE_KEYS.ACTIVE_CATEGORY_TAB,
      defaultCategoryTab,
      { validate: (v) => categories.some((c) => c.name === v) }
    );

  return {
    activeCategoryTab,
    setActiveCategoryTab,
    initialCategoryTab: defaultCategoryTab,
  };
}
```

- 内部で `useLocalStorageState` を使用してhydrationエラーを防止
- 公開商品がある最初のカテゴリーを自動選択
- `validate` 関数で保存されたカテゴリーが現在も存在するか確認
- `useMemo` を使用してデフォルト値の計算を最適化

### useProductReorder

**説明**: 商品の順序変更を処理するカスタムフックです。楽観的 UI 更新を実装しており、API 呼び出し前に UI を更新することで、ユーザーに即座にフィードバックを提供します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useProductReorder.ts`](../../app/dashboard/homepage/hooks/useProductReorder.ts): フックの実装
- [`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx): 商品一覧で使用

**実装コード**:

[`app/dashboard/homepage/hooks/useProductReorder.ts`](../../app/dashboard/homepage/hooks/useProductReorder.ts) (`useProductReorder`フック)

```typescript
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

- 楽観的 UI 更新（API 呼び出し前に UI を更新）
- API 呼び出しによるサーバーへの保存
- エラーハンドリング（失敗時は元の状態に戻す）
- 成功時の最新データ取得

**楽観的 UI 更新のメリット**:

- **即座のフィードバック**: ユーザーは API 呼び出しの完了を待たずに、変更を確認できる
- **UX の向上**: レスポンスタイムが短く感じられる
- **エラー処理**: 失敗時は元の状態に戻すことで、データの整合性を保つ

### useImageCompression

**説明**: 画像圧縮処理を行うカスタムフックです。画像ファイルの検証と圧縮機能を提供します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useImageCompression.ts`](../../app/dashboard/homepage/hooks/useImageCompression.ts): フックの実装
- [`app/dashboard/homepage/hooks/useImageUpload.ts`](../../app/dashboard/homepage/hooks/useImageUpload.ts): `useImageUpload`から使用

**実装コード**:

[`app/dashboard/homepage/hooks/useImageCompression.ts`](../../app/dashboard/homepage/hooks/useImageCompression.ts) (`useImageCompression`フック)

```typescript
export function useImageCompression() {
  const [compressing, setCompressing] = useState(false);

  const compressImageFile = useCallback(
    async (file: File): Promise<File | null> => {
      // 画像ファイルの検証
      if (!isImageFile(file)) {
        alert("画像ファイルのみ選択可能です");
        return null;
      }

      // ファイルサイズの確認（10MB以上の場合警告）
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 10) {
        const proceed = confirm(/* ... */);
        if (!proceed) return null;
      }

      setCompressing(true);
      try {
        // 画像を圧縮
        const processedFile = await compressImage(file, {
          maxSizeMB: config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
        });
        return processedFile;
      } catch (error) {
        // エラーハンドリング
        return null;
      } finally {
        setCompressing(false);
      }
    },
    []
  );

  return { compressing, compressImageFile };
}
```

**特徴**:

- 画像ファイルの検証（`isImageFile`を使用）
- ファイルサイズの確認と警告（10MB以上の場合）
- 画像の圧縮処理（`compressImage`を使用）
- 圧縮状態の管理（`compressing`）

### useImageUpload

**説明**: 画像アップロード処理を行うカスタムフックです。画像の圧縮とアップロード機能を提供します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useImageUpload.ts`](../../app/dashboard/homepage/hooks/useImageUpload.ts): フックの実装
- [`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts): 商品フォームで使用

**実装コード**:

[`app/dashboard/homepage/hooks/useImageUpload.ts`](../../app/dashboard/homepage/hooks/useImageUpload.ts) (`useImageUpload`フック)

```typescript
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { compressing, compressImageFile } = useImageCompression();

  const handleImageChange = useCallback(
    async (
      file: File | null,
      fallbackImageUrl?: string | null
    ): Promise<{ file: File | null; previewUrl: string | null }> => {
      if (!file) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      // 画像を圧縮
      const processedFile = await compressImageFile(file);
      if (!processedFile) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      // プレビューURLを生成
      const previewUrl = URL.createObjectURL(processedFile);
      return { file: processedFile, previewUrl };
    },
    [compressImageFile]
  );

  const uploadImage = useCallback(
    async (imageFile: File | null, existingImageUrl: string | null): Promise<string | null> => {
      if (!imageFile) {
        return existingImageUrl || null;
      }

      setUploading(true);
      try {
        // FormDataを作成してアップロード
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadResponse = await fetch("/api/products/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("画像のアップロードに失敗しました");
        }

        const uploadData = await uploadResponse.json();
        return uploadData.url;
      } catch (error) {
        console.error("画像アップロードエラー:", error);
        throw error;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { uploading, compressing, handleImageChange, uploadImage };
}
```

**特徴**:

- `useImageCompression`を使用して画像を圧縮
- プレビューURLの生成（`URL.createObjectURL`を使用）
- 画像のアップロード処理（`/api/products/upload`にPOST）
- アップロード状態の管理（`uploading`）

### useScrollPosition

**説明**: スクロール位置を監視するカスタムフックです。スクロール可能なコンテナの左右のスクロール位置を監視し、グラデーション表示の制御に使用します。

**このアプリでの使用箇所**:

- [`app/dashboard/homepage/hooks/useScrollPosition.ts`](../../app/dashboard/homepage/hooks/useScrollPosition.ts): フックの実装
- [`app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx`](../../app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx): 配置変更用カテゴリータブで使用

**実装コード**:

[`app/dashboard/homepage/hooks/useScrollPosition.ts`](../../app/dashboard/homepage/hooks/useScrollPosition.ts) (`useScrollPosition`フック)

```typescript
export function useScrollPosition() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  return {
    scrollContainerRef,
    showLeftGradient,
    showRightGradient,
    checkScrollPosition,
  };
}
```

**特徴**:

- スクロール位置の監視（`scroll`イベントと`resize`イベント）
- 左右のグラデーション表示の制御
- `useRef`を使用してDOM要素への参照を保持
- クリーンアップ処理によるメモリリークの防止

## コンポーネント設計

このアプリでは、コンポーネントを適切に分割し、再利用性と保守性を向上させています。

### コンポーネントの分割原則

1. **単一責任の原則**: 各コンポーネントは 1 つの責務を持つ
2. **再利用性**: 汎用的なコンポーネントは分離（例: `ProductTile`, `ProductModal`）
3. **関心の分離**: UI とロジックを分離（カスタムフックを使用）

### コンポーネントの階層構造

**フロントエンドコンポーネント**:

```
page.tsx (Server Component)
└── ProductCategoryTabs (Client Component)
    └── ProductGrid (Client Component)
        ├── ProductTile (Client Component)
        └── ProductModal (Client Component)
```

**ダッシュボードコンポーネント**:

```
dashboard/page.tsx (Server Component)
└── DashboardContent (Client Component)
    └── ProductList (Client Component)
        ├── ProductCategoryTabs (Client Component)
        └── SortableProductItem (Client Component)
```

1. **[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGrid`コンポーネント)** - 商品グリッドコンポーネント

```typescript
export default function ProductGrid({ category, products }: ProductGridProps) {
  // モーダルの状態管理（カスタムフックで実装）
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

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

2. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModal`コンポーネント)** - 商品モーダルコンポーネント

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { PriceBadge } from "./ui/badge-price";
import { ModalImageCard, ModalContentCard, ModalPriceCard, ModalCardContent, ModalCardHeader } from "./ui/card-modal";

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            {/* 画像部分 */}
            <ModalImageCard>
              <ModalCardHeader>
                <div className="relative h-[40vh] overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-contain" />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-muted" />
                  )}
                </div>
              </ModalCardHeader>
            </ModalImageCard>

            {/* 商品情報部分 */}
            <ModalContentCard>
              <ModalCardContent>
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  {product.description && (
                    <DialogDescription>{product.description}</DialogDescription>
                  )}
                </DialogHeader>
              </ModalCardContent>
            </ModalContentCard>

            {/* 価格部分 */}
            {(product.priceS || product.priceL) && (
              <ModalPriceCard>
                <ModalCardContent>
                  <div className="flex items-center justify-center gap-3">
                    {product.priceS && <PriceBadge>{formatPrice(product.priceS)}</PriceBadge>}
                    {product.priceL && <PriceBadge>{formatPrice(product.priceL)}</PriceBadge>}
                  </div>
                </ModalCardContent>
              </ModalPriceCard>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

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

**関連**: JSX でのイベントハンドラーの書き方については、[JSX ガイド](../basics/jsx-guide.md)を参照してください。

### イベントハンドリングの例

1. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)** - クリックイベントの処理

```typescript
function ProductTile({ product, onClick }: ProductTileProps) {
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

2. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModal`コンポーネントのイベントハンドラー)** - イベント伝播の制御

```typescript
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
```

## このアプリでの React の使用例まとめ

### コンポーネント構成

1. **フロントエンドコンポーネント** (`app/components/`)

   - [`ProductGrid.tsx`](../../app/components/ProductGrid.tsx): 商品グリッド（モーダル表示などのインタラクティブ機能）
   - [`ProductTile.tsx`](../../app/components/ProductTile.tsx): 商品タイル（クリックイベント処理）
   - [`ProductModal.tsx`](../../app/components/ProductModal.tsx): 商品詳細モーダル（ESC キー処理、背景スクロール無効化）
   - [`FixedHeader.tsx`](../../app/components/FixedHeader.tsx): ヘッダー（Server Component、モバイルメニュー含む）
   - [`Footer.tsx`](../../app/components/Footer.tsx): フッター（Server Component）

2. **ダッシュボードコンポーネント** (`app/dashboard/homepage/components/`)

   - [`DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx): ダッシュボードコンテンツ（フォーム送信、状態管理）
   - [`ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx): 商品一覧（タブ切り替え、ドラッグ&ドロップ）
   - [`LayoutCategoryTabs.tsx`](../../app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx): 配置変更用カテゴリータブ（タブ切り替え UI）
   - [`SortableProductItem.tsx`](../../app/dashboard/homepage/components/layout/SortableProductItem.tsx): ドラッグ&ドロップ可能な商品アイテム

### カスタムフック構成

1. **フロントエンド用フック** (`app/hooks/`)

   - [`useProductModal.ts`](../../app/hooks/useProductModal.ts): 商品モーダルの状態管理
   - [`useInView.ts`](../../app/hooks/useInView.ts): ビューポート交差検知（Intersection Observer）

2. **ダッシュボード用フック** (`app/dashboard/homepage/hooks/`)

   - [`useLocalStorageState.ts`](../../app/dashboard/homepage/hooks/useLocalStorageState.ts): localStorage永続化の汎用フック（hydration対応）
   - [`useTabState.ts`](../../app/dashboard/homepage/hooks/useTabState.ts): タブ状態管理（`useLocalStorageState`を使用）
   - [`useProductDelete.ts`](../../app/dashboard/homepage/hooks/useProductDelete.ts): 商品削除ロジック（`fetchJson`・toast通知）
   - [`useProductSearch.ts`](../../app/dashboard/homepage/hooks/useProductSearch.ts): 商品検索ロジック
   - [`useProductReorder.ts`](../../app/dashboard/homepage/hooks/useProductReorder.ts): 商品順序変更ロジック（楽観的 UI 更新）

### 状態管理のパターン

1. **ローカル状態**: `useState` を使用してコンポーネント内の状態を管理
2. **永続化された状態**: `localStorage` と `useState` を組み合わせて状態を永続化
3. **楽観的更新**: API 呼び出し前に UI を更新し、エラー時は元に戻す

## React のベストプラクティス

### コンポーネント設計

- **単一責任**: 各コンポーネントは1つの責務を持つ
- **状態のリフトアップ**: 共有状態は親コンポーネントで管理し、propsで渡す
- **カスタムフック**: 状態管理ロジックを分離して再利用性を向上

### メモ化の適切な使用

**使用すべき場面**:
- `useMemo`: フィルタリング、ソート、グループ化などの計算コストが高い処理
- `useCallback`: メモ化されたコンポーネントに渡すコールバック関数
- `React.memo`: 頻繁に再レンダリングされるコンポーネント

**使用すべきでない場面**:
- 単純な式や文字列結合（オーバーヘッドが利益を上回る）
- 依存配列が頻繁に変わる場合

### 派生状態の計算

```tsx
// 悪い例: 派生状態をuseStateで管理
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// 良い例: レンダリング中に計算
const fullName = `${firstName} ${lastName}`;
```

### クリーンアップ処理

`useEffect`のクリーンアップ関数で、イベントリスナーやタイマーを適切に削除すること。

### エラーバウンダリー

[`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx) で予期しないエラーをキャッチし、エラーUIを表示する。

## まとめ

このアプリケーションでは、**React 19** を使用して以下を実装しています：

- **Server Components / Client Components**: Next.js App Routerと統合し、適切に使い分け
- **カスタムフック**: `useProductModal`、`useTabState`などで状態管理ロジックを分離
- **楽観的UI更新**: `useProductReorder`でAPI呼び出し前にUIを更新
- **メモ化**: 計算コストの高い処理に`useMemo`、コールバックに`useCallback`を適用
- **エラーバウンダリー**: 予期しないエラーからアプリケーションを保護

## 参考リンク

- **[JavaScript 基本構文ガイド](../basics/javascript-basics-guide.md)**: JavaScript の基本構文（分割代入、配列メソッド、コードスタイル）
- **[JSX ガイド](../basics/jsx-guide.md)**: JSX の構文と使用方法
- **[Next.js ガイド](./nextjs-guide.md)**: Next.js での React の使用方法
- **[TypeScript ガイド](../basics/typescript-guide.md)**: TypeScript での React の使用方法
- **[App Router ガイド](./app-router-guide.md)**: Server Components と Client Components の使い分け
- **[React 公式ドキュメント](https://react.dev/)**: React の包括的なドキュメント
