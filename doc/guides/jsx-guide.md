# JSX ガイド

## 目次

- [概要](#概要)
- [JSX とは](#jsx-とは)
- [JSX と HTML の違い](#jsx-と-html-の違い)
- [基本的な構文](#基本的な構文)
  - [要素の記述](#要素の記述)
  - [属性（Props）](#属性props)
  - [子要素](#子要素)
  - [children prop（子要素を受け取る）](#children-prop子要素を受け取る)
  - [JavaScript 式の埋め込み](#javascript-式の埋め込み)
  - [条件付きレンダリング](#条件付きレンダリング)
  - [リストのレンダリング](#リストのレンダリング)
- [このアプリでの JSX の使用例](#このアプリでの-jsx-の使用例)
  - [基本的なコンポーネント](#基本的なコンポーネント)
  - [条件付きレンダリング](#条件付きレンダリング-1)
  - [リストのレンダリング](#リストのレンダリング-1)
  - [イベントハンドラー](#イベントハンドラー)
  - [フラグメント](#フラグメント)
  - [コメント](#コメント)
- [JSX のベストプラクティス](#jsx-のベストプラクティス)
- [よくある間違いと対処法](#よくある間違いと対処法)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

JSX（JavaScript XML）は、React で UI を記述するための構文拡張です。HTML に似た構文で、JavaScript の式を埋め込むことができます。TypeScript と組み合わせることで、型安全な UI コンポーネントを記述できます。

このアプリケーションでは、JSX を使用してすべての React コンポーネントを実装しています。

**関連ドキュメント**: React の概念（Hooks、状態管理、パフォーマンス最適化など）について詳しく知りたい場合は、[React ガイド](./react-guide.md)を参照してください。このガイドでは、JSX の構文と書き方に焦点を当てています。

**JSX の主な特徴**:

- **HTML に似た構文**: HTML に慣れ親しんだ開発者にとって理解しやすい
- **JavaScript 式の埋め込み**: `{}` を使用して JavaScript の式を埋め込める
- **コンポーネントベース**: 再利用可能なコンポーネントを定義できる
- **型安全性**: TypeScript と組み合わせることで、コンパイル時にエラーを検出

## JSX とは

JSX は、JavaScript の構文拡張で、React 要素を記述するために使用されます。JSX は、ブラウザで実行される前に、通常の JavaScript 関数呼び出しに変換されます。

**JSX の変換例**:

```jsx
// 開発者が書くコード（JSX構文）
const element = <h1>Hello, World!</h1>;

// 自動変換後（React 19の新しいJSX変換）
// 注意: この変換はTypeScriptコンパイラが自動的に行います
// 開発者が直接このコードを書く必要はありません
import { jsx } from "react/jsx-runtime";
const element = jsx("h1", { children: "Hello, World!" });
```

**重要なポイント**:

- **開発者は JSX 構文（`<h1>`, `<div>`など）を直接書きます**
- **`jsx`関数を直接呼び出す必要はありません**（TypeScript コンパイラが自動変換）
- このアプリでは、TypeScript の設定（`tsconfig.json`）で `jsx: "react-jsx"` を指定しており、React 19 の新しい JSX 変換を使用しています

**このアプリでの実際の使用例**:

```tsx
// app/components/ProductGrid.tsx
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

上記のコードは、TypeScript コンパイラによって自動的に`jsx`関数呼び出しに変換されますが、開発者は JSX 構文のままコードを書きます。

**新しい JSX 変換の利点**:

- **自動インポート不要**: `import React from "react"` が不要
- **パフォーマンス向上**: 最適化されたランタイムを使用
- **バンドルサイズの削減**: 不要な React インポートを削減

## JSX と HTML の違い

JSX は HTML に似ていますが、いくつかの重要な違いがあります。HTML から JSX に移行する際に注意すべきポイントをまとめます。

### 1. 属性名の違い

#### `class` → `className`

HTML では `class` を使用しますが、JSX では JavaScript の予約語である `class` の代わりに `className` を使用します。

**HTML の例**: `<div class="container">Content</div>`

**JSX の例**:

```jsx
<div className="container">Content</div>
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<button
  className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
  aria-label={`${product.name}の詳細を見る`}
>
```

#### `for` → `htmlFor`

HTML では `for` を使用しますが、JSX では `htmlFor` を使用します。

**HTML の例**: `<label for="email">Email</label>` と `<input type="email" id="email">`

**JSX の例**:

```jsx
<label htmlFor="email">Email</label>
<input type="email" id="email" />
```

### 2. イベントハンドラーの違い

HTML では小文字の属性名（`onclick`）を使用し、文字列で JavaScript コードを記述しますが、JSX ではキャメルケース（`onClick`）を使用し、関数を直接渡します。

**HTML の例**: `<button onclick="handleClick()">Click me</button>`

**JSX の例**:

```jsx
<button onClick={handleClick}>Click me</button>
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<button
  onClick={onClick}
  className="group w-full overflow-hidden rounded-lg"
>
```

```tsx
// app/components/ProductModal.tsx
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
// JSX（自己閉じタグが必須）
<img src="image.jpg" alt="Image" />
<br />
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
/>
```

### 4. JavaScript 式の埋め込み

HTML では静的なテキストのみを記述できますが、JSX では `{}` を使用して JavaScript 式を埋め込むことができます。

**HTML の例**: `<div>Hello, World!</div>`（静的なテキストのみ）

**JSX の例**:

```jsx
// JavaScript 式を埋め込める
const name = "World";
<div>Hello, {name}!</div>
<div>計算結果: {1 + 2}</div>
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<h3 className="line-clamp-2 text-center">{product.name}</h3>
```

```tsx
// app/components/ProductGrid.tsx
<h2 className="text-center text-lg font-light">{category.name}</h2>
```

### 5. コメントの書き方

HTML では `<!-- -->` を使用しますが、JSX では `{/* */}` を使用します。

**HTML の例**: `<div><!-- これはコメントです -->Content</div>`

**JSX の例**:

```jsx
<div>
  {/* これはコメントです */}
  Content
</div>
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
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

**HTML の例**: `<input type="checkbox" checked disabled>`（属性を省略可能）

**JSX の例**:

```jsx
<input type="checkbox" checked={true} disabled={true} />
// または、true の場合は省略可能
<input type="checkbox" checked disabled />
```

### 7. スタイル属性

HTML では文字列でスタイルを指定しますが、JSX ではオブジェクト形式で指定できます（ただし、このアプリでは Tailwind CSS を使用しているため、直接的なスタイル属性の使用は限定的です）。

**HTML の例**: `<div style="color: red; font-size: 16px;">Text</div>`（文字列形式）

**JSX の例**:

```jsx
// オブジェクト形式
<div style={{ color: "red", fontSize: "16px" }}>Text</div>
```

**注意**: このアプリでは Tailwind CSS を使用しているため、`style` 属性の代わりに `className` を使用します。

### 8. 属性値の型

HTML では属性値は常に文字列ですが、JSX では数値、ブール値、オブジェクト、配列など、任意の JavaScript の値を渡すことができます。

**HTML の例**: `<div data-count="5" data-active="true">Content</div>`（すべて文字列）

**JSX の例**:

```jsx
// 型を保持
<div data-count={5} data-active={true}>
  Content
</div>
```

### 9. 予約語との衝突回避

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

```jsx
// 間違い
<div class="container" onclick="handleClick()">
  <!-- コメント -->
  <img src="image.jpg" alt="Image">
</div>
```

**正しい: JSX の書き方に変換**

```jsx
// 正しい
<div className="container" onClick={handleClick}>
  {/* コメント */}
  <img src="image.jpg" alt="Image" />
</div>
```

## 基本的な構文

### 要素の記述

JSX では、HTML と同様に要素を記述できます。

```jsx
// 基本的な要素
<div>Hello, World!</div>

// 自己閉じタグ
<img src="image.jpg" alt="Image" />
```

**このアプリでの例**:

```tsx
// app/components/Header.tsx
<header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
  <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
    {/* ... */}
  </div>
</header>
```

### 属性（Props）

JSX では、HTML の属性と同様に props を指定できます。ただし、いくつかの違いがあります：

1. **`class` ではなく `className`**: JavaScript の予約語である `class` の代わりに `className` を使用
2. **`for` ではなく `htmlFor`**: 同様に `for` の代わりに `htmlFor` を使用
3. **キャメルケース**: 属性名はキャメルケースで記述（例: `onClick`, `onChange`）

```jsx
// className を使用
<div className="container">Content</div>

// イベントハンドラー（キャメルケース）
<button onClick={handleClick}>Click me</button>

// ブール値の属性
<input type="checkbox" checked={isChecked} />
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<button
  onClick={onClick}
  className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
  aria-label={`${product.name}の詳細を見る`}
>
  {/* ... */}
</button>
```

### 子要素

JSX では、要素の中に他の要素やテキストを配置できます。

```jsx
<div>
  <h1>Title</h1>
  <p>Description</p>
</div>
```

**このアプリでの例**:

```tsx
// app/components/ProductTile.tsx
<div className="flex h-[3em] items-center justify-center p-1.5">
  <h3 className="line-clamp-2 text-center">{product.name}</h3>
</div>
```

### children prop（子要素を受け取る）

コンポーネントは、`children` prop を使用して子要素を受け取ることができます。これにより、コンポーネントをラッパーとして使用できます。

```jsx
// コンポーネント定義
function Container({ children }) {
  return <div className="container">{children}</div>;
}

// 使用例
<Container>
  <h1>Title</h1>
  <p>Description</p>
</Container>;
```

**このアプリでの例**:

```tsx
// app/layout.tsx
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

```tsx
// app/components/ErrorBoundary.tsx
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
```

**重要なポイント**:

- `children` は特別な prop で、コンポーネントの開始タグと終了タグの間の内容が自動的に渡されます
- `children` の型は `ReactNode` で、文字列、数値、要素、配列、`null`、`undefined` など、様々な型を受け取れます
- `children` は必須ではありません。コンポーネントが子要素を持たない場合、`children` は `undefined` になります

### JavaScript 式の埋め込み

JSX では、`{}` を使用して JavaScript の式を埋め込むことができます。

```jsx
const name = "World";
const element = <h1>Hello, {name}!</h1>;

// 式も使用可能
const element = <h1>1 + 1 = {1 + 1}</h1>;
```

**このアプリでの例**:

```tsx
// app/components/ProductGrid.tsx
<h2 className="text-center text-lg font-light">{category.name}</h2>
```

**JSX 式の制限**:

JSX では、以下のような値は直接レンダリングできません：

```jsx
// 間違い: オブジェクトを直接レンダリングできない
const user = { name: "John", age: 30 };
<div>{user}</div> // エラー: Objects are not valid as a React child

// 正しい: オブジェクトのプロパティをレンダリング
<div>{user.name}</div>

// 正しい: JSON.stringify を使用
<div>{JSON.stringify(user)}</div>

// 間違い: 関数を直接レンダリングできない
const handleClick = () => console.log("clicked");
<div>{handleClick}</div> // エラー: Functions are not valid as a React child

// 正しい: 関数を呼び出す（ただし、これは推奨されない）
<div>{handleClick()}</div>

// 正しい: イベントハンドラーとして使用
<button onClick={handleClick}>Click me</button>
```

**レンダリング可能な値**:

- 文字列
- 数値
- ブール値（`true`/`false` は何も表示しないが、エラーにはならない）
- `null`（何も表示しない）
- `undefined`（何も表示しない）
- React 要素
- React 要素の配列
- フラグメント

```jsx
// すべて有効
<div>{null}</div>           {/* 何も表示しない */}
<div>{undefined}</div>       {/* 何も表示しない */}
<div>{true}</div>            {/* 何も表示しない */}
<div>{false}</div>           {/* 何も表示しない */}
<div>{0}</div>               {/* 0 が表示される */}
<div>{""}</div>              {/* 何も表示しない */}
<div>{"Hello"}</div>         {/* Hello が表示される */}
<div>{123}</div>             {/* 123 が表示される */}
```

### 条件付きレンダリング

JSX では、条件に応じて要素を表示/非表示できます。

**注意**: このセクションでは JSX 構文での条件付きレンダリングに焦点を当てています。React での実装パターンについては、[React ガイド](./react-guide.md)も参照してください。

**方法 1: 三項演算子**

```jsx
{
  isLoggedIn ? <UserMenu /> : <LoginButton />;
}
```

**方法 2: 論理 AND 演算子（`&&`）**

```jsx
{
  isLoading && <LoadingSpinner />;
}
```

**方法 3: 早期リターン**

```jsx
if (!isOpen) {
  return null;
}
```

**このアプリでの例**:

```tsx
// app/components/ProductModal.tsx
if (!isOpen || !product) {
  return null;
}

// app/components/ProductTile.tsx
{
  product.imageUrl ? (
    <div className="relative aspect-square w-full">
      <Image src={product.imageUrl} alt={product.name} fill />
    </div>
  ) : (
    <div className="aspect-square w-full bg-gray-100" />
  );
}
```

### リストのレンダリング

JSX では、配列をマップしてリストをレンダリングできます。各要素には `key` プロップが必要です。

**注意**: このセクションでは JSX 構文でのリストのレンダリングに焦点を当てています。React での実装パターンについては、[React ガイド](./react-guide.md)も参照してください。

```jsx
const items = ["Apple", "Banana", "Orange"];

<ul>
  {items.map((item, index) => (
    <li key={index}>{item}</li>
  ))}
</ul>;
```

**このアプリでの例**:

```tsx
// app/components/ProductGrid.tsx
<div className="grid grid-cols-3 gap-3">
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

**空配列のレンダリング**:

空配列は何も表示しませんが、エラーにはなりません。

```jsx
const emptyProducts = [];

// 何も表示されない（エラーにはならない）
<div>
  {emptyProducts.map((product) => (
    <ProductTile key={product.id} product={product} />
  ))}
</div>;

// 空配列の場合にメッセージを表示する
{
  emptyProducts.length === 0 ? (
    <p>商品がありません</p>
  ) : (
    emptyProducts.map((product) => (
      <ProductTile key={product.id} product={product} />
    ))
  );
}
```

**key prop の重要性**:

`key` prop は、React が要素を識別し、効率的に更新するために使用されます。

```jsx
// 良い例: 一意で安定した ID を使用
{
  products.map((product) => <ProductTile key={product.id} product={product} />);
}

// 注意: インデックスは、リストの順序が変更されない場合のみ使用可能
{
  products.map((product, index) => (
    <ProductTile key={index} product={product} />
  ));
}

// 悪い例: 順序が変更される可能性がある場合にインデックスを使用
// ドラッグ&ドロップで順序を変更できる場合など
```

**key が必要な理由**:

1. **効率的な更新**: React は `key` を使用して、どの要素が変更されたかを判断します
2. **状態の保持**: コンポーネントの状態が正しく保持されます
3. **パフォーマンス**: 不要な再レンダリングを防ぎます

**key のベストプラクティス**:

- 一意で安定した ID を使用する（データベースの ID、UUID など）
- 配列のインデックスは、リストの順序が変更されない場合のみ使用する
- `key` は配列の要素にのみ必要で、通常の要素には不要
- `key` は props としてコンポーネントに渡されない（`props.key` でアクセスできない）

## このアプリでの JSX の使用例

### 基本的なコンポーネント

**Server Component の例**:

```tsx
// app/components/Header.tsx
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

**Client Component の例**:

```tsx
// app/components/ProductTile.tsx
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
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
```

### 条件付きレンダリング

**早期リターン**:

```tsx
// app/components/ProductGrid.tsx
export default function ProductGrid({ category, products }: ProductGridProps) {
  // 商品がない場合は何も表示しない
  if (products.length === 0) {
    return null;
  }

  return <section className="mb-8 md:mb-16 lg:mb-12">{/* ... */}</section>;
}
```

**三項演算子**:

```tsx
// app/components/ProductTile.tsx
{
  product.imageUrl ? (
    <div className="relative aspect-square w-full">
      <Image src={product.imageUrl} alt={product.name} fill />
    </div>
  ) : (
    <div className="aspect-square w-full bg-gray-100" />
  );
}
```

**論理 AND 演算子**:

```tsx
// app/components/ProductModal.tsx
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
```

### リストのレンダリング

```tsx
// app/components/ProductGrid.tsx
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

**関連**: React でのイベントハンドリングの実装パターンについては、[React ガイド - イベントハンドリング](./react-guide.md#イベントハンドリング)を参照してください。

```tsx
// app/components/ProductTile.tsx
<button onClick={onClick} className="group w-full overflow-hidden rounded-lg">
  {/* ... */}
</button>
```

**インライン関数**:

```tsx
// app/components/ProductGrid.tsx
{
  products.map((product) => (
    <ProductTile
      key={product.id}
      product={product}
      onClick={() => handleTileClick(product)}
    />
  ));
}
```

**注意**: インライン関数は、`React.memo` でメモ化されたコンポーネントでは、毎回新しい関数が作成されるため、メモ化の効果が失われる可能性があります。このアプリでは、`useCallback` を使用してコールバック関数をメモ化しています。

### フラグメント

複数の要素を返す必要がある場合、フラグメント（`<>...</>` または `<React.Fragment>...</React.Fragment>`）を使用します。

```tsx
// app/components/ProductGrid.tsx
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

```tsx
// app/components/ProductGrid.tsx
return (
  <>
    <section className="mb-8 md:mb-16 lg:mb-12">
      {/* カテゴリータイトル */}
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

## JSX のベストプラクティス

### 1. 読みやすさを重視

**推奨**: 複数の props がある場合は、1 行に 1 つの prop を記述。

```tsx
// 良い例
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>
```

**避ける**: 1 行にすべての props を記述。

```tsx
// 悪い例
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>
```

### 2. 条件付きレンダリングの適切な使用

**推奨**: 早期リターンを使用して、条件が満たされない場合は早期に return。

```tsx
// 良い例
if (products.length === 0) {
  return null;
}

return <div>{/* ... */}</div>;
```

**推奨**: 複雑な条件の場合は、変数に格納してから使用。

```tsx
// 良い例
const hasImage = product.imageUrl !== null;
const hasPrice = product.priceS || product.priceL;

return (
  <div>
    {hasImage && <Image src={product.imageUrl} alt={product.name} />}
    {hasPrice && <PriceDisplay product={product} />}
  </div>
);
```

### 3. キーの適切な使用

**推奨**: 一意で安定した ID を使用。

```tsx
// 良い例
{
  products.map((product) => <ProductTile key={product.id} product={product} />);
}
```

**避ける**: 配列のインデックスを key として使用（順序が変更される可能性がある場合）。

```tsx
// 悪い例（順序が変更される可能性がある場合）
{
  products.map((product, index) => (
    <ProductTile key={index} product={product} />
  ));
}
```

### 4. アクセシビリティの考慮

**推奨**: 適切なセマンティック HTML と aria 属性を使用。

```tsx
// 良い例
<button
  onClick={onClick}
  aria-label={`${product.name}の詳細を見る`}
  className="..."
>
  {/* ... */}
</button>
```

### 5. 型安全性の確保

**推奨**: TypeScript を使用して、props に型を付ける。

```tsx
// 良い例
interface ProductTileProps {
  product: ProductTileType;
  onClick: () => void;
}

function ProductTile({ product, onClick }: ProductTileProps) {
  return <button onClick={onClick}>{product.name}</button>;
}
```

## よくある間違いと対処法

### 1. `class` ではなく `className` を使用

**間違い**:

```tsx
<div class="container">Content</div>
```

**正しい**:

```tsx
<div className="container">Content</div>
```

### 2. 自己閉じタグの使用

**間違い**:

```tsx
<img src="image.jpg" alt="Image"></img>
```

**正しい**:

```tsx
<img src="image.jpg" alt="Image" />
```

### 3. JavaScript 式の埋め込み

**間違い**:

```tsx
<div>Hello, name!</div>  {/* name が文字列として表示される */}
```

**正しい**:

```tsx
<div>Hello, {name}!</div>  {/* name の値が表示される */}
```

### 4. 条件付きレンダリングでの `false` の扱い

**注意**: `false` はレンダリングされませんが、`0` はレンダリングされます。

```tsx
// false は何も表示しない
{
  false && <div>Content</div>;
}
{
  /* 何も表示されない */
}

// 0 は表示される
{
  count && <div>Count: {count}</div>;
}
{
  /* count が 0 の場合、0 が表示される */
}

// 正しい方法
{
  count > 0 && <div>Count: {count}</div>;
}
{
  /* count が 0 の場合、何も表示されない */
}
```

### 5. null と undefined の扱い

JSX では、`null` と `undefined` は何も表示しませんが、エラーにはなりません。

```tsx
// すべて有効で、何も表示されない
<div>{null}</div>
<div>{undefined}</div>
<div>{null && <div>Content</div>}</div>

// コンポーネントから null を返すことで、何も表示しない
function ConditionalComponent({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null; // 何も表示しない
  }
  return <div>Content</div>;
}
```

**このアプリでの例**:

```tsx
// app/components/ProductModal.tsx
if (!isOpen || !product) {
  return null; // モーダルを表示しない
}

// app/components/ProductGrid.tsx
if (products.length === 0) {
  return null; // 商品がない場合は何も表示しない
}
```

### 6. オブジェクトや関数の直接レンダリング

**間違い**: オブジェクトや関数を直接レンダリングしようとするとエラーになります。

```tsx
// 間違い: オブジェクトを直接レンダリング
const user = { name: "John", age: 30 };
<div>{user}</div> // エラー: Objects are not valid as a React child

// 正しい: オブジェクトのプロパティをレンダリング
<div>{user.name}</div>

// 間違い: 関数を直接レンダリング
const handleClick = () => console.log("clicked");
<div>{handleClick}</div> // エラー: Functions are not valid as a React child

// 正しい: イベントハンドラーとして使用
<button onClick={handleClick}>Click me</button>
```

### 7. 配列のレンダリングでの key の欠如

**間違い**:

```tsx
{products.map((product) => (
  <ProductTile product={product} />  {/* key がない */}
))}
```

**正しい**:

```tsx
{
  products.map((product) => <ProductTile key={product.id} product={product} />);
}
```

## まとめ

このアプリケーションでは、JSX を使用して以下のように実装しています：

1. **基本的な構文**: HTML に似た構文で、`className`、`onClick` などの属性を使用
2. **条件付きレンダリング**: 早期リターン、三項演算子、論理 AND 演算子を適切に使い分け
3. **リストのレンダリング**: `map` を使用してリストをレンダリングし、`key` プロップを適切に設定
4. **イベントハンドラー**: `onClick` などのイベントハンドラーを使用してインタラクティブな UI を実装
5. **フラグメント**: 複数の要素を返す場合に `<>...</>` を使用
6. **コメント**: `{/* ... */}` の形式でコメントを記述
7. **型安全性**: TypeScript と組み合わせて、型安全な JSX を記述

JSX は、React で UI を記述するための強力な構文です。適切に使用することで、読みやすく保守しやすいコードを記述できます。

## 参考リンク

- **[React ガイド](./react-guide.md)**: React の包括的なガイド
- **[TypeScript ガイド](./typescript-guide.md)**: TypeScript での JSX の使用方法
- **[React 公式ドキュメント - JSX](https://react.dev/learn/writing-markup-with-jsx)**: JSX の公式ドキュメント
- **[React 公式ドキュメント - 条件付きレンダリング](https://react.dev/learn/conditional-rendering)**: 条件付きレンダリングの公式ドキュメント
- **[React 公式ドキュメント - リストと key](https://react.dev/learn/rendering-lists)**: リストのレンダリングの公式ドキュメント
