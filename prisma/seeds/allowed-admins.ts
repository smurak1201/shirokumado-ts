import type { PrismaClient } from '@prisma/client';

const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  { email: 'shirokumado.co.jp@gmail.com', role: 'admin' },
];

export async function seedAllowedAdmins(prisma: PrismaClient): Promise<void> {
  for (const admin of ALLOWED_ADMINS) {
    await prisma.allowedAdmin.upsert({
      where: { email: admin.email },
      update: { roleName: admin.role },
      create: { email: admin.email, roleName: admin.role },
    });
  }
  console.log(
    '許可管理者を作成しました:',
    ALLOWED_ADMINS.map((a) => `${a.email} (${a.role})`).join(', ')
  );
}
