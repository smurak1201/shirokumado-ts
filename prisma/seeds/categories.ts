import type { PrismaClient } from '@prisma/client';

const CATEGORIES = [
  { id: 1, name: '限定メニュー' },
  { id: 2, name: '通常メニュー' },
  { id: 3, name: 'サイドメニュー' },
];

export async function seedCategories(prisma: PrismaClient): Promise<void> {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });
  }
  console.log(
    'カテゴリーを作成しました:',
    CATEGORIES.map((c) => c.name).join(', ')
  );
}
