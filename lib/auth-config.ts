/**
 * 認証設定とユーティリティ
 *
 * 管理画面へのアクセス制御を管理
 */

import { prisma, safePrismaOperation } from '@/lib/prisma';

/**
 * メールアドレスがログイン許可リストに含まれているかチェック
 */
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await safePrismaOperation(
    () => prisma.allowedAdmin.findUnique({
      where: { email },
    }),
    'isAllowedEmail'
  );

  return !!allowedAdmin;
}

/**
 * AllowedAdminテーブルからメールアドレスに対応するロール名を取得
 */
export async function getRoleNameByEmail(email: string | null | undefined): Promise<string | null> {
  if (!email) return null;

  const allowedAdmin = await safePrismaOperation(
    () => prisma.allowedAdmin.findUnique({
      where: { email },
    }),
    'getRoleNameByEmail'
  );

  return allowedAdmin?.roleName ?? null;
}
