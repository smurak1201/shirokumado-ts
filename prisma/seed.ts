import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// 環境変数を読み込む（Prisma Clientの初期化前に実行）
dotenv.config();

// DATABASE_URLが設定されているか確認
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient();

async function main() {
  console.log('シードデータの投入を開始します...');

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

  // タグの作成
  const tag1 = await prisma.tag.upsert({
    where: { name: '限定商品' },
    update: {},
    create: {
      name: '限定商品',
    },
  });

  console.log('タグを作成しました:', tag1.name);

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
