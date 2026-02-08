# React でよく使う JavaScript 基本構文ガイド

## このドキュメントの役割

このドキュメントは「**React でよく使う JavaScript の基本構文とテクニック**」を説明します。分割代入、スプレッド構文、配列メソッドなど、React 開発で頻繁に登場する JavaScript の構文を理解したいときに参照してください。

**関連ドキュメント**:

- [JSX ガイド](./jsx-guide.md): JSX の構文（条件付きレンダリング、リストのレンダリング）
- [React ガイド](./react-guide.md): コンポーネントと状態管理
- [TypeScript ガイド](./typescript-guide.md): 型システム

## 目次

- [概要](#概要)
- [JavaScript とは](#javascript-とは)
- [変数宣言（const / let）](#変数宣言const--let)
- [分割代入](#分割代入)
  - [オブジェクトの分割代入](#オブジェクトの分割代入)
  - [配列の分割代入](#配列の分割代入)
  - [デフォルト値付き分割代入](#デフォルト値付き分割代入)
  - [要素をスキップする分割代入](#要素をスキップする分割代入)
- [スプレッド構文とレスト構文](#スプレッド構文とレスト構文)
  - [スプレッド構文（配列）](#スプレッド構文配列)
  - [スプレッド構文（オブジェクト）](#スプレッド構文オブジェクト)
  - [レスト構文](#レスト構文)
- [アロー関数](#アロー関数)
- [配列メソッド](#配列メソッド)
  - [map](#map)
  - [filter](#filter)
  - [find](#find)
  - [includes（存在チェック）](#includes存在チェック)
  - [join（結合）](#join結合)
- [条件分岐の構文](#条件分岐の構文)
  - [三項演算子](#三項演算子)
  - [論理積演算子（&&）](#論理積演算子)
- [モダン JavaScript 構文](#モダン-javascript-構文)
  - [オプショナルチェイニング（?.）](#オプショナルチェイニング)
  - [Null 合体演算子（??）](#null-合体演算子)
  - [テンプレート文字列](#テンプレート文字列)
- [オブジェクトの操作](#オブジェクトの操作)
  - [Object.keys / Object.values / Object.entries](#objectkeys--objectvalues--objectentries)
- [コードスタイルと可読性](#コードスタイルと可読性)
  - [三項演算子の使い分け](#三項演算子の使い分け)
  - [関数呼び出しによるコードの整理](#関数呼び出しによるコードの整理)
  - [早期リターンパターン](#早期リターンパターン)
- [参考リンク](#参考リンク)

## 概要

React アプリケーションを開発する際、JSX やフックだけでなく、JavaScript 自体の構文やテクニックを多用します。このガイドでは、React 開発で特に頻出する JavaScript の基本構文を、実例とともに紹介します。

## JavaScript とは

JavaScript は、Web ブラウザやサーバー（Node.js）で動作するプログラミング言語です。Web ページにインタラクティブな機能を追加するために生まれましたが、現在ではフロントエンドからバックエンドまで幅広く使用されています。

**主な特徴**:

- **動的型付け**: 変数の型を事前に宣言する必要がない（TypeScript で補完）
- **関数がファーストクラス**: 関数を変数に代入したり、引数として渡せる
- **イベント駆動**: ユーザー操作やデータ取得に応じて処理を実行
- **豊富なエコシステム**: npm を通じて膨大なパッケージを利用可能

**TypeScript との関係**:

TypeScript は JavaScript に静的型付けを追加した言語です。TypeScript のコードはコンパイル時に JavaScript に変換されるため、このガイドで紹介する構文はすべて TypeScript でもそのまま使用できます。詳細は [TypeScript ガイド](./typescript-guide.md) を参照してください。

**このアプリでの位置付け**:

- **Next.js / React**: フレームワークとライブラリが JavaScript（TypeScript）で動作
- **ES6+（ES2015 以降）**: このガイドで紹介する構文の多くは ES6 以降に追加されたモダンな構文
- ブラウザ側・サーバー側の両方で同じ構文が使える

## 変数宣言（const / let）

JavaScript では `const` と `let` を使って変数を宣言します。

```typescript
// const: 再代入不可。基本はこれを使う
const name = "太郎";
const age = 25;
const items = ["りんご", "バナナ"]; // 配列の中身は変更可能

// let: 再代入が必要な場合のみ使用
let count = 0;
count = count + 1;
```

**使い分けの方針**:

- **`const`を基本にする**: 再代入しない変数はすべて `const`
- **`let`は最小限に**: ループカウンタや状態の一時変数など、再代入が必要な場合のみ
- **`var`は使わない**: スコープの挙動が直感的でないため、レガシーコードでのみ見かける

## 分割代入

オブジェクトや配列から値を取り出して、個別の変数に代入する構文です。

### オブジェクトの分割代入

```typescript
const user = { name: "田中", age: 25, email: "tanaka@example.com" };
const { name, age } = user;
console.log(name); // '田中'
console.log(age); // 25
```

**このアプリでの使用例**:

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (Props の受け取り)

```tsx
function ProductGrid({ category, products }: ProductGridProps) {
  // category と products を分割代入で受け取る
}
```

### 配列の分割代入

```typescript
// useState の戻り値の受け取りでよく使うパターン
const [state, setState] = ["初期値", function () {}];
console.log(state); // '初期値'
```

**このアプリでの使用例**:

[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (useState)

```typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### デフォルト値付き分割代入

関数の引数でデフォルト値を設定できます。

```typescript
function greet({ name = "ゲスト", age = 0 } = {}) {
  return `${name}さん (${age}歳) `;
}

console.log(greet()); // 'ゲストさん (0歳) '
console.log(greet({ name: "佐藤" })); // '佐藤さん (0歳) '
```

### 要素をスキップする分割代入

配列の特定の要素だけを取り出せます。

```typescript
const arr = ["a", "b", "c", "d", "e"];
const [first, , third, , fifth] = arr; // 2番目と4番目をスキップ
console.log(first); // 'a'
console.log(third); // 'c'
console.log(fifth); // 'e'
```

## スプレッド構文とレスト構文

### スプレッド構文（配列）

`...` を使って配列を展開します。元の配列を変更せずに新しい配列を作成できるため、React の状態更新で重要です。

```typescript
// 要素の追加
const items = ["りんご", "バナナ"];
const newItems = [...items, "オレンジ"];
console.log(newItems); // ['りんご', 'バナナ', 'オレンジ']

// 二つの配列を結合
const fruits = ["りんご", "バナナ"];
const vegetables = ["にんじん", "キャベツ"];
const foods = [...fruits, ...vegetables];
console.log(foods); // ['りんご', 'バナナ', 'にんじん', 'キャベツ']
```

### スプレッド構文（オブジェクト）

オブジェクトのプロパティを展開します。React の状態更新やプロパティのマージでよく使います。

```typescript
// プロパティの上書き
const user = { name: "太郎", age: 25 };
const updatedUser = { ...user, age: 26 };
console.log(updatedUser); // { name: '太郎', age: 26 }

// 二つのオブジェクトを結合
const basicInfo = { name: "花子", age: 28 };
const contact = { email: "hanako@example.com", phone: "090-1234-5678" };
const profile = { ...basicInfo, ...contact };
console.log(profile); // { name: '花子', age: 28, email: 'hanako@example.com', phone: '090-1234-5678' }
```

### レスト構文

`...` を使って残りの要素をまとめて受け取ります。特定のプロパティを除いて残りを渡す場合に便利です。

```typescript
// 特定の prop を除いて残りをまとめる
const { variant, ...otherProps } = {
  variant: "primary",
  onClick: () => {},
  disabled: false,
};
console.log(variant); // 'primary'
console.log(otherProps); // { onClick: () => {}, disabled: false }
```

## アロー関数

`=>` を使った関数の短縮記法です。React のイベントハンドラーやコールバックで多用します。

```typescript
const double = (x: number) => x * 2;
const add = (a: number, b: number) => a + b;
console.log(double(5)); // 10
console.log(add(3, 7)); // 10
```

**特徴**:

- **短縮記法**: `function` キーワードが不要
- **暗黙の return**: 1 行の式なら `{}` と `return` を省略可能
- **`this` の束縛**: 外側のスコープの `this` を引き継ぐ（React では特に重要）

## 配列メソッド

### map

配列の各要素を変換して新しい配列を返します。JSX ではリストのレンダリングに使用します。

```typescript
const todos = ["学習", "復習", "実践"];
const todoElements = todos.map((todo) => `<li>${todo}</li>`);
console.log(todoElements); // ['<li>学習</li>', '<li>復習</li>', '<li>実践</li>']
```

**JSX でのリストレンダリング**: `map` を使った JSX でのリスト表示については、[JSX ガイド - リストのレンダリング](./jsx-guide.md#リストのレンダリング) を参照してください。

### filter

条件に一致する要素だけを抽出して新しい配列を返します。

```typescript
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter((n) => n % 2 === 0);
console.log(evenNumbers); // [2, 4]
```

### find

条件に一致する最初の要素を返します。見つからない場合は `undefined` を返します。

```typescript
const users = [
  { id: 1, name: "太郎" },
  { id: 2, name: "花子" },
];
const foundUser = users.find((u) => u.id === 1);
console.log(foundUser); // { id: 1, name: '太郎' }
```

### includes（存在チェック）

配列に特定の要素が含まれているかを `true` / `false` で返します。

```typescript
const colors = ["red", "blue", "green"];
const isValidColor = colors.includes("blue"); // true
console.log(colors.includes("yellow")); // false
```

### join（結合）

配列の要素を指定した区切り文字で結合して文字列を返します。

```typescript
const fruits = ["りんご", "バナナ", "オレンジ"];
const fruitList = fruits.join(", "); // 'りんご, バナナ, オレンジ'

// map と join の組み合わせ
const html = fruits.map((fruit) => `<li>${fruit}</li>`).join("\n");
```

## 条件分岐の構文

### 三項演算子

`条件 ? 真の場合 : 偽の場合` の形式で、条件に応じた値を返します。

```typescript
const isLoggedIn = true;
const message = isLoggedIn ? "おかえりなさい" : "ログインしてください";
console.log(message); // 'おかえりなさい'
```

**JSX での条件付きレンダリング**: JSX 内での三項演算子の使い方は、[JSX ガイド - 条件付きレンダリング](./jsx-guide.md#条件付きレンダリング) を参照してください。

**三項演算子のネストを避けるパターン**: 複雑な条件分岐では関数に分離する方法を、[コードスタイルと可読性 - 三項演算子の使い分け](#三項演算子の使い分け) で説明しています。

### 論理積演算子（&&）

条件が真の場合のみ右側の値を評価します。if 文のみの条件分岐に最適です。

```typescript
const hasError = false;
const errorMessage = hasError && "エラーが発生しました";
console.log(errorMessage); // false
```

**JSX での使用例**: JSX 内での `&&` による条件付き表示は、[JSX ガイド - 条件付きレンダリング](./jsx-guide.md#条件付きレンダリング) を参照してください。

## モダン JavaScript 構文

### オプショナルチェイニング（?.）

ネストされたプロパティに安全にアクセスします。途中で `null` や `undefined` があれば、エラーにならず `undefined` を返します。

```typescript
const user = { profile: { address: { city: "東京" } } };
const city = user?.profile?.address?.city;
console.log(city); // '東京'

// プロパティが存在しない場合
const user2 = {};
const city2 = (user2 as any)?.profile?.address?.city;
console.log(city2); // undefined（エラーにならない）
```

### Null 合体演算子（??）

左側が `null` または `undefined` の場合に、右側のデフォルト値を返します。

```typescript
const userName = user?.name ?? "ゲスト";
console.log(userName); // 'ゲスト'（user?.name が undefined の場合）
```

**`||` との違い**: `||` は `0`、`""`、`false` もフォールシーの値として扱いますが、`??` は `null` と `undefined` のみを対象とします。

```typescript
const count = 0;
console.log(count || 10); // 10（0 がフォールシー）
console.log(count ?? 10); // 0（0 は null/undefined ではない）
```

### テンプレート文字列

バッククォート（`` ` ``）で囲み、`${式}` で変数や式を埋め込めます。

```typescript
const name = "太郎";
const age = 25;
const introduction = `こんにちは、${name}です。${age}歳です。`;
console.log(introduction); // 'こんにちは、太郎です。25歳です。'
```

## オブジェクトの操作

### Object.keys / Object.values / Object.entries

オブジェクトを配列として処理したい場合に使用します。

```typescript
const user = { name: "太郎", age: 25, city: "東京" };

// キーの配列
const keys = Object.keys(user);
console.log(keys); // ['name', 'age', 'city']

// 値の配列
const values = Object.values(user);
console.log(values); // ['太郎', 25, '東京']

// [キー, 値] ペアの配列
const entries = Object.entries(user);
console.log(entries); // [['name', '太郎'], ['age', 25], ['city', '東京']]
```

**使い分け**:

- `Object.keys()`: キーの一覧が必要な場合（バリデーション、フィルタリング等）
- `Object.values()`: 値だけを処理したい場合
- `Object.entries()`: キーと値の両方が必要な場合（`map` や `forEach` との組み合わせ）

## コードスタイルと可読性

コードの可読性と保守性を向上させるためのベストプラクティスです。以下のパターンを適切に使い分けることで、読みやすく保守しやすいコードを書くことができます。

### 三項演算子の使い分け

**原則**: 単純な三項演算子は推奨しますが、ネストされた三項演算子は避け、関数に分離します。

#### 単純な三項演算子（推奨）

**推奨**: 条件が 1 つで、結果が明確な場合に使用します。

```typescript
const priceS = body.priceS ? parseFloat(body.priceS) : null;
const status = isActive ? "active" : "inactive";
const imageUrl = body.imageUrl ? body.imageUrl : null;
```

#### ネストされた三項演算子（避ける）

**避ける**: 三項演算子がネストされている場合、可読性が低下します。

```typescript
// 悪い例: ネストされた三項演算子
const publishedAt =
  body.publishedAt !== undefined
    ? body.publishedAt
      ? new Date(body.publishedAt)
      : null
    : existingProduct.publishedAt;
```

#### 改善方法: 関数に分離

**推奨**: ネストされた三項演算子は関数に分離します。

```typescript
/**
 * 日付の値を解決する
 */
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  if (requestValue === undefined) {
    return existingValue;
  }
  if (requestValue === null) {
    return null;
  }
  return new Date(requestValue);
}

// 使用例
const publishedAt = resolveDateValue(
  body.publishedAt,
  existingProduct.publishedAt
);
```

**このアプリでの使用例**:

- [`lib/product-utils.ts`](../../lib/product-utils.ts) (`resolveDateValue`関数): ネストされた三項演算子を関数に分離した実装例
- [`app/api/products/[id]/put.ts`](../../app/api/products/[id]/put.ts): `resolveDateValue`関数を使用

### 関数呼び出しによるコードの整理

**原則**: 複雑なロジックや繰り返し使用される処理は関数に分離します。これにより、コードの可読性、再利用性、テスト容易性、保守性が向上します。

#### 複雑な条件分岐を関数に分離

```typescript
// 悪い例: 複雑な条件分岐がインラインに記述されている
const published = publishedAt || endedAt
  ? calculatePublishedStatus(publishedAt, endedAt)
  : body.published !== undefined
    ? body.published
    : true;
```

```typescript
// 良い例: 関数に分離
/**
 * 商品の公開状態を決定する
 */
export function determinePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null,
  manualPublished?: boolean,
  defaultPublished: boolean = true
): boolean {
  if (publishedAt || endedAt) {
    return calculatePublishedStatus(publishedAt, endedAt);
  }
  return manualPublished !== undefined ? manualPublished : defaultPublished;
}

// 使用例
const published = determinePublishedStatus(
  publishedAt,
  endedAt,
  body.published,
  true
);
```

**このアプリでの使用例**:

- [`lib/product-utils.ts`](../../lib/product-utils.ts) (`determinePublishedStatus`関数): 複雑な条件分岐を関数に分離した実装例
- [`app/api/products/route.ts`](../../app/api/products/route.ts): POST エンドポイントで使用
- [`app/api/products/[id]/put.ts`](../../app/api/products/[id]/put.ts): PUT エンドポイントで使用

### 早期リターンパターン

**原則**: 条件を満たした場合は早期に`return`し、ネストを避けます。

#### 早期リターンとは

関数内で条件を満たした場合に早期に`return`するパターンです。これにより、ネストが浅くなり、コードの可読性が向上します。

```typescript
// 良い例: 早期リターンを使用
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  if (requestValue === undefined) {
    return existingValue;
  }

  if (requestValue === null) {
    return null;
  }

  return new Date(requestValue);
}
```

```typescript
// 悪い例: 早期リターンを使わない（ネストが深くなる）
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  if (requestValue !== undefined) {
    if (requestValue !== null) {
      return new Date(requestValue);
    } else {
      return null;
    }
  } else {
    return existingValue;
  }
}
```

#### 早期リターンと関数呼び出しの組み合わせ

早期リターンパターンと関数呼び出しを組み合わせることで、コードの可読性と保守性をさらに向上させます。

```typescript
export function determinePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null,
  manualPublished?: boolean,
  defaultPublished: boolean = true
): boolean {
  // 早期リターン: 公開日・終了日が設定されている場合は自動判定を優先
  if (publishedAt || endedAt) {
    return calculatePublishedStatus(publishedAt, endedAt);
  }

  // 手動設定値が指定されている場合はそれを使用、未指定の場合はデフォルト値を使用
  return manualPublished !== undefined ? manualPublished : defaultPublished;
}
```

**このアプリでの使用例**:

- [`lib/product-utils.ts`](../../lib/product-utils.ts) (`resolveDateValue`関数): 早期リターンパターンを使用した実装例
- [`lib/product-utils.ts`](../../lib/product-utils.ts) (`determinePublishedStatus`関数): 早期リターンと関数呼び出しを組み合わせた実装例

## 参考リンク

- **[JSX ガイド](./jsx-guide.md)**: JSX の構文（条件付きレンダリング、リストのレンダリング）
- **[React ガイド](./react-guide.md)**: コンポーネントと状態管理
- **[TypeScript ガイド](./typescript-guide.md)**: 型システム
- **[MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript)**: JavaScript の包括的なリファレンス
