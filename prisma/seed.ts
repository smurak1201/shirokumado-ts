/**
 * Prisma シーダー
 *
 * データベースに初期データを投入するスクリプト
 * カテゴリー、商品、許可管理者を作成
 *
 * Prisma v7 + Neon環境では、PrismaNeonアダプターを使用して接続します
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// ロールマスター
const ROLES = [
  { name: 'admin', description: 'すべてのダッシュボード機能にアクセス可能' },
  { name: 'homepage', description: 'ホームページ関連の機能のみ' },
  { name: 'shop', description: 'ECサイト関連の機能のみ' },
];

// 許可する管理者
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  { email: 'shirokumado.co.jp@gmail.com', role: 'admin' },
];

// カテゴリーデータ
const CATEGORIES = [
  { id: 1, name: '限定メニュー' },
  { id: 2, name: '通常メニュー' },
  { id: 3, name: 'サイドメニュー' },
];

// 商品データ
const PRODUCTS = [
  {
    id: 1,
    name: '波のり\n超チョコミント氷',
    description:
      '食べ物アート作家「鴨志田和泉」氏コラボメニュー。毎年恒例の波のり氷！今年はチョコミント！爽やかな見た目と口当たりで涼を楽しめるかき氷。日差しの強い真夏の海をオレンジとサーフボードクッキー、ミントホイップで表現',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767327305363_____3.webp',
    priceS: null,
    priceL: 2400,
    categoryId: 1,
    published: true,
    displayOrder: 1,
  },
  {
    id: 2,
    name: '香がらしのホットな\nチャイかき氷',
    description:
      'フルーティな香りが特徴の「香がらし」を使用したかき氷。チャイ風に仕上げた「香がらしシロップ」と「香がらしホイップ」「パプリカクリーム」「ミルクベース」の構成。辛さ控えめな甘く冷たい燃焼系かき氷',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767327318046_____27.webp',
    priceS: null,
    priceL: 1800,
    categoryId: 1,
    published: true,
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'フルーツトマトミルク',
    description:
      'トマト特有の青さを残し、トマトの甘みと旨味を引き出したソースに特製ミルクを合わせました。終盤にはゴルゴンゾーラミルクのクセあまじょっぱい味わいが現れます。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767327326738_____8.webp',
    priceS: null,
    priceL: 1600,
    categoryId: 1,
    published: true,
    displayOrder: 3,
  },
  {
    id: 4,
    name: 'Kinaco.',
    description:
      'きな粉が主役のかき氷。特製ミルク、きな粉ソース、きな粉、あずき、白玉、ホイップクリームで和テイストに仕上がっています。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767276114373_Kinaco..webp',
    priceS: 1500,
    priceL: null,
    categoryId: 2,
    published: true,
    displayOrder: 3,
  },
  {
    id: 5,
    name: '黒糖珈琲みるく',
    description:
      '白熊堂の看板メニュー。沖縄県産の黒糖と珈琲を煮詰めて作る黒糖珈琲シロップと特製ミルクのどこか懐かしい味わいのかき氷です。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275983897________.webp',
    priceS: 1000,
    priceL: 1400,
    categoryId: 2,
    published: true,
    displayOrder: 2,
  },
  {
    id: 6,
    name: 'マンゴーみるく',
    description:
      '白熊堂の定番メニュー。特製ミルクをベースに濃厚マンゴーソースをかけたフルーティなかき氷。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275898323________.webp',
    priceS: 1000,
    priceL: 1400,
    categoryId: 2,
    published: true,
    displayOrder: 6,
  },
  {
    id: 7,
    name: 'ブルーハワイかき氷',
    description:
      '屋台の定番ブルーハワイかき氷を天然氷で召し上がってみてください。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275871318__________.webp',
    priceS: 800,
    priceL: 1200,
    categoryId: 2,
    published: true,
    displayOrder: 9,
  },
  {
    id: 8,
    name: '香りいちごみるく',
    description:
      'スパイスで香り付けした苺のソースと特製ミルクのかき氷。ちょっぴりスパイシーで甘酸っぱい仕上がり。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275835435_________.webp',
    priceS: 1500,
    priceL: 1900,
    categoryId: 2,
    published: true,
    displayOrder: 5,
  },
  {
    id: 9,
    name: '香りいちごとマンゴー',
    description:
      'いちごもマンゴーも両方食べたいという方のためのハーフ＆ハーフの贅沢かき氷。特製ミルクもかかっています。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275803116___________.webp',
    priceS: 1600,
    priceL: 2000,
    categoryId: 2,
    published: true,
    displayOrder: 7,
  },
  {
    id: 10,
    name: '白くまDX',
    description:
      '白熊堂の看板メニュー【黒糖珈琲みるく】にホイップクリーム、白玉、あずきをトッピングした豪華メニュー。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275778881____DX.webp',
    priceS: 1400,
    priceL: 1800,
    categoryId: 2,
    published: true,
    displayOrder: 1,
  },
  {
    id: 11,
    name: 'チョコレートみるく',
    description:
      '白熊堂特製ミルクソースに、チョコレートシロップとココアパウダーがかかったかき氷。ホイップクリームのトッピングがおススメ。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275755753__________.webp',
    priceS: 1200,
    priceL: 1600,
    categoryId: 2,
    published: true,
    displayOrder: 4,
  },
  {
    id: 12,
    name: 'にじいろかき氷',
    description:
      'カラフルな屋台味かき氷を天然氷でお楽しみください。',
    imageUrl:
      'https://h5jcxmzymkj54vgl.public.blob.vercel-storage.com/products/1767275716683________.webp',
    priceS: 900,
    priceL: null,
    categoryId: 2,
    published: true,
    displayOrder: 8,
  },
];

async function main() {
  console.log('シードデータの投入を開始します...');

  // ロールマスターの作成
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

  // 許可管理者の作成
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

  // カテゴリーの作成
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

  // 商品の作成
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        priceS: product.priceS,
        priceL: product.priceL,
        categoryId: product.categoryId,
        published: product.published,
        displayOrder: product.displayOrder,
      },
      create: {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        priceS: product.priceS,
        priceL: product.priceL,
        categoryId: product.categoryId,
        published: product.published,
        displayOrder: product.displayOrder,
      },
    });
  }
  console.log(`商品を作成しました: ${PRODUCTS.length}件`);

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
