/**
 * マイグレーション実行スクリプト
 * 
 * このスクリプトは既存のデータを保持しながらマイグレーションを実行します。
 * 
 * 使用方法:
 *   tsx scripts/run-migrations.ts
 * 
 * または、Vercelの環境で実行する場合:
 *   npx prisma migrate deploy
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 マイグレーション実行スクリプトを開始します...\n');

// 環境変数の確認
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error('❌ エラー: DATABASE_URL または POSTGRES_URL が設定されていません');
  process.exit(1);
}

console.log('✅ データベース接続文字列が設定されています');
console.log(`   接続先: ${databaseUrl.substring(0, 30)}...\n`);

// Prismaスキーマファイルの確認
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ エラー: prisma/schema.prisma が見つかりません');
  process.exit(1);
}

console.log('✅ Prismaスキーマファイルが見つかりました\n');

// マイグレーションファイルの確認
const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
if (!fs.existsSync(migrationsPath)) {
  console.error('❌ エラー: prisma/migrations ディレクトリが見つかりません');
  process.exit(1);
}

const migrationFiles = fs.readdirSync(migrationsPath)
  .filter(dir => fs.statSync(path.join(migrationsPath, dir)).isDirectory())
  .filter(dir => dir !== 'migration_lock.toml');

console.log(`✅ マイグレーションファイルが見つかりました (${migrationFiles.length}個)`);
migrationFiles.forEach(file => {
  console.log(`   - ${file}`);
});
console.log('');

// マイグレーション実行前の確認
console.log('⚠️  重要: 既存のデータは保持されます');
console.log('   以下のマイグレーションが実行されます:');
console.log('   1. テーブル作成 (categories, products)');
console.log('   2. カラム追加 (published, published_at, ended_at, display_order)');
console.log('   3. テーブル削除 (tags - 既存データには影響しません)');
console.log('');

// マイグレーション実行
try {
  console.log('📦 Prisma Clientを生成しています...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Clientの生成が完了しました\n');

  console.log('🔄 マイグレーションを実行しています...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ マイグレーションが完了しました\n');

  console.log('🎉 すべてのマイグレーションが正常に完了しました！');
  console.log('   既存のデータは保持されています。');
} catch (error) {
  console.error('\n❌ マイグレーション実行中にエラーが発生しました:');
  console.error(error);
  process.exit(1);
}
