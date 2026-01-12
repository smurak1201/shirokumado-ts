/**
 * Drizzle ORM クライアント
 *
 * Edge Runtime対応のため、@neondatabase/serverlessを使用します。
 *
 * Next.js App Routerでのベストプラクティス:
 * - 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 *   グローバル変数に保存します
 * - 本番環境では各リクエストで新しいインスタンスを使用しますが、
 *   接続プールにより効率的に管理されます
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { DatabaseError, logError } from "../errors";

/**
 * Edge Runtime対応: neon-httpを使用
 *
 * neon-httpはHTTPベースの接続を使用するため、WebSocket設定は不要です。
 * Edge Runtimeでも問題なく動作します。
 */

/**
 * 開発環境でのホットリロード対策のためのグローバル変数
 */
declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof createDrizzleClient> | undefined;
}

/**
 * Drizzleクライアントを作成します
 */
function createDrizzleClient() {
  const rawConnectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!rawConnectionString) {
    throw new Error(
      "DATABASE_URL or POSTGRES_URL environment variable is not set"
    );
  }

  // 接続文字列を確実に文字列に変換
  const connectionString = String(rawConnectionString).trim();

  // 接続文字列が空でないことを確認
  if (!connectionString || connectionString.length === 0) {
    throw new Error("DATABASE_URL must be a non-empty string");
  }

  // 接続文字列が正しい形式であることを確認
  if (
    !connectionString.startsWith("postgresql://") &&
    !connectionString.startsWith("postgres://")
  ) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string"
    );
  }

  try {
    // Neon serverless driverを使用（Edge Runtime対応）
    // neon-httpを使用することで、Edge Runtimeでも動作します
    const sql = neon(connectionString);
    return drizzle(sql, { schema });
  } catch (error) {
    console.error("Failed to create Drizzle Client:", error);
    console.error("Connection string type:", typeof connectionString);
    console.error("Connection string length:", connectionString.length);
    console.error(
      "Connection string preview:",
      connectionString.substring(0, 20) + "..."
    );
    throw error;
  }
}

/**
 * Drizzleクライアントのシングルトンインスタンス
 *
 * 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 * グローバル変数に保存します。
 * 本番環境では各リクエストで新しいインスタンスが作成されますが、
 * Neon serverless driverが効率的に接続を管理します。
 */
export const db = global.db ?? createDrizzleClient();

if (process.env.NODE_ENV !== "production") {
  global.db = db;
}

/**
 * Drizzle操作を安全に実行します
 * エラーを適切に処理し、DatabaseErrorに変換します
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ""}`,
      error
    );
  }
}

/**
 * スキーマをエクスポート（他のファイルで使用可能にするため）
 */
export * from "./schema";
