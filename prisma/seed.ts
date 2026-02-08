/**
 * Prisma シーダー
 *
 * コマンドライン引数でシード対象を指定可能
 *   npm run db:seed                            # 対話モード
 *   npm run db:seed -- help                    # 使い方を表示
 *   npm run db:seed -- all                     # 全テーブル
 *   npm run db:seed -- roles                   # rolesだけ
 *   npm run db:seed -- roles allowed-admins    # 複数指定
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as readline from 'readline';
import 'dotenv/config';
import { seedRoles } from './seeds/roles';
import { seedAllowedAdmins } from './seeds/allowed-admins';
import { seedCategories } from './seeds/categories';
import { seedProducts } from './seeds/products';

const SEEDERS = {
  roles: { fn: seedRoles, label: 'ロール' },
  'allowed-admins': { fn: seedAllowedAdmins, label: '許可管理者' },
  categories: { fn: seedCategories, label: 'カテゴリー' },
  products: { fn: seedProducts, label: '商品' },
} as const;

type SeederName = keyof typeof SEEDERS;

const SEEDER_NAMES = Object.keys(SEEDERS) as SeederName[];

function showHelp(): void {
  console.log(`
使い方: npm run db:seed -- <テーブル名...>

テーブル名:
  all
  ${SEEDER_NAMES.join('\n  ')}

例:
  npm run db:seed                            対話モード
  npm run db:seed -- help                    使い方を表示
  npm run db:seed -- all                     全テーブルをシード
  npm run db:seed -- roles                   rolesだけシード
  npm run db:seed -- roles allowed-admins    複数指定
`);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function interactiveSelect(): Promise<SeederName[]> {
  console.log('\nどのテーブルのデータを投入しますか？\n');
  console.log('  0) all（全テーブル）');
  SEEDER_NAMES.forEach((name, i) => {
    console.log(`  ${i + 1}) ${name}（${SEEDERS[name].label}）`);
  });
  console.log();

  const answer = await prompt('番号を入力（複数はスペース区切り）: ');

  if (!answer) {
    console.error('入力がありません。');
    process.exit(1);
  }

  const numbers = answer.split(/[\s,]+/).map(Number);

  if (numbers.some((n) => isNaN(n) || n < 0 || n > SEEDER_NAMES.length)) {
    console.error('無効な番号が含まれています。');
    process.exit(1);
  }

  const targets = numbers.includes(0)
    ? SEEDER_NAMES
    : numbers.map((n) => SEEDER_NAMES[n - 1]!);

  const labels = targets.map((t) => SEEDERS[t].label).join(', ');
  const confirm = await prompt(`\n対象: ${labels}\n実行しますか？ (y/N): `);

  if (confirm.toLowerCase() !== 'y') {
    console.log('キャンセルしました。');
    process.exit(0);
  }

  return targets;
}

async function parseArgs(): Promise<SeederName[]> {
  const args = process.argv.slice(2);

  if (args.includes('help') || args.includes('h')) {
    showHelp();
    process.exit(0);
  }

  if (args.length === 0) {
    return interactiveSelect();
  }

  if (args.includes('all')) {
    return SEEDER_NAMES;
  }

  const invalid = args.filter(
    (arg) => !SEEDER_NAMES.includes(arg as SeederName)
  );
  if (invalid.length > 0) {
    console.error(`不明なテーブル名: ${invalid.join(', ')}`);
    showHelp();
    process.exit(1);
  }

  return args as SeederName[];
}

async function main(): Promise<void> {
  const targets = await parseArgs();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const labels = targets.map((t) => SEEDERS[t].label).join(', ');
    console.log(`シードデータの投入を開始します... 対象: ${labels}`);

    for (const target of targets) {
      await SEEDERS[target].fn(prisma);
    }

    console.log('シードデータの投入が完了しました！');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('シードデータの投入中にエラーが発生しました:', e);
  process.exit(1);
});
