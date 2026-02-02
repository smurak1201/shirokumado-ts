/**
 * 認証設定とユーティリティ
 *
 * 管理画面へのアクセス制御を管理
 */

import { prisma } from '@/lib/prisma';

/**
 * メールアドレスがログイン許可リストに含まれているかチェック
 */
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return !!allowedAdmin;
}

/**
 * AllowedAdminテーブルからメールアドレスに対応するロールを取得
 */
export async function getRoleByEmail(email: string | null | undefined): Promise<string> {
  if (!email) return 'user';

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return allowedAdmin?.role ?? 'user';
}
