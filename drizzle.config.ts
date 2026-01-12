import { defineConfig } from "drizzle-kit";
import "dotenv/config";

/**
 * Drizzle Kit 設定ファイル
 *
 * Edge Runtime対応のため、Neon PostgreSQLを使用します。
 * 既存のデータベーススキーマを変更しないため、マイグレーションは生成しません。
 */

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
  },
  verbose: true,
  strict: true,
});
