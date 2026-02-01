/**
 * 認証設定とユーティリティ (lib/auth-config.ts)
 *
 * 管理画面へのアクセス制御を管理します。
 *
 * 主な機能:
 * - メールアドレスベースのアクセス許可チェック
 * - 許可リスト（allowed_admins テーブル）の照合
 *
 * 使用箇所:
 * - 管理画面（app/dashboard/）へのアクセス制御
 * - Stack Auth によるログイン後の権限確認
 *
 * セキュリティ上の注意:
 * - 許可リストに登録されていないユーザーは管理画面にアクセスできない
 * - メールアドレスが null または undefined の場合は常に false を返す
 *
 * ベストプラクティス:
 * - すべての管理画面ページで isAllowedEmail() を呼び出す
 * - 許可されていないユーザーはログインページにリダイレクトする
 *
 * データベーススキーマ:
 * - allowed_admins テーブル:
 *   - id: 主キー
 *   - email: メールアドレス（一意）
 *   - createdAt: 登録日時
 *
 * @see app/dashboard/ - 管理画面のアクセス制御
 */

import { prisma } from '@/lib/prisma';

/**
 * メールアドレスがログイン許可リストに含まれているかチェックします
 *
 * データベースの allowed_admins テーブルを参照し、指定されたメールアドレスが
 * 許可リストに登録されているかどうかを確認します。
 *
 * @param email メールアドレス（Stack Auth から取得、null または undefined の場合あり）
 * @returns 許可リストに含まれている場合 true、それ以外は false
 *
 * 使用例:
 * ```typescript
 * // Server Component での使用
 * import { stackServerApp } from "@/stack";
 * import { isAllowedEmail } from "@/lib/auth-config";
 * import { redirect } from "next/navigation";
 *
 * export default async function DashboardPage() {
 *   const user = await stackServerApp.getUser();
 *   const email = user?.primaryEmail;
 *
 *   // 許可リストに含まれているかチェック
 *   const allowed = await isAllowedEmail(email);
 *   if (!allowed) {
 *     redirect("/login"); // 許可されていない場合はログインページにリダイレクト
 *   }
 *
 *   return <div>管理画面</div>;
 * }
 * ```
 *
 * 判定ロジック:
 * 1. メールアドレスが null または undefined の場合 → false（早期リターン）
 * 2. データベースで該当メールアドレスを検索
 * 3. 見つかった場合 → true、見つからない場合 → false
 *
 * 実装の理由:
 * - null チェック: Stack Auth からのユーザー情報が不完全な場合に対応
 * - !! 演算子: allowedAdmin オブジェクトを boolean に変換
 *   - 見つかった場合: オブジェクト → true
 *   - 見つからない場合: null → false
 *
 * セキュリティ上の注意:
 * - 許可リストに登録されていないユーザーは管理画面にアクセスできない
 * - 認証されたユーザーでも、許可リストに含まれていなければアクセス拒否
 * - メールアドレスの大文字小文字は区別される（データベースで厳密一致）
 *
 * パフォーマンス:
 * - email フィールドは unique インデックスが設定されている
 * - findUnique() は高速（インデックスを使用）
 *
 * トレードオフ:
 * - 利点: シンプルで分かりやすい、管理が容易（データベースで直接管理）
 * - 欠点: 許可リストの追加/削除にはデータベース操作が必要
 *
 * 注意点:
 * - この関数は非同期（async）なので、await を忘れないこと
 * - データベースアクセスが発生するため、過度な呼び出しは避ける
 */
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  // メールアドレスが null または undefined の場合は早期リターン
  // 理由: データベースクエリを実行する前に無効な値を除外
  if (!email) return false;

  // allowed_admins テーブルで該当メールアドレスを検索
  // 理由: 許可リストに登録されているかどうかを確認
  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  // allowedAdmin が見つかった場合は true、見つからない場合は false
  // !! 演算子で boolean に変換
  // - オブジェクト → true
  // - null → false
  return !!allowedAdmin;
}
