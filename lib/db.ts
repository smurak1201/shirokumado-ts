import { neon } from '@neondatabase/serverless';

/**
 * Neon (PostgreSQL) データベース接続ユーティリティ
 *
 * @neondatabase/serverlessを使用してNeonデータベースに接続します
 * 環境変数 DATABASE_URL または POSTGRES_URL を使用します
 */

// Neonクライアントの初期化
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

/**
 * SQLクエリを実行します
 * @param query SQLクエリ文字列
 * @param params クエリパラメータ（オプション）
 * @returns クエリ結果
 */
export async function query<T = unknown>(
  query: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    const result = await sql(query, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * SQLクエリを実行します（単一行を期待）
 * @param query SQLクエリ文字列
 * @param params クエリパラメータ（オプション）
 * @returns クエリ結果の最初の行、またはnull
 */
export async function queryOne<T = unknown>(
  query: string,
  params?: unknown[]
): Promise<T | null> {
  try {
    const result = await sql(query, params);
    return (result[0] as T) || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * SQLクエリを実行します（INSERT、UPDATE、DELETEなど）
 * @param query SQLクエリ文字列
 * @param params クエリパラメータ（オプション）
 * @returns 影響を受けた行数
 *
 * 注意: @neondatabase/serverlessではrowCountを直接取得できないため、
 * 実行結果の配列の長さを返します
 */
export async function execute(
  query: string,
  params?: unknown[]
): Promise<number> {
  try {
    const result = await sql(query, params);
    // INSERT/UPDATE/DDELETEの場合は、影響を受けた行数を返す
    // 実際のrowCountが必要な場合は、RETURNING句を使用するか、
    // 別途クエリで確認する必要があります
    return Array.isArray(result) ? result.length : 0;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * トランザクションを実行します
 * @param callback トランザクション内で実行する関数
 * @returns トランザクションの結果
 *
 * 注意: @neondatabase/serverlessでは、トランザクションは
 * 明示的にBEGIN/COMMIT/ROLLBACKを使用する必要があります
 * トランザクション内では、同じsqlインスタンスを使用してください
 */
export async function transaction<T>(
  callback: (sql: typeof sql) => Promise<T>
): Promise<T> {
  try {
    await sql('BEGIN');
    const result = await callback(sql);
    await sql('COMMIT');
    return result;
  } catch (error) {
    try {
      await sql('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    throw error;
  }
}

// sqlオブジェクトを直接エクスポート（必要に応じて使用可能）
export { sql };
