import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// Prisma 7では、環境変数DATABASE_URLから自動的に接続情報を読み込みます
const prisma = new PrismaClient();

// 許可する管理者メールアドレス
const ALLOWED_ADMIN_EMAILS = ['s.murakoshi1201@gmail.com'];

async function main() {
  console.log('シードデータの投入を開始します...');

  // 許可管理者メールアドレスの作成
  for (const email of ALLOWED_ADMIN_EMAILS) {
    await prisma.allowedAdmin.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
  console.log(
    '許可管理者メールアドレスを作成しました:',
    ALLOWED_ADMIN_EMAILS.join(', ')
  );

  // カテゴリーの作成
  const category1 = await prisma.category.upsert({
    where: { name: 'かき氷' },
    update: {},
    create: {
      name: 'かき氷',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'その他' },
    update: {},
    create: {
      name: 'その他',
    },
  });

  console.log('カテゴリーを作成しました:', category1.name, category2.name);

  console.log('シードデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error('シードデータの投入中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
