# Prisma → Drizzle 移行計画

## 概要

このドキュメントは、Prisma ORM から Drizzle ORM への移行計画を記載しています。
Edge Runtime 対応のため、Vercel Edge Functions で動作する Drizzle ORM への移行を行います。

## 移行の目的

- **Edge Runtime 対応**: Vercel Edge Functions で動作するようにする
- **パフォーマンス向上**: Edge Runtime でのコールドスタート時間の短縮
- **軽量化**: Drizzle ORM は Prisma よりも軽量

## 移行の流れ

### Phase 1: 現状のドキュメント化 ✅

1. Prisma 使用状況の記録

   - スキーマ定義の記録
   - 各 API ルートでの使用パターンの記録
   - 型定義の使用箇所の記録
   - マイグレーション履歴の記録

2. 移行仕様書の作成
   - Prisma → Drizzle のクエリマッピング
   - 型定義の対応関係
   - マイグレーションの移行方法

**成果物**:

- `prisma-current-state.md` - 現状の Prisma 使用状況
- `prisma-to-drizzle-mapping.md` - 移行マッピング

### Phase 2: Drizzle のセットアップ

1. Drizzle のインストール

   ```bash
   npm install drizzle-orm drizzle-kit
   npm install --save-dev @types/node
   ```

2. Drizzle 設定ファイルの作成

   - `drizzle.config.ts` の作成
   - スキーマ定義ファイルの作成

3. マイグレーションの準備
   - **重要**: 既存のデータベーススキーマは変更しません
   - Drizzle スキーマ定義を作成（既存の Prisma スキーマを Drizzle 形式に変換）
   - 既存の Prisma マイグレーションは既に適用済みのため、新しいマイグレーションは作成しません
   - Drizzle スキーマは現在のデータベースの状態を正確に反映するだけです

**成果物**:

- `drizzle.config.ts`
- `lib/db/schema.ts`
- `lib/db/index.ts` (Drizzle クライアント)

### Phase 3: 段階的な移行

#### 3.1 最初の API ルートの移行（テスト）

**注意**: `/api/products/upload` は Prisma 未使用のため、ソースコードの変更は不要です。

**最初の移行対象**: `/api/categories` (シンプルな GET のみ)

**作業内容**:

1. Drizzle クエリに書き換え
2. 動作確認
3. テスト実行

#### 3.2 残りの API ルートの移行

順番:

1. `/api/categories` - シンプルな GET
2. `/api/products` (GET) - findMany with include
3. `/api/products` (POST) - create with include
4. `/api/products/[id]` (GET) - findUnique with include
5. `/api/products/[id]` (PUT) - update with include
6. `/api/products/[id]` (DELETE) - delete
7. `/api/products/reorder` - transaction

#### 3.3 サーバーコンポーネントの移行

**対象**:

- `app/dashboard/page.tsx`
- `app/page.tsx` (ホームページ)

**作業内容**:

1. Prisma クエリを Drizzle クエリに書き換え
2. 型定義の更新
3. 動作確認

**注意**: `app/page.tsx`では`orderBy`に`nulls: "last"`オプションを使用しているため、Drizzle の`ascNullsLast`を使用する必要があります。

### Phase 4: 完全移行後のクリーンアップ

すべての移行が完了し、動作確認が取れたら：

#### 4.1 Prisma 関連ファイルの削除

削除対象:

- `lib/prisma.ts`
- `prisma/` ディレクトリ全体
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `prisma/migrations/`
- `prisma.config.ts`

#### 4.2 package.json の更新

削除する依存関係:

- `@prisma/client`
- `prisma`
- `@prisma/adapter-neon`
- `ws` (Prisma 専用の場合)

#### 4.3 スクリプトの更新

`package.json`のスクリプトを更新:

```json
{
  "scripts": {
    "build": "next build", // prisma generate を削除
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx lib/db/seed.ts"
  }
}
```

#### 4.4 ドキュメントの更新

1. **Prisma 関連ドキュメントの削除**

   - `doc/guides/prisma-guide.md` を削除
   - `doc/setup-prisma-blob.md` を削除

2. **Drizzle ガイドの作成**

   - `doc/guides/drizzle-guide.md` を新規作成
   - Prisma ガイドの構造を参考に、Drizzle の使用方法を記載
   - このアプリでの実際の使用例を含める

   **Drizzle ガイドの構成（予定）**:

   - 概要
   - Drizzle の設定（`drizzle.config.ts`）
   - データベースへの接続（Edge Runtime 対応）
   - ORM としての機能
     - データベーススキーマ定義
     - リレーション（関連）
     - マイグレーション
     - 型生成
     - Drizzle Studio
     - シードデータ
   - Drizzle 関数の説明と使用例
     - `findMany` (リレーションクエリ)
     - `findFirst` (ユニークキーで取得)
     - `insert` (作成)
     - `update` (更新)
     - `delete` (削除)
     - `transaction` (トランザクション)
   - クエリオプション
     - `where` (条件指定)
     - `orderBy` (ソート、nulls オプション含む)
     - `with` (リレーション取得)
     - N+1 問題の詳細解説
   - エラーハンドリング
   - 型安全性
   - Edge Runtime での使用
   - Drizzle のベストプラクティス
   - まとめ
   - 参考リンク

3. **Drizzle & Blob セットアップガイドの作成**

   - `doc/setup-drizzle-blob.md` を新規作成
   - `setup-prisma-blob.md` の構造を参考に、Drizzle と Blob Storage のセットアップ方法を記載
   - このアプリでの実際の使用例を含める

   **Drizzle & Blob セットアップガイドの構成（予定）**:

   - 概要
   - インストール済みパッケージ
   - 環境変数
   - Drizzle の使用方法
     - Drizzle Client のインポート
     - スキーマの定義
     - マイグレーション
     - Drizzle Client の生成
     - トランザクション
     - リレーション
   - Blob Storage の使用方法（既存の内容を維持）
   - API Routes での使用例
     - Drizzle を使用する API Route（ベストプラクティス）
     - Blob Storage を使用する API Route（ベストプラクティス）
     - Drizzle と Blob Storage を組み合わせた例
   - Drizzle Studio
   - ベストプラクティス
     - Drizzle
     - Blob Storage
   - トラブルシューティング
     - Drizzle 関連
     - Blob Storage 関連
   - 参考リンク

4. **各ドキュメントの Prisma 関連記述を Drizzle に置き換え**
   - `doc/getting-started.md`
   - `doc/development-guide.md`
   - `doc/architecture.md`
   - `doc/tech-stack.md`
   - `doc/project-structure.md`
   - `doc/guides/app-router-guide.md`
   - `doc/guides/dashboard-guide.md`
   - `doc/guides/frontend-guide.md`
   - `doc/guides/utilities-guide.md`
   - `doc/guides/typescript-guide.md`
   - `doc/deployment.md`
   - `README.md`

## 移行チェックリスト

### Phase 1: ドキュメント化 ✅

- [x] 移行計画の作成
- [x] Prisma 使用状況の記録 (`prisma-current-state.md`)
- [x] Prisma → Drizzle マッピングの作成 (`prisma-to-drizzle-mapping.md`)

### Phase 2: Drizzle セットアップ ✅

- [x] Drizzle のインストール（既にインストール済み）
- [x] Drizzle 設定ファイルの作成 (`drizzle.config.ts`)
- [x] スキーマ定義の作成 (`lib/db/schema.ts`)
- [x] Drizzle クライアントの作成 (`lib/db/index.ts`)

### Phase 3: 段階的移行 ✅

- [x] `/api/categories` の移行
- [x] `/api/products` (GET) の移行
- [x] `/api/products` (POST) の移行
- [x] `/api/products/[id]` (GET) の移行
- [x] `/api/products/[id]` (PUT) の移行
- [x] `/api/products/[id]` (DELETE) の移行
- [x] `/api/products/reorder` の移行
- [x] `app/dashboard/page.tsx` の移行
- [ ] `app/page.tsx` の移行

### Phase 4: クリーンアップ

- [ ] Prisma 関連ファイルの削除
- [ ] package.json の更新
- [ ] スクリプトの更新
- [ ] ドキュメントの更新
  - [ ] `doc/guides/prisma-guide.md` の削除
  - [ ] `doc/setup-prisma-blob.md` の削除
  - [ ] `doc/guides/drizzle-guide.md` の作成
  - [ ] `doc/setup-drizzle-blob.md` の作成
  - [ ] 各ドキュメントの Prisma 関連記述を Drizzle に置き換え

## データベースデータへの影響

### 重要なポイント

**既存のデータベースデータは影響を受けません。**

1. **ORM の変更のみ**: Prisma から Drizzle への移行は、ORM（Object-Relational Mapping）ツールの変更であり、データベーススキーマ自体は変更しません。

2. **データの保持**:

   - 既存のテーブル構造はそのまま維持されます
   - 既存のデータはすべて保持されます
   - データベースへの接続文字列も同じものを使用します

3. **スキーマの一致**:

   - Drizzle のスキーマ定義が Prisma のスキーマと一致している必要があります
   - Phase 2 で Drizzle スキーマを作成する際、既存の Prisma スキーマを正確に反映します

4. **マイグレーションの扱い**:
   - 既存の Prisma マイグレーションはデータベースに既に適用済みです
   - Drizzle への移行時は、新しいマイグレーションは作成しません（スキーマ変更がないため）
   - Drizzle のスキーマ定義は、現在のデータベースの状態を反映するだけです

### 注意が必要な点

1. **型の扱い**:

   - Prisma の `Decimal` 型は Drizzle でも適切にマッピングする必要があります
   - データ型の互換性を確認します

2. **デフォルト値**:

   - データベースのデフォルト値はそのまま維持されます
   - Drizzle スキーマでも同じデフォルト値を設定します

3. **制約**:
   - 外部キー制約、ユニーク制約などはすべて維持されます

## 注意事項

1. **段階的な移行**: 一度にすべてを移行せず、1 つずつ確実に移行する
2. **動作確認**: 各 API ルートの移行後、必ず動作確認を行う
3. **バックアップ**: 移行前にデータベースのバックアップを取得（念のため）
4. **テスト**: 各フェーズで十分なテストを実施
5. **ロールバック計画**: 問題が発生した場合のロールバック計画を準備
6. **スキーマの一致**: Drizzle スキーマが Prisma スキーマと完全に一致していることを確認

## 参考リンク

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with Vercel Edge Functions](https://orm.drizzle.team/docs/tutorials/drizzle-with-vercel-edge-functions)
- [Migrating from Prisma to Drizzle](https://orm.drizzle.team/docs/tutorials/drizzle-with-vercel-edge-functions)

## 更新履歴

- 2025-01-XX: 移行計画の作成
