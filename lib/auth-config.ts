import { prisma } from '@/lib/prisma';

/**
 * メールアドレスがログイン許可リストに含まれているかチェック
 *
 * データベースの allowed_admins テーブルを参照
 */
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return !!allowedAdmin;
}
