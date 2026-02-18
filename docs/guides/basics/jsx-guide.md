# JSX ガイド

## このドキュメントの役割

このドキュメントは「**JSX の構文と書き方**」を説明します。React コンポーネントでの HTML ライクな記述方法を理解したいときに参照してください。

**関連ドキュメント**:
- [JavaScript 基本構文ガイド](./javascript-basics-guide.md): JavaScript の基本構文（分割代入、配列メソッド等）
- [React ガイド](../frontend/react-guide.md): コンポーネントと状態管理
- [勉強用ガイド](../learning-guide.md): 学習の進め方

## 目次

- [概要](#概要)
- [JSX とは](#jsx-とは)
- [JSX と HTML の違い](#jsx-と-html-の違い)
- [基本的な構文](#基本的な構文)
  - [要素の記述](#要素の記述)
  - [子要素](#子要素)
  - [JavaScript 式の埋め込み](#javascript-式の埋め込み)
  - [リストのレンダリング](#リストのレンダリング)
- [このアプリでの JSX の使用例](#このアプリでの-jsx-の使用例)
  - [基本的なコンポーネント](#基本的なコンポーネント)
  - [リストのレンダリング](#リストのレンダリング)
- [まとめ](#まとめ表)

## 概要

JSX（JavaScript XML）は、React で UI を記述するための構文拡張です。HTML に似た構文で、JavaScript の式を埋め込むことができます。TypeScript と組み合わせることで、型安全な UI コンポーネントを記述できます。

このアプリケーションでは、JSX を使用してすべての React コンポーネントを実装しています。

**関連ドキュメント**: React の概念（Hooks、状態管理、パフォーマンス最適化など）について詳しく知りたい場合は、[React ガイド](../frontend/react-guide.md)を参照してください。このガイドでは、JSX の構文と書き方に焦点を当てています。

**JSX の主な特徴**:

- **HTML に似た構文**: HTML に慣れ親しんだ開発者にとって理解しやすい
- **JavaScript 式の埋め込み**: `{}` を使用して JavaScript の式を埋め込める
- **コンポーネントベース**: 再利用可能なコンポーネントを定義できる
- **型安全性**: TypeScript と組み合わせることで、コンパイル時にエラーを検出

## JSX とは

JSX は、JavaScript の構文拡張で、React 要素を記述するために使用されます。JSX は、ブラウザで実行される前に、通常の JavaScript 関数呼び出しに変換されます。

**JSX の変換例**:

const element = <h1>Hello, World!</h1>;

// 自動変換後（React 19 の新しい JSX 変換）
// 注意: この変換は TypeScript コンパイラが自動的に行います
// 開発者が直接このコードを書く必要はありません
import { jsx } from "react/jsx-runtime";
const element = jsx("h1", { children: "Hello, World!" });

- **開発者は JSX 構文（`<h1>`, `<div>`など）を直接書きます**
- **`jsx`関数を直接呼び出す必要はありません**（TypeScript コンパイラが自動変換）
- このアプリでは、TypeScript の設定（`tsconfig.json`）で `jsx: "react-jsx"` を指定しており、React 19 の新しい JSX 変換を使用しています

**このアプリでの実際の使用例**:

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGrid`コンポーネントのレンダリング部分)

```tsx
// 開発者が書くコード（JSX構文）
return (
  <>
    <section className="mb-8 md:mb-16 lg:mb-12">
      <h2 className="text-center text-lg font-light">
        {category.name}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} onClick={...} />
        ))}
      </div>
    </section>
  </>
);
```

**新しい JSX 変換の利点**:

- **自動インポート不要**: `import React from "react"` が不要
- **パフォーマンス向上**: 最適化されたランタイムを使用
- **バンドルサイズの削減**: 不要な React インポートを削減

## JSX と HTML の違い

JSX は HTML に似ていますが、いくつかの重要な違いがあります。HTML から JSX に移行する際に注意すべきポイントをまとめます。

### 1. 属性名の違い

#### `class` → `className`

HTML では `class` を使用しますが、JSX では JavaScript の予約語である `class` の代わりに `className` を使用します。

**HTML の例**:

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

```text
<div class="container">Content</div>
```

**JSX の例**:

```jsx
<div className="container">Content</div>
```

**このアプリでの使用例**:

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)

```tsx
<button
  className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
  aria-label={`${product.name}の詳細を見る`}
>
```

#### `for` → `htmlFor`

HTML では `for` を使用しますが、JSX では `htmlFor` を使用します。

**HTML の例**:

```text
<input type="email" id="email">
```

**JSX の例**:

```jsx
<input type="email" id="email" />
```

HTML では小文字の属性名（`onclick`）を使用し、文字列で JavaScript コードを記述しますが、JSX ではキャメルケース（`onClick`）を使用し、関数を直接渡します。

**HTML の例**:

```text
<button onclick="handleClick()">Click me</button>
```

**JSX の例**:

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)

```tsx
<button
  onClick={onClick}
  className="group w-full overflow-hidden rounded-lg"
>
```

**このアプリでの使用例**:

[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModal`コンポーネントのイベントハンドラー)

```tsx
<button
  onClick={onClose}
  className="rounded-full bg-white/90 p-2"
  aria-label="閉じる"
>
```

### 3. 自己閉じタグの必須性

JSX では、子要素を持たない要素は必ず自己閉じタグ（`/>`）で閉じる必要があります。

**HTML での例**（どちらも有効）:

- `<img src="image.jpg" alt="Image">` - 閉じタグなし（HTML で有効）
- `<img src="image.jpg" alt="Image" />` - 自己閉じタグ（HTML でも有効）
- `<br>` - 閉じタグなし（HTML で有効）
- `<br />` - 自己閉じタグ（HTML でも有効）

**JSX での例**（自己閉じタグが必須）:

```jsx
<img src="image.jpg" alt="Image" />
<br />
```

**このアプリでの使用例**:

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (商品画像セクション)

```tsx
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
/>
```

### 4. JavaScript 式の埋め込み

HTML では静的なテキストのみを記述できますが、JSX では `{}` を使用して JavaScript 式を埋め込むことができます。

**HTML の例**（静的なテキストのみ）:

```text
<div>Hello, World!</div>
```

**JSX の例**:

```jsx
const name = "World";
<div>Hello, {name}!</div>
<div>計算結果: {1 + 2}</div>
```

### 5. コメントの書き方

HTML では `<!-- -->` を使用しますが、JSX では `{/* */}` を使用します。

**HTML の例**:

```text
<div>
  <!-- これはコメントです -->
  Content
</div>
```

**JSX の例**:

```jsx
<div>
  {/* これはコメントです */}
  Content
</div>
```

**このアプリでの使用例**:

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)

```tsx
<button onClick={onClick}>
  {/* 商品画像 */}
  {product.imageUrl ? (
    <div className="relative aspect-square w-full">
      <Image src={product.imageUrl} alt={product.name} fill />
    </div>
  ) : (
    <div className="aspect-square w-full bg-gray-50" />
  )}

  {/* 商品名 */}
  <div className="flex h-[3em] items-center justify-center">
    <h3>{product.name}</h3>
  </div>
</button>
```

### 6. ブール値の属性

HTML ではブール値の属性を省略できますが、JSX では明示的に `true` または `false` を指定する必要があります。

**HTML の例**（属性を省略可能）:

```text
<input type="checkbox" checked disabled />
```

**JSX の例**:

```jsx
<input type="checkbox" checked={true} disabled={true} />
// または、true の場合は省略可能
<input type="checkbox" checked disabled />
```

### 7. スタイル属性

HTML では文字列でスタイルを指定しますが、JSX ではオブジェクト形式で指定できます（ただし、このアプリでは Tailwind CSS を使用しているため、直接的なスタイル属性の使用は限定的です）。

**HTML の例**（文字列形式）:

```text
<div style="color: red; font-size: 16px;">Text</div>
```

**JSX の例**:

```jsx
<div style={{ color: "red", fontSize: "16px" }}>Text</div>
```

### 8. 属性値の型

HTML では属性値は常に文字列ですが、JSX では数値、ブール値、オブジェクト、配列など、任意の JavaScript の値を渡すことができます。

**HTML の例**（すべて文字列）:

```text
<div data-count="5" data-active="true">
  Content
</div>
```

**JSX の例**:

```jsx
<div data-count={5} data-active={true}>
  Content
</div>
```

JSX では、JavaScript の予約語と衝突する属性名は別名を使用します。

| HTML       | JSX         | 理由                           |
| ---------- | ----------- | ------------------------------ |
| `class`    | `className` | `class` は JavaScript の予約語 |
| `for`      | `htmlFor`   | `for` は JavaScript の予約語   |
| `tabindex` | `tabIndex`  | キャメルケース化               |

### まとめ表

| 項目               | HTML            | JSX                        |
| ------------------ | --------------- | -------------------------- |
| クラス属性         | `class`         | `className`                |
| ラベル属性         | `for`           | `htmlFor`                  |
| イベントハンドラー | `onclick="..."` | `onClick={...}`            |
| 自己閉じタグ       | 任意            | 必須（`/>`）               |
| JavaScript 式      | 不可            | `{}` で埋め込み可能        |
| コメント           | `<!-- -->`      | `{/* */}`                  |
| ブール値属性       | 省略可能        | 明示的に指定               |
| スタイル           | 文字列          | オブジェクト形式（`{{}}`） |
| 属性値の型         | 常に文字列      | JavaScript の任意の型      |

### JSX と HTML の違いのまとめ

上記の違いを踏まえて、HTML から JSX に変換する際の例を示します。

**間違い: HTML の書き方をそのまま使用**

```text
<div class="container" onclick="handleClick()">
  <!-- コメント -->
  <img src="image.jpg" alt="Image" />
</div>
```

**理由**:

- **構文エラー**: JSX では `class` は使用できず、`className` を使用する必要がある
- **イベントハンドラー**: HTML の `onclick` は文字列だが、JSX では `onClick` にキャメルケースで関数を渡す必要がある
- **コメント形式**: HTML の `<!-- -->` は JSX では使用できず、`{/* */}` を使用する必要がある
- **自己閉じタグ**: JSX では子要素を持たない要素は必ず `/>` で閉じる必要がある

**正しい: JSX の書き方**

```tsx
<div className="container" onClick={handleClick}>
  {/* コメント */}
  <img src="image.jpg" alt="Image" />
</div>
```

**理由**:

- **正しい構文**: JSX の構文規則に従い、`className` を使用している
- **イベントハンドラー**: `onClick` にキャメルケースで関数を渡し、正しく動作する
- **コメント形式**: JSX の `{/* */}` 形式を使用し、正しくコメントが記述される
- **自己閉じタグ**: `img` 要素が `/>` で正しく閉じられている

## 基本的な構文

### 要素の記述

JSX では、HTML と同様に要素を記述できます。

```jsx
<div>Hello, World!</div>

// 自己閉じタグ
<img src="image.jpg" alt="Image" />
<header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
  <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
    {/* ... */}
  </div>
</header>


[`app/components/FixedHeader.tsx`](../../app/components/FixedHeader.tsx)
### 属性（Props）

JSX では、HTML の属性と同様に props を指定できます。HTML との違いについては、[JSX と HTML の違い](#jsx-と-html-の違い)セクションを参照してください。

<div className="container">Content</div>

// イベントハンドラー（キャメルケース）
<button onClick={handleClick}>Click me</button>

// ブール値の属性
<input type="checkbox" checked={isChecked} />
```

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (商品画像セクション)

```tsx
<button
  onClick={onClick}
  className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
  aria-label={`${product.name}の詳細を見る`}
>
  {/* ... */}
</button>
```

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)

### 子要素

JSX では、要素の中に他の要素やテキストを配置できます。

```jsx
  <h1>Title</h1>
  <p>Description</p>
</div>
<div className="flex h-[3em] items-center justify-center p-1.5">
  <h3 className="line-clamp-2 text-center">{product.name}</h3>
</div>


[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)
### children prop（子要素を受け取る）

コンポーネントは、`children` prop を使用して子要素を受け取ることができます。これにより、コンポーネントをラッパーとして使用できます。

function Container({ children }) {
  return <div className="container">{children}</div>;
}

// 使用例
<Container>
  <h1>Title</h1>
  <p>Description</p>
</Container>;
```

[`app/layout.tsx`](../../app/layout.tsx) (`RootLayout`コンポーネント)

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

[`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx)

```tsx
interface ErrorBoundaryProps {
  children: ReactNode; // エラーバウンダリーで囲む子コンポーネント
  fallback?: ReactNode; // エラー発生時に表示するフォールバックUI（オプション）
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children; // 子要素をそのまま返す
  }
}


[`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx)
```

**重要なポイント**:

- `children` は特別な prop で、コンポーネントの開始タグと終了タグの間の内容が自動的に渡されます
- `children` の型は `ReactNode` で、文字列、数値、要素、配列、`null`、`undefined` など、様々な型を受け取れます
- `children` は必須ではありません。コンポーネントが子要素を持たない場合、`children` は `undefined` になります

### JavaScript 式の埋め込み

JSX では、`{}` を使用して JavaScript の式を埋め込むことができます。

const element = <h1>Hello, {name}!</h1>;

// 式も使用可能
const element = <h1>1 + 1 = {1 + 1}</h1>;
[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

<h2 className="text-center text-lg font-light">{category.name}</h2>

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

**JSX 式の制限**:

JSX では、以下のような値は直接レンダリングできません：

**間違い: オブジェクトを直接レンダリング**

```tsx
const user = { name: "John", age: 30 };
<div>{user}</div>; // エラー: Objects are not valid as a React child
```

**理由**:

- **レンダリングエラー**: オブジェクトは React の子要素として有効でないため、実行時エラーが発生する
- **型の不一致**: JSX はプリミティブ値や React 要素を期待しており、オブジェクトは直接レンダリングできない

**正しい: オブジェクトのプロパティをレンダリング**

```tsx
<div>{user.name}</div>
```

**理由**:

- **正しいレンダリング**: オブジェクトのプロパティ（文字列）をレンダリングすることで、エラーなく表示できる
- **型の一致**: 文字列は React の子要素として有効で、正しくレンダリングされる

**正しい: JSON.stringify を使用**

```tsx
<div>{JSON.stringify(user)}</div>
```

**理由**:

- **デバッグ用途**: オブジェクト全体を文字列として表示でき、デバッグ時に便利
- **型の変換**: `JSON.stringify` によりオブジェクトが文字列に変換され、レンダリング可能になる

**間違い: 関数を直接レンダリング**

```tsx
const handleClick = () => console.log("clicked");
<div>{handleClick}</div>; // エラー: Functions are not valid as a React child
```

**理由**:

- **レンダリングエラー**: 関数は React の子要素として有効でないため、実行時エラーが発生する
- **型の不一致**: JSX は関数を直接レンダリングできず、関数を呼び出すか、イベントハンドラーとして使用する必要がある

**正しい: 関数を呼び出す（ただし、これは推奨されない）**

```tsx
<div>{handleClick()}</div>
```

**理由**:

- **動作はする**: 関数を呼び出すことで、戻り値がレンダリングされる（この例では `undefined` が返されるため何も表示されない）
- **推奨されない理由**: レンダリング時に毎回関数が実行され、パフォーマンスの問題や予期しない副作用が発生する可能性がある

**正しい: イベントハンドラーとして使用**

```tsx
<button onClick={handleClick}>Click me</button>
```

**理由**:

- **正しい使用方法**: 関数をイベントハンドラーとして渡すことで、ユーザーの操作に応じた実行
- **パフォーマンス**: レンダリング時ではなく、イベント発生時のみ関数が実行される
- **意図の明確化**: イベントハンドラーとして使用することで、コードの意図が明確になる

- 文字列
- 数値
- ブール値（`true`/`false` は何も表示しないが、エラーにはならない）
- `null`（何も表示しない）
- `undefined`（何も表示しない）
- React 要素
- React 要素の配列
- フラグメント

```jsx
<div>{null}</div>           {/* 何も表示しない */}
<div>{undefined}</div>       {/* 何も表示しない */}
<div>{true}</div>            {/* 何も表示しない */}
<div>{false}</div>           {/* 何も表示しない */}
<div>{0}</div>               {/* 0 が表示される */}
<div>{""}</div>              {/* 何も表示しない */}
<div>{"Hello"}</div>         {/* Hello が表示される */}
<div>{123}</div>             {/* 123 が表示される */}
```

JSX では、条件に応じて要素を表示/非表示できます。

**注意**: このセクションでは JSX 構文での条件付きレンダリングに焦点を当てています。React での実装パターンについては、[React ガイド](../frontend/react-guide.md)も参照してください。

**方法 1: 三項演算子**

```tsx
{isLoggedIn ? <UserMenu /> : <LoginButton />}
{isLoading && <LoadingSpinner />}
```

**詳細な使用例**: このアプリでの条件付きレンダリングの実装例（三項演算子、論理 AND 演算子など）については、[このアプリでの JSX の使用例](#このアプリでの-jsx-の使用例)セクションを参照してください。

**このアプリでの使用例**: [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModal`コンポーネント)

### リストのレンダリング

JSX では、`map()` を使って配列をリストとしてレンダリングできます。各要素には一意の `key` プロップが必要です。

```tsx
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

**このアプリでの使用例**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

```tsx
{products.map((product) => (
  <ProductTile key={product.id} product={product} />
))}
```

**key のルール**:

- 一意で安定した ID を使用する（データベースの ID など）
- 配列のインデックスは、リストの順序が変更されない場合のみ使用可能
- `key` は props としてコンポーネントに渡されない（`props.key` でアクセスできない）

**関連**: `map()` の JavaScript としての基本的な使い方は [JavaScript 基本構文ガイド - map](./javascript-basics-guide.md#map) を参照してください。

## このアプリでの JSX の使用例

### 基本的なコンポーネント

**Server Component の例**:

```tsx
export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="relative flex items-center gap-3 overflow-visible">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              priority
              className="h-auto w-auto max-h-20 lg:max-h-20"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
```

[`app/components/FixedHeader.tsx`](../../app/components/FixedHeader.tsx)

**Client Component の例**:

function ProductTile({ product, onClick }: ProductTileProps) {
return (
<button
onClick={onClick}
className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
aria-label={`${product.name}の詳細を見る`} >
{/_ 商品画像 _/}
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
</div>
) : (
<div className="aspect-square w-full bg-gray-100" />
)}

      {/* 商品名 */}
      <div className="flex h-[3em] items-center justify-center p-1.5">
        <h3 className="line-clamp-2 text-center text-[10px] font-medium">
          {product.name}
        </h3>
      </div>
    </button>

);
}

````

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)

### 条件付きレンダリング {#条件付きレンダリング-1}

#### 早期リターン

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGrid`コンポーネント)

```tsx
export default function ProductGrid({ category, products }: ProductGridProps) {
  // 商品がない場合は何も表示しない
  if (products.length === 0) {
    return null;
  }

  return <section className="mb-8 md:mb-16 lg:mb-12">{/* ... */}</section>;
}
```

#### 三項演算子

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (`ProductTile`コンポーネント)

```tsx
{
  product.imageUrl ? (
    <div className="relative aspect-square w-full">
      <Image src={product.imageUrl} alt={product.name} fill />
    </div>
  ) : (
    <div className="aspect-square w-full bg-gray-100" />
  )
}
```

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)

**論理 AND 演算子**:

{
product.description && (

<p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-gray-600">
{product.description}
</p>
);
}

{
(product.priceS || product.priceL) && (

<div className="flex items-baseline gap-3 border-t border-gray-200 pt-6">
{product.priceS && (
<span className="text-2xl font-medium">
S: {formatPrice(product.priceS)}
</span>
)}
{product.priceS && product.priceL && (
<span className="text-xl text-gray-300">/</span>
)}
{product.priceL && (
<span className="text-2xl font-medium">
L: {formatPrice(product.priceL)}
</span>
)}
</div>
);
}

[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)

### リストのレンダリング {#リストのレンダリング-1}

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

```tsx
<div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-6">
  {products.map((product) => (
    <ProductTile
      key={product.id}
      product={{
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
      }}
      onClick={() => handleTileClick(product)}
    />
  ))}
</div>
```

**重要なポイント**:

- `key` プロップは各要素に一意の値を指定する必要がある
- `key` には配列のインデックスではなく、データの一意の ID を使用する（このアプリでは `product.id` を使用）
- `key` は React が要素を識別し、効率的に更新するために使用される

### イベントハンドラー

**関連**: React でのイベントハンドリングの実装パターンについては、[React ガイド - イベントハンドリング](../frontend/react-guide.md#イベントハンドリング)を参照してください。

```tsx
<button onClick={onClick} className="group w-full overflow-hidden rounded-lg">
  {/* ... */}
</button>
```

[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)

**インライン関数**:

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

{
products.map((product) => (
<ProductTile
key={product.id}
product={product}
onClick={() => handleTileClick(product)}
/>
));
}

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)
**注意**: インライン関数は、`React.memo` でメモ化されたコンポーネントでは、毎回新しい関数が作成されるため、メモ化の効果が失われる可能性があります。このアプリでは、`useCallback` を使用してコールバック関数をメモ化しています。

### フラグメント

複数の要素を返す必要がある場合、フラグメント（`<>...</>` または `<React.Fragment>...</React.Fragment>`）を使用します。

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGrid`コンポーネントのレンダリング部分)

```tsx
return (
  <>
    <section className="mb-8 md:mb-16 lg:mb-12">
      {/* カテゴリータイトル */}
      <div className="mb-4 border-b border-gray-200 pb-2">
        <h2>{category.name}</h2>
      </div>

      {/* 商品グリッド */}
      <div className="grid grid-cols-3 gap-3">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} onClick={...} />
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
```

**フラグメントの利点**:

- 不要な DOM 要素を作成しない
- スタイリングの影響を受けない
- 複数の要素を返す必要がある場合に便利

### コメント

JSX では、`{/* ... */}` の形式でコメントを記述します。

return (
<>

<section className="mb-8 md:mb-16 lg:mb-12">
{/_ カテゴリータイトル _/}
<div className="mb-4 border-b border-gray-200 pb-2">
<h2>{category.name}</h2>
</div>

      {/* 商品グリッド（常に3列） */}
      <div className="grid grid-cols-3 gap-3">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} onClick={...} />
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

```



[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

```

## JSX のベストプラクティス

### 1. 読みやすさを重視

**推奨**: 複数の props がある場合は、1 行に 1 つの prop を記述。

```tsx
// 良い例: 1行に1つのprop
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>
```

**理由**:

- **可読性**: 各 prop が独立した行にあるため、読みやすく理解しやすい
- **差分の確認**: Git の差分で変更箇所が明確になり、コードレビューが容易
- **保守性**: prop の追加・削除・変更が容易で、保守が簡単

**避ける**: すべての props を 1 行に記述。

```tsx
// 悪い例: すべてのpropsを1行に記述
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>
```

**理由**:

- **可読性の低下**: 1 行が長くなり、読みにくくなる
- **差分の確認**: Git の差分で変更箇所が特定しにくくなる
- **保守性の低下**: prop の追加・削除・変更が困難になる

**推奨**: 早期リターンを使用して、条件が満たされない場合は早期に return。

```tsx
// 良い例: 早期リターン
function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return <div>{/* ... */}</div>;
}
```

**理由**:

- **可読性**: ネストが浅くなり、コードが読みやすくなる
- **パフォーマンス**: 不要な処理をスキップでき、パフォーマンスが向上する
- **保守性**: 条件分岐が明確になり、保守が容易になる

**避ける**: 深いネストでの条件分岐。

```tsx
// 悪い例: 深いネストでの条件分岐
function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.length > 0 ? (
        <div>
          {products.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

**理由**:

- **可読性の低下**: ネストが深くなり、コードが読みにくくなる
- **保守性の低下**: 条件分岐が複雑になり、保守が困難になる
- **パフォーマンス**: 不要な処理が実行される可能性がある

**推奨**: 一意で安定した ID を使用。

```tsx
// 良い例: 一意で安定したIDを使用
{
  products.map((product) => <ProductTile key={product.id} product={product} />);
}
```

**理由**:

- **効率的な更新**: React は `key` を使用して、どの要素が変更されたかを正確に判断する
- **状態の保持**: コンポーネントの状態が正しい要素に紐づき、順序が変更されても状態が保持される
- **パフォーマンス**: 不要な再レンダリングを防ぎ、パフォーマンスが向上する

**避ける**: 順序が変更される可能性がある場合にインデックスを使用。

```tsx
// 悪い例: 順序が変更される可能性がある場合にインデックスを使用
{
  products.map((product, index) => (
    <ProductTile key={index} product={product} />
  ));
}
```

**理由**:

- **状態の不整合**: 順序が変更されると、React が要素を正しく識別できず、コンポーネントの状態が間違った要素に紐づく
- **パフォーマンス**: React が要素の変更を正しく検出できず、不要な再レンダリングが発生する
- **バグの原因**: フォーム入力などの状態を持つコンポーネントで、値が間違った要素に表示される

### 4. アクセシビリティの考慮

**推奨**: 適切なセマンティック HTML と aria 属性を使用。

```tsx
// 良い例: 適切なセマンティックHTMLとaria属性
<button
  onClick={onClick}
  aria-label={`${product.name}の詳細を見る`}
  className="..."
>
  {/* ... */}
</button>
```

**理由**:

- **アクセシビリティ**: スクリーンリーダーなどの支援技術がコンテンツを正しく読み上げられる
- **ユーザー体験**: すべてのユーザーがアプリケーションを利用できる
- **セマンティクス**: HTML の意味が明確になり、検索エンジンでの評価が向上する
- **法律遵守**: アクセシビリティに関する法律や規制に準拠できる

**避ける**: セマンティック HTML や aria 属性の欠如。

```tsx
// 悪い例: セマンティックHTMLやaria属性の欠如
<div onClick={onClick} className="...">
  {/* ボタンの役割なのにdivを使用、aria-labelがない */}
  {/* ... */}
</div>
```

**理由**:

- **アクセシビリティの欠如**: スクリーンリーダーがコンテンツを正しく読み上げられない
- **ユーザー体験の悪化**: 支援技術を使用するユーザーがアプリケーションを利用できない
- **セマンティクスの欠如**: HTML の意味が不明確になり、検索エンジンでの評価が低下する
- **法律違反のリスク**: アクセシビリティに関する法律や規制に違反する可能性がある

**推奨**: TypeScript を使用して、props に型を付ける。`any` 型は避け、必ず `interface` で Props の型を定義すること。

詳細は [TypeScript ガイド - コンポーネントの Props の型定義](./typescript-guide.md#コンポーネントの-props-の型定義) を参照してください。

### 1. `class` ではなく `className` を使用

**間違い: HTML の `class` 属性を使用**

```tsx
// 悪い例: class を使用
<div class="container">Content</div>
```

**理由**:

- **構文エラー**: JSX では `class` は JavaScript の予約語のため使用できず、コンパイルエラーが発生する
- **JSX の規則違反**: JSX では `className` を使用する必要がある

**正しい: JSX の `className` を使用**

```tsx
// 良い例: className を使用
<div className="container">Content</div>
```

**理由**:

- **正しい構文**: JSX の規則に従い、`className` を使用することでエラーなく動作する
- **一貫性**: React の標準的な書き方に従い、コードの一貫性が保たれる

### 4. 条件付きレンダリングでの `false` の扱い

**注意**: `false` はレンダリングされませんが、`0` はレンダリングされます。

**間違い: 数値の `0` が表示される**

```tsx
// 悪い例: count が 0 の場合、0 が表示される
{
  count && <div>Count: {count}</div>;
}
// count が 0 の場合、0 が表示される
```

**理由**:

- **予期しない表示**: `count` が `0` の場合、`0` が画面に表示され、ユーザーに混乱を与える
- **論理的な誤り**: `0` は falsy だが、JSX ではレンダリングされるため、条件分岐の意図が正しく反映されない

**正しい: 明示的な条件チェック**

```tsx
// 良い例: 明示的な条件チェック
{
  count > 0 && <div>Count: {count}</div>;
}
// count が 0 の場合、何も表示されない
```

**理由**:

- **意図の明確化**: `count > 0` という明示的な条件により、コードの意図が明確になる
- **正しい表示**: `count` が `0` 以下の場合、何も表示されず、ユーザーに混乱を与えない
- **予測可能性**: 条件が明確で、動作が予測しやすくなる

### 5. null と undefined の扱い

JSX では、`null` と `undefined` は何も表示しませんが、エラーにはなりません。

**正しい: null と undefined の使用**

```tsx
<div>{null}</div>           {/* 何も表示されない */}
<div>{undefined}</div>      {/* 何も表示されない */}
<div>{null && <div>Content</div>}</div>  {/* 何も表示されない */}
```

**理由**:

- **エラーなし**: `null` と `undefined` は React の有効な子要素として扱われ、エラーが発生しない
- **条件付きレンダリング**: 条件が満たされない場合に何も表示しないことを明示できる
- **柔軟性**: コンポーネントの条件付きレンダリングで便利に使用できる

**正しい: コンポーネントから null を返す**

```tsx
// 良い例: コンポーネントから null を返すことで、何も表示しない
function ConditionalComponent({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null; // 何も表示しない
  }
  return <div>Content</div>;
}
```

**理由**:

- **早期リターン**: 条件が満たされない場合に早期に `null` を返すことで、コードが簡潔になる
- **パフォーマンス**: 不要な処理をスキップでき、パフォーマンスが向上する
- **可読性**: 条件分岐が明確になり、コードが読みやすくなる

**このアプリでの使用例**:

[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)

```tsx
if (!isOpen || !product) {
  return null; // モーダルを表示しない
}
```

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

```tsx
if (products.length === 0) {
  return null; // 商品がない場合は何も表示しない
}
```

**詳細**: `null` と `undefined` を含むレンダリング可能な値の詳細については、[基本的な構文 - JavaScript 式の埋め込み - レンダリング可能な値](#javascript-式の埋め込み)セクションを参照してください。

### 6. オブジェクトや関数の直接レンダリング

詳細については、[JavaScript 式の埋め込み - JSX 式の制限](#javascript-式の埋め込み)セクションを参照してください。

**間違い: オブジェクトを直接レンダリング**

```tsx
const user = { name: "John", age: 30 };
<div>{user}</div>; // エラー: Objects are not valid as a React child
```

**理由**:

- **実行時エラー**: オブジェクトは React の子要素として有効でないため、実行時エラーが発生する
- **型の不一致**: JSX はプリミティブ値や React 要素を期待しており、オブジェクトは直接レンダリングできない

**正しい: オブジェクトのプロパティをレンダリング**

```tsx
<div>{user.name}</div>
```

**理由**:

- **正しいレンダリング**: オブジェクトのプロパティ（文字列）をレンダリングすることで、エラーなく表示できる
- **型の一致**: 文字列は React の子要素として有効で、正しくレンダリングされる

**間違い: 関数を直接レンダリング**

```tsx
const handleClick = () => console.log("clicked");
<div>{handleClick}</div>; // エラー: Functions are not valid as a React child
```

**理由**:

- **実行時エラー**: 関数は React の子要素として有効でないため、実行時エラーが発生する
- **型の不一致**: JSX は関数を直接レンダリングできず、関数を呼び出すか、イベントハンドラーとして使用する必要がある

**正しい: イベントハンドラーとして使用**

```tsx
<button onClick={handleClick}>Click me</button>
```

**理由**:

- **正しい使用方法**: 関数をイベントハンドラーとして渡すことで、ユーザーの操作に応じて関数が実行される
- **パフォーマンス**: レンダリング時ではなく、イベント発生時のみ関数が実行される
- **意図の明確化**: イベントハンドラーとして使用することで、コードの意図が明確になる

## まとめ

JSX は React でユーザーインターフェースを記述するための構文拡張です。HTML に似た構文で JavaScript の式を埋め込めるため、コンポーネントベースの UI 開発に適しています。JSX と HTML の違い（`className`、自己閉じタグなど）を理解し、TypeScript と組み合わせることで、型安全な UI コンポーネントを記述できます。

## 参考リンク

- **[JavaScript 基本構文ガイド](./javascript-basics-guide.md)**: JavaScript の基本構文（分割代入、配列メソッド、コードスタイル）
- **[React ガイド](../frontend/react-guide.md)**: コンポーネントと状態管理
- **[TypeScript ガイド](./typescript-guide.md)**: 型システム（Props の型定義など）
- **[Next.js ガイド](../frontend/nextjs-guide.md)**: Next.js での JSX の使用方法
- **[React 公式ドキュメント - JSX](https://react.dev/learn/writing-markup-with-jsx)**: JSX の公式ドキュメント
