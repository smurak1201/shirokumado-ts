import type { PrismaClient } from '@prisma/client';

const ROLES = [
  { name: 'admin', description: 'すべてのダッシュボード機能にアクセス可能' },
  { name: 'homepage', description: 'ホームページ関連の機能のみ' },
  { name: 'shop', description: 'ECサイト関連の機能のみ' },
];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }
  console.log(
    'ロールを作成しました:',
    ROLES.map((r) => r.name).join(', ')
  );
}
