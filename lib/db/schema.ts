/**
 * Drizzle ORM スキーマ定義
 *
 * 既存のデータベーススキーマと完全に一致するように定義されています。
 *
 * Edge Runtime対応のため、Neon PostgreSQLを使用します。
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * カテゴリーテーブル
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

/**
 * 商品テーブル
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  priceS: decimal("price_s", { precision: 10, scale: 2 }),
  priceL: decimal("price_l", { precision: 10, scale: 2 }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at"),
  endedAt: timestamp("ended_at"),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

/**
 * リレーション定義
 */
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

/**
 * 型定義（Drizzleの型推論を使用）
 */
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

/**
 * リレーションを含む型定義
 */
export type ProductWithCategory = Product & {
  category: Category;
};

export type CategoryWithProducts = Category & {
  products: Product[];
};
