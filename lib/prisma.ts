/**
 * Prisma Client 設定とユーティリティ (lib/prisma.ts)
 *
 * データベース接続を管理する Prisma Client のシングルトンインスタンスを提供します。
 *
 * 主な機能:
 * - Prisma Client のシングルトンインスタンス（グローバルで1つのみ）
 * - Neon アダプター経由でのデータベース接続（Vercel 最適化）
 * - エラーハンドリング付きデータベース操作ラッパー
 * - 開発環境でのホットリロード対応（接続プール枯渇防止）
 *
 * 使用箇所:
 * - Server Components（データ取得）
 * - API Routes（CRUD 操作）
 * - Server Actions（フォーム送信）
 *
 * 環境変数:
 * - DATABASE_URL: PostgreSQL 接続文字列（必須）
 *   形式: postgresql://user:password@host:port/database
 *
 * ベストプラクティス:
 * - データベース操作は safePrismaOperation でラップする（エラーハンドリング統一）
 * - 直接 prisma を使用する場合は try-catch でエラーを捕捉する
 * - マイグレーション実行後は disconnectPrisma() で接続を切断する
 *
 * 技術的な詳細:
 * - Prisma v7 + Neon では engineType = "client" を使用（エッジランタイム対応）
 * - @prisma/adapter-neon を使用して Neon の WebSocket 接続を確立
 * - 開発環境ではログレベル ['query', 'error', 'warn'] でデバッグを容易にする
 * - 本番環境ではログレベル ['error'] のみで不要なログを削減
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/neon
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { DatabaseError } from './errors';
import { log } from './logger';

/**
 * グローバル変数の型定義（Next.js 開発環境でのホットリロード対応）
 *
 * 理由:
 * - Next.js の開発環境ではファイル変更時にモジュールが再読み込みされる
 * - 再読み込みのたびに新しい Prisma Client インスタンスが作成されると、
 *   データベース接続プールが枯渇する（Too many connections エラー）
 * - globalThis にインスタンスを保存することで、再読み込み後も同じインスタンスを再利用
 *
 * 技術的な詳細:
 * - globalThis は Node.js のグローバルオブジェクト（ブラウザの window に相当）
 * - TypeScript の型定義を拡張して prisma プロパティを追加
 * - 本番環境では毎回新しいインスタンスが作成されるが、Prisma が効率的に接続を管理
 *
 * トレードオフ:
 * - グローバル変数の使用: 一般的には避けるべきだが、Next.js の制約により必要
 * - 代替案: 各リクエストで新しいインスタンスを作成すると接続プールが枯渇する
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client インスタンスを作成します
 *
 * Neon アダプター経由で PostgreSQL データベースに接続します。
 * Vercel + Neon 環境では、エッジランタイムとの互換性のために
 * Neon アダプターが必要です。
 *
 * @returns 設定済みの Prisma Client インスタンス
 * @throws {Error} DATABASE_URL が設定されていない場合
 *
 * 実装の詳細:
 * - PrismaNeon アダプターを使用（Prisma v7 + Neon の要件）
 * - ログレベルは環境に応じて切り替え（開発: query/error/warn、本番: error のみ）
 * - 接続文字列は環境変数 DATABASE_URL から取得
 *
 * ログレベルの選択理由:
 * - 開発環境: すべてのクエリを表示してデバッグを容易にする
 * - 本番環境: エラーのみ記録してログ量を削減（パフォーマンス向上）
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/neon
 */
const createPrismaClient = (): PrismaClient => {
  // DATABASE_URL を取得
  // 理由: Neon アダプターに接続文字列を渡すために必要
  const databaseUrl = process.env.DATABASE_URL;

  // 必須環境変数のバリデーション
  // 理由: データベース接続文字列がないとアプリケーションが動作しない
  // 早期に失敗することで、起動時にエラーを検出できる
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please set DATABASE_URL to your PostgreSQL connection string.\n' +
      'Format: postgresql://user:password@host:port/database\n\n' +
      'For Vercel deployments, set DATABASE_URL in your project environment variables.'
    );
  }

  // Neon アダプターを使用して Prisma Client を作成
  // 理由:
  // - Vercel + Neon 環境では、engineType = "client" を使用するためアダプターが必要
  // - Neon は WebSocket 経由で接続するため、従来の TCP 接続とは異なる
  // - Prisma v7.2 では、接続文字列を直接 PrismaNeon コンストラクタに渡す
  //
  // 技術的な背景:
  // - Vercel のエッジランタイムでは Node.js の net モジュールが使用できない
  // - Neon の HTTP/WebSocket API を使用することでエッジ環境でも動作する
  const adapter = new PrismaNeon({ connectionString: databaseUrl });

  // Prisma Client インスタンスを作成
  // - adapter: Neon アダプターを指定（Vercel 環境での動作に必要）
  // - log: ログレベルを環境に応じて設定
  return new PrismaClient({
    adapter,
    // ログレベルの設定
    // 開発環境: すべてのクエリ、エラー、警告を表示（デバッグ用）
    // 本番環境: エラーのみ記録（パフォーマンスとログコスト削減）
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

/**
 * Prisma Client のシングルトンインスタンス（エクスポート）
 *
 * 使用方法:
 * ```typescript
 * import { prisma } from '@/lib/prisma';
 *
 * // Server Component でデータ取得
 * const products = await prisma.product.findMany();
 *
 * // API Route で CRUD 操作
 * const newProduct = await prisma.product.create({
 *   data: { name: '商品名', price: 1000 }
 * });
 * ```
 *
 * 実装パターン:
 * - 開発環境: グローバル変数に保存されたインスタンスを再利用（ホットリロード対応）
 * - 本番環境: 毎回新しいインスタンスを作成（Prisma が接続を効率的に管理）
 *
 * Nullish coalescing operator (??) の使用理由:
 * - globalForPrisma.prisma が undefined の場合のみ createPrismaClient() を呼ぶ
 * - これにより、開発環境での再読み込み時に既存のインスタンスを再利用できる
 */
export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

// 開発環境でのみグローバル変数にインスタンスを保存
// 理由: ホットリロード時に同じインスタンスを再利用し、接続プール枯渇を防ぐ
// 本番環境では不要（モジュールは一度だけ読み込まれる）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Prisma 操作を安全に実行します
 *
 * データベース操作を実行し、エラーが発生した場合は適切に処理します。
 * すべてのエラーは DatabaseError に変換され、ログに記録されます。
 *
 * @template T 操作の返り値の型
 * @param operation 実行する Prisma 操作（非同期関数）
 * @param context エラーログに含める操作のコンテキスト（例: 'getProducts', 'createProduct'）
 * @returns 操作の結果
 * @throws {DatabaseError} データベース操作に失敗した場合
 *
 * 使用例:
 * ```typescript
 * // 商品一覧を取得（エラーハンドリング付き）
 * const products = await safePrismaOperation(
 *   () => prisma.product.findMany(),
 *   'getProducts'
 * );
 *
 * // 商品を作成（エラーハンドリング付き）
 * const newProduct = await safePrismaOperation(
 *   () => prisma.product.create({ data: productData }),
 *   'createProduct'
 * );
 * ```
 *
 * 実装の理由:
 * - エラーハンドリングを一元化（try-catch の重複を避ける）
 * - すべてのデータベースエラーを DatabaseError に統一（上位層でのエラー処理を容易にする）
 * - エラーログを自動的に記録（トラブルシューティングを容易にする）
 *
 * ベストプラクティス:
 * - すべての Prisma 操作はこの関数でラップすることを推奨
 * - context パラメータで操作の種類を明示する（ログ分析が容易になる）
 * - 呼び出し元で DatabaseError を catch して適切にハンドリングする
 *
 * トレードオフ:
 * - 利点: エラーハンドリングの統一、ログの自動記録、コードの簡潔化
 * - 欠点: すべてのエラーが DatabaseError になるため、特定のエラー（UniqueConstraintViolation など）を
 *         区別する場合は、元のエラーを調べる必要がある
 */
export async function safePrismaOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    log.error('データベース操作に失敗しました', {
      context: context || 'safePrismaOperation',
      error,
    });
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ''}`,
      error
    );
  }
}

/**
 * データベース接続を切断します
 *
 * Prisma Client のデータベース接続を明示的に切断します。
 * 通常のアプリケーション実行では不要ですが、特定のユースケースで使用します。
 *
 * @returns Promise（切断完了後に解決）
 *
 * 使用場面:
 * - マイグレーション実行後（prisma migrate deploy の後など）
 * - テストスイート終了時（Jest などでのクリーンアップ）
 * - スクリプト終了時（データインポートスクリプトなど）
 * - Prisma Studio などの開発ツール終了時
 *
 * 使用例:
 * ```typescript
 * // データインポートスクリプト
 * async function importData() {
 *   await prisma.product.createMany({ data: products });
 *   await disconnectPrisma(); // スクリプト終了前に切断
 * }
 * ```
 *
 * 注意点:
 * - Next.js の通常のリクエストハンドリングでは呼ぶ必要がない
 * - Prisma Client が自動的に接続を管理する（アイドル時に自動切断）
 * - 切断エラーは無視される（既に切断されている場合があるため）
 *
 * 実装の理由:
 * - 切断エラーを無視: 既に切断されている状態でも安全に呼び出せるようにする
 * - ログに記録: エラーが発生した場合でもトラブルシューティングのために記録
 *
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#disconnect
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    log.error('データベース接続の切断に失敗しました', {
      context: 'disconnectPrisma',
      error,
    });
    // 切断エラーは無視（既に切断されている可能性がある）
  }
}
