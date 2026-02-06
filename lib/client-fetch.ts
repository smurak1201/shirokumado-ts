/**
 * クライアントサイドAPI呼び出しユーティリティ
 *
 * レスポンスのokチェック・JSONパース・エラーハンドリングを統一。
 */

/**
 * JSON APIにリクエストを送信し、型安全にレスポンスを返す
 *
 * エラー時はAPIレスポンスの error フィールドからメッセージを取得して throw する。
 * これにより呼び出し側で getUserFriendlyMessageJa(error) をそのまま使える。
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error || "リクエストに失敗しました"
    );
  }

  return response.json() as Promise<T>;
}
