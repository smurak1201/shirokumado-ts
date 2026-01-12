# Prisma → Drizzle 移行ドキュメント

このディレクトリには、Prisma ORM から Drizzle ORM への移行に関するドキュメントが含まれています。

## ドキュメント一覧

### 1. [移行計画](./migration-plan.md)

移行全体の計画とフェーズごとの作業内容を記載しています。

### 2. [Prisma 現状使用状況](./prisma-current-state.md)

現在の Prisma 使用状況を詳細に記録したドキュメントです。

- スキーマ定義
- API ルートでの使用パターン
- サーバーコンポーネントでの使用パターン
- 使用している Prisma 機能

### 3. [Prisma → Drizzle 移行マッピング](./prisma-to-drizzle-mapping.md)

Prisma のクエリを Drizzle のクエリに変換する際のマッピング表です。

- 基本概念の対応
- クエリオプションの対応
- 具体的な移行例
- 型定義の対応

## 移行の流れ

1. **Phase 1: 現状のドキュメント化** ✅

   - Prisma 使用状況の記録
   - 移行仕様書の作成

2. **Phase 2: Drizzle のセットアップ**

   - Drizzle のインストール
   - スキーマ定義の作成
   - マイグレーションの準備

3. **Phase 3: 段階的な移行**

   - 1 つの API ルートから移行開始
   - 動作確認
   - 次の API ルートへ

4. **Phase 4: 完全移行後のクリーンアップ**
   - Prisma 関連ファイルの削除
   - package.json の更新
   - ドキュメントの更新

詳細は [移行計画](./migration-plan.md) を参照してください。

## 参考リンク

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with Vercel Edge Functions](https://orm.drizzle.team/docs/tutorials/drizzle-with-vercel-edge-functions)
- [Prisma Documentation](https://www.prisma.io/docs) (移行前の参照用)
