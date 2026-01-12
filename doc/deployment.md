# デプロイメントガイド

白熊堂プロジェクトのデプロイメント手順を説明します。

## 目次

- [デプロイ環境](#デプロイ環境)
- [前提条件](#前提条件)
- [初回デプロイ](#初回デプロイ)
  - [Vercel プロジェクトの作成](#1-vercelプロジェクトの作成)
  - [環境変数の設定](#2-環境変数の設定)
  - [Neon データベースの設定](#3-neonデータベースの設定)
  - [Blob Storage の設定](#4-blob-storageの設定)
  - [デプロイの実行](#5-デプロイの実行)
- [継続的デプロイ](#継続的デプロイ)
  - [自動デプロイ](#自動デプロイ)
  - [手動デプロイ](#手動デプロイ)
- [データベースマイグレーション](#データベースマイグレーション)
  - [本番環境でのマイグレーション](#本番環境でのマイグレーション)
  - [マイグレーションのベストプラクティス](#マイグレーションのベストプラクティス)
- [デプロイ後の確認](#デプロイ後の確認)
  - [ビルドログの確認](#1-ビルドログの確認)
  - [アプリケーションの動作確認](#2-アプリケーションの動作確認)
  - [パフォーマンスの確認](#3-パフォーマンスの確認)
- [トラブルシューティング](#トラブルシューティング)
  - [ビルドエラー](#ビルドエラー)
  - [ランタイムエラー](#ランタイムエラー)
  - [ログの確認](#ログの確認)
- [セキュリティ](#セキュリティ)
  - [環境変数の管理](#環境変数の管理)
  - [データベースセキュリティ](#データベースセキュリティ)
- [モニタリング](#モニタリング)
  - [Vercel Analytics](#vercel-analytics)
  - [カスタムモニタリング](#カスタムモニタリング)
- [ロールバック](#ロールバック)
  - [デプロイのロールバック](#デプロイのロールバック)
  - [データベースのロールバック](#データベースのロールバック)
- [参考リンク](#参考リンク)

## デプロイ環境

- **ホスティング**: Vercel
- **データベース**: Vercel Neon (PostgreSQL)
- **ストレージ**: Vercel Blob Storage

## 前提条件

1. Vercel アカウント
2. GitHub リポジトリへのアクセス権限
3. 環境変数の設定

## 初回デプロイ

### 1. Vercel プロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New Project」をクリック
3. GitHub リポジトリを選択
4. プロジェクト設定を確認：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（自動検出）
   - **Output Directory**: `.next`（自動検出）

### 2. 環境変数の設定

Vercel ダッシュボードで以下の環境変数を設定します：

#### 必須環境変数

```env
# データベース接続（必須）
DATABASE_URL=postgresql://user:password@host:port/database

# 以下の環境変数はオプションです（Neon の接続プール設定など）
DATABASE_URL_UNPOOLED=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage（必須）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

**重要**:

- `DATABASE_URL`: PostgreSQL 接続文字列（アプリケーション用・マイグレーション用）

詳細は [Prisma & Blob セットアップガイド](./setup-prisma-blob.md) を参照してください。

#### オプション環境変数

```env
# Neon Auth（使用する場合）
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

### 3. Neon データベースの設定

1. [Neon Dashboard](https://console.neon.tech/)でデータベースを作成
2. 接続文字列を取得（`DATABASE_URL` として設定）
3. Vercel の環境変数に設定

### 4. Blob Storage の設定

1. Vercel ダッシュボードで「Storage」→「Blob」を選択
2. Blob Storage を作成
3. `BLOB_READ_WRITE_TOKEN`を取得して環境変数に設定

### 5. デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイ完了を待つ

## 継続的デプロイ

### 自動デプロイ

Vercel は以下の場合に自動的にデプロイします：

- **main ブランチへのプッシュ**: 本番環境にデプロイ
- **プルリクエスト**: プレビュー環境にデプロイ

### 手動デプロイ

```bash
# Vercel CLIを使用
npm install -g vercel
vercel login
vercel --prod
```

## データベースマイグレーション

### 本番環境でのマイグレーション

**重要**: マイグレーション実行時は、`DATABASE_URL` または `DATABASE_URL_UNPOOLED` を使用します。

```bash
# 環境変数を設定（DATABASE_URLを使用）
export DATABASE_URL="postgresql://..."

# マイグレーションを実行
npm run db:migrate:deploy
```

または、Vercel の環境変数を使用：

```bash
vercel env pull .env.production
npm run db:migrate:deploy
```

**注意**: `package.json` の `build` スクリプトには `prisma migrate deploy` が含まれているため、Vercel でのデプロイ時に自動的にマイグレーションが実行されます。この場合、`DATABASE_URL` が正しく設定されている必要があります。

### マイグレーションのベストプラクティス

1. **開発環境でテスト**: 本番環境に適用する前に開発環境でテスト
2. **バックアップ**: 重要な変更の前にデータベースをバックアップ
3. **段階的な適用**: 大きな変更は段階的に適用

## デプロイ後の確認

### 1. ビルドログの確認

Vercel ダッシュボードでビルドログを確認し、エラーがないか確認します。

### 2. アプリケーションの動作確認

- [ ] ホームページが正常に表示される
- [ ] API Routes が正常に動作する
- [ ] データベース接続が正常
- [ ] 画像のアップロードが正常

### 3. パフォーマンスの確認

- [ ] ページの読み込み速度
- [ ] API レスポンス時間
- [ ] データベースクエリのパフォーマンス

## トラブルシューティング

### ビルドエラー

#### Prisma Client が見つからない

```bash
# 解決方法: package.jsonのbuildスクリプトを確認
"build": "prisma generate && next build"
```

#### 環境変数が見つからない

- Vercel ダッシュボードで環境変数が設定されているか確認
- 環境変数名が正しいか確認（大文字・小文字に注意）

### ランタイムエラー

#### データベース接続エラー

1. `DATABASE_URL` が正しく設定されているか確認
   - PostgreSQL 接続文字列の形式が正しいか確認（`postgresql://user:password@host:port/database`）
2. Neon ダッシュボードでデータベースがアクティブか確認
3. SSL 接続が必要な場合は、接続文字列に`?sslmode=require`が含まれているか確認

#### Blob Storage エラー

1. `BLOB_READ_WRITE_TOKEN`が正しく設定されているか確認
2. Vercel ダッシュボードで Blob Storage が有効か確認

### ログの確認

```bash
# Vercel CLIでログを確認
vercel logs [deployment-url]
```

または、Vercel ダッシュボードの「Functions」タブでログを確認できます。

## セキュリティ

### 環境変数の管理

- **機密情報**: 環境変数で管理し、コードに含めない
- **本番環境と開発環境**: 異なる環境変数を使用
- **定期的な確認**: 不要な環境変数を削除

### データベースセキュリティ

- **接続文字列**: 環境変数で管理
- **SSL 接続**: 本番環境では必須
- **アクセス制御**: 必要最小限の権限のみ付与

## モニタリング

### Vercel Analytics

Vercel ダッシュボードで以下を確認できます：

- ページビュー
- パフォーマンスメトリクス
- エラー率

### カスタムモニタリング

必要に応じて、以下のサービスを統合できます：

- **Sentry**: エラートラッキング
- **LogRocket**: セッションリプレイ
- **Datadog**: パフォーマンスモニタリング

## ロールバック

### デプロイのロールバック

1. Vercel ダッシュボードで「Deployments」を開く
2. ロールバックしたいデプロイを選択
3. 「Promote to Production」をクリック

### データベースのロールバック

```bash
# マイグレーションをロールバック
npx prisma migrate resolve --rolled-back [migration-name]
```

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
