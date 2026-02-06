# Claude Code 設定

## 言語設定

- すべての出力は日本語で行うこと
- **思考プロセス（Thinking）も日本語で行うこと**（VS Code上でユーザーに表示されるため）
- コミットメッセージ、コードコメント、説明文はすべて日本語で記述すること

## 基本的なルール

- **import文**: 未使用のインポートは削除すること
- **ダミーのコード**: 動作しない仮置きの関数や変数は含めないこと
- **修正範囲**: 依頼された部分以外は原則として変更しないが、関連するのなら提案すること

## コメント規則

**基本方針: コードだけで意図が明確に伝わる場合、コメントは不要**

コメントを記述するのは以下の場合のみ:

### コメントが必要な場合

1. **初心者にはわかりにくい実装**
   - CSSの特殊な挙動（`position:fixed`の副作用など）
   - ライブラリ特有の使い方
   - 複雑なアルゴリズムや処理フロー

   ```typescript
   // position:fixed のヘッダーに対応するスペーサー
   // fixedは通常フローから外れるため、このスペーサーがないと
   // 下のコンテンツがヘッダーの裏に隠れてしまう
   <div style={{ height: "var(--header-height)" }} />
   ```

2. **このアプリ特有の設計判断**
   - なぜその実装を選んだのか
   - ビジネスロジック上の判断理由
   - トレードオフの説明

   ```typescript
   // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
   // ユーザーには通知せず、運用者のみログで確認
   ```

### コメントが不要な場合

- コンポーネント名や関数名から役割が明確な場合
- 自明なコード（`<Header />`、`<Footer />`など）
- 標準的なReact/Next.jsのパターン
- Tailwind CSSの基本的な使い方

### フォーマット

- すべてのコメントは**日本語**で記述すること
- **簡潔に**記述すること（長い説明が必要ならコードを改善）
- ファイルの先頭には簡潔な説明のみ（冗長な箇条書きは不要）

## 設計原則

- **単一責任**: 機能単位でコードを分割すること
- **YAGNI**: 現時点で必要な機能のみ実装すること
- **KISS**: 最もシンプルな解決策を選ぶこと
- **DRY**: 3箇所目で共通化を検討。似ているだけのロジックは無理に共通化しない
- **モバイルファースト**: スマートフォン向けのデザインを基本とし、大きな画面へ拡張すること

## 型とコード品質

- 関数の引数と返り値には型を付けること
- リントエラーを解消すること
- ハードコードとマジックナンバーを避け、定数として一元管理すること

## Prisma

### データベース操作の基本

- **すべての操作は`safePrismaOperation`でラップすること**
  - エラーハンドリングとログ記録を統一
  - データベースエラーを適切な形式に変換

  ```typescript
  const products = await safePrismaOperation(
    () => prisma.product.findMany({ include: { category: true } }),
    'GET /api/products'
  );
  ```

### トランザクション

- **複数の更新が一貫性を持つ必要がある場合、トランザクションを使用すること**
- **トランザクション内の操作は最小限に抑えること**（パフォーマンス考慮）

  ```typescript
  await safePrismaOperation(async () => {
    await prisma.$transaction([
      prisma.product.update({ where: { id: 1 }, data: { displayOrder: 1 } }),
      prisma.product.update({ where: { id: 2 }, data: { displayOrder: 2 } }),
    ]);
  }, 'reorder products');
  ```

### N+1問題の回避

- **関連データは`include`で事前に取得すること**
- **ループ内でデータベースクエリを実行しないこと**

  ```typescript
  // ✅ Good: includeで1回のクエリで取得
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  // ❌ Bad: ループ内でクエリを実行
  const products = await prisma.product.findMany();
  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { id: product.categoryId } });
  }
  ```

## React / Next.js

> 参考: [Vercel React Best Practices](https://vercel.com/blog/introducing-react-best-practices)

### パフォーマンス

- **独立した非同期操作は`Promise.all()`で並列実行すること**
- **重いコンポーネントは`next/dynamic`で動的インポートすること**
- **派生状態はレンダリング中に計算すること**（useState + useEffectで同期しない）
- **単純な式を`useMemo`でラップしないこと**

### Server Components

- **デフォルトで Server Components を使用すること**
- **Server Actionsでも認証を検証すること**
- **RSC境界ではクライアントが必要なフィールドのみ渡すこと**

### Server Actions vs API Routes

#### API Routesを使用する場合

- **外部クライアントからのアクセスが必要な場合**（モバイルアプリ、Webhook等）
- **RESTful APIとして公開する場合**
- **詳細なHTTPステータスコードやヘッダー制御が必要な場合**
- **キャッシュ制御（Cache-Control）が必要な場合**

#### Server Actionsを使用する場合

- **フォーム送信など、Next.jsアプリ内部でのみ使用する場合**
- **クライアントコンポーネントから直接呼び出す場合**
- **プログレッシブエンハンスメント（JavaScript無効時の対応）が必要な場合**

#### 判断基準

現在のプロジェクトでは**API Routesを統一して使用**しています。新機能を追加する際は以下を検討してください：

- API Routesの既存の統一されたエラーハンドリング（`withErrorHandling`）を活用できる
- 将来的に外部アクセスが必要になる可能性がある場合はAPI Routesを選択
- 純粋にフォーム処理のみで外部公開の予定がなければServer Actionsも検討可能

### コンポーネント設計

- **単一責任**: 各コンポーネントは1つの責務を持つこと
- **状態のリフトアップ**: 共有状態は親コンポーネントで管理
- **カスタムフック**: `use`プレフィックス（例: `useAuth`）
- **イベントハンドラー**: `handle`プレフィックス（例: `handleSubmit`）

### エラーハンドリング

- **非同期処理には必ずtry-catchを実装すること**
- **エラーメッセージはユーザーにとって分かりやすく**
- **API Routesではエラーハンドリングを統一すること**

### クライアントサイドAPI呼び出し

- **`fetchJson`（`lib/client-fetch.ts`）を使用すること**
  - レスポンスの`ok`チェックとJSONパースを統一
  - エラー時はAPIレスポンスの`error`フィールドからメッセージを取得

  ```typescript
  import { fetchJson } from "@/lib/client-fetch";

  const data = await fetchJson<{ products: Product[] }>("/api/products");
  ```

### ユーザー通知

- **`alert()`は使用禁止。`sonner`のtoastを使用すること**

  ```typescript
  import { toast } from "sonner";

  toast.success("商品を削除しました");
  toast.error(getUserFriendlyMessageJa(error));
  ```

### セキュリティ

- **ユーザー入力はサニタイズすること**
- **`dangerouslySetInnerHTML`は原則使用禁止**
- **環境変数の`NEXT_PUBLIC_`プレフィックスの有無を意識すること**

## Tailwind CSS

### Tailwind CSS v4の特徴

- **CSS-based設定**: `@import "tailwindcss"`でインポート
- **`@theme inline`ブロック**: CSS変数からTailwindテーマへマッピング
- **設定ファイル不要**: `tailwind.config.js`は使用しない

### 基本ルール

- **ユーティリティクラスを直接使用すること**
- **動的クラス名（`bg-${color}-500`）を避けること**
- **モバイルファースト**: `sm:`, `md:`, `lg:` で拡張
- **カスタムスタイルはCSS変数で管理**: `globals.css`の`:root`で定義し、`@theme inline`でマッピング

## アクセシビリティ

- **セマンティックHTML**: 適切なタグ（`<header>`, `<main>`, `<nav>`等）を使用すること
- **aria属性**: アイコンボタンには`aria-label`を設定すること

## 画像

- **`next/image`を使用すること**: 自動最適化、遅延読み込み、レスポンシブ対応

## 品質チェックリスト

### コード品質

- [ ] この機能は**今**必要か？（YAGNI）
- [ ] もっとシンプルな方法はないか？（KISS）
- [ ] 独立した非同期処理は並列化しているか？
- [ ] エラーハンドリングは実装されているか？

### コメント品質

- [ ] 不要なコメントは削除されているか？（自明なコードにコメントは不要）
- [ ] 初心者にわかりにくい箇所に簡潔な説明があるか？
- [ ] アプリ特有の設計判断に理由が記述されているか？
- [ ] コメントは簡潔で、日本語で記述されているか？
