# トップページ デザイン改修

**日付**: 2026-01-25
**ブランチ**: feature/frontend-redesign
**対象**: トップページ（app/page.tsx）
**ステータス**: 完了
**完了日**: 2026-01-25

---

## 進捗状況

| #   | タスク                               | ステータス | 備考 |
| --- | ------------------------------------ | :--------: | ---- |
| 1   | Framer Motionインストール            |    [o]     |      |
| 2   | 色調変更（CSS変数更新）              |    [o]     |      |
| 3   | ヒーローセクションのアニメーション   |    [o]     |      |
| 4   | ヘッダーのアニメーション             |    [o]     |      |
| 5   | 商品タイルのスクロールアニメーション |    [o]     |      |
| 6   | タブ切り替えアニメーション           |    [o]     |      |
| 7   | 商品カードのホバー色調整             |    [o]     | 既にprimaryカラーを使用した設定済み、変更不要と確認 |
| 8   | 動作確認・ビルドテスト               |    [o]     | ビルド成功 |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

かき氷屋「白熊堂」のトップページを、より涼しげでモダンな印象に改善する。

### 背景

- Instagramで既に運用中、ホームページを新規作成
- Instagramからの流入がメイン
- **スマホからの閲覧が多くなる想定**
- デスクトップ/スマホで見た目に大きな差がない設計

### 設計方針

- **スマホファースト**: スマホでの操作性・視認性を最優先
- カテゴリータブは上部に配置（サイドバーはスマホで操作しにくいため現状維持）
- アニメーションは控えめに（スマホのパフォーマンス考慮）
- 既存のホバーアニメーション（CSSベース）は維持

---

## 実装仕様

### タスク1: Framer Motionインストール [完了]

**ファイル**: `package.json`

```bash
npm install framer-motion
```

---

### タスク2: 色調変更（CSS変数更新） [完了]

**ファイル**: `app/globals.css`

**変更内容**: グレースケール → 白基調 + 淡いブルーアクセント

```css
/* 変更後 */
--primary: 200 60% 55%;
--primary-foreground: 0 0% 100%;
--secondary: 200 30% 97%;
--secondary-foreground: 200 50% 30%;
--muted: 200 20% 96%;
--accent: 200 40% 96%;
--accent-foreground: 200 50% 30%;
--border: 200 20% 90%;
--input: 200 20% 90%;
--ring: 200 60% 55%;
```

---

### タスク3: ヒーローセクションのアニメーション [完了]

**ファイル**: `app/page.tsx`

**変更内容**:

- Server ComponentからClient Componentへの変更が必要
- または、ヒーローセクションを別コンポーネントとして切り出す

**推奨**: ヒーロー部分を `HeroSection.tsx` として切り出す

**新規ファイル**: `app/components/HeroSection.tsx`

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative h-[40vh] min-h-[75px] w-full overflow-hidden md:h-[60vh] md:min-h-[125px] lg:h-[70vh] lg:min-h-[150px]">
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      {/* グラデーションオーバーレイ - 淡いブルー系 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40"
      />
    </section>
  );
}
```

**page.tsx の変更**:

```tsx
// import文追加
import HeroSection from "./components/HeroSection";

// ヒーローセクション部分を置き換え
<HeroSection />;
```

---

### タスク4: ヘッダーのアニメーション [完了]

**ファイル**: `app/components/Header.tsx`

**変更内容**:

- `"use client"` 追加
- `motion` コンポーネントでラップ
- ロゴとナビゲーションを順次フェードイン

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Header() {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-2 md:px-6 overflow-x-hidden">
        <motion.div
          variants={itemVariants}
          className="relative flex items-center gap-4 overflow-visible"
        >
          {/* ロゴとInstagramアイコン（既存のまま） */}
        </motion.div>

        <motion.nav
          variants={itemVariants}
          className="flex items-center gap-4 md:gap-6"
        >
          {/* ナビゲーション（既存のまま） */}
        </motion.nav>
      </div>
    </motion.header>
  );
}
```

---

### タスク5: 商品タイルのスクロールアニメーション [完了]

**ファイル**: `app/components/ProductGrid.tsx`

**変更内容**:

- `motion` コンポーネントを追加
- グリッド全体を `motion.div` でラップ
- `whileInView` で画面内に入ったらアニメーション

```tsx
"use client";

import { motion, type Variants } from "framer-motion";
import ProductTile from "./ProductTile";
// ... 他のimport

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ProductGrid({
  category,
  products,
  showCategoryTitle = true,
}: ProductGridProps) {
  // ... 既存のロジック

  return (
    <>
      <section className="mb-12 md:mb-20 lg:mb-24">
        {showCategoryTitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-center md:mb-12 lg:mb-16"
          >
            {/* カテゴリータイトル（既存のまま） */}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              style={{ willChange: "opacity" }}
            >
              <ProductTile
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                }}
                onClick={() => handleProductClick(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* モーダル（既存のまま） */}
    </>
  );
}
```

---

### タスク6: タブ切り替えアニメーション [完了]

**ファイル**: `app/components/ProductCategoryTabs.tsx`

**変更内容**:

- `AnimatePresence` でタブコンテンツをラップ
- タブ切り替え時にフェードアニメーション

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// ... 他のimport

export default function ProductCategoryTabs({
  categoriesWithProducts,
}: ProductCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    categoriesWithProducts[0]?.category.id.toString() || "",
  );

  // ... 既存のロジック

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="...">{/* タブリスト（既存のまま） */}</TabsList>

      <AnimatePresence mode="wait">
        {categoriesWithProducts.map(({ category, products }) => (
          <TabsContent
            key={category.id}
            value={category.id.toString()}
            className="mt-0"
            forceMount
          >
            {activeTab === category.id.toString() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ProductGrid
                  category={category}
                  products={products}
                  showCategoryTitle={false}
                />
              </motion.div>
            )}
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}
```

**注意**: `forceMount` を使用してアニメーションを正しく動作させる

---

### タスク7: 商品カードのホバー色調整 [完了]

**ファイル**: `app/components/ui/card-product.tsx`

**変更内容**:

- ホバー時の影の色を `primary` に統一（既に設定済み）
- 必要に応じて微調整

```tsx
// 現在の設定（変更不要の可能性あり）
"hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
"hover:border-primary/40 border-border/60",
```

**確認ポイント**:

- 色調変更後、`primary` が淡いブルーになっているため、ホバー時の影も淡いブルーになる
- 見た目を確認し、必要に応じて `shadow-primary/10` の透明度を調整

---

### タスク8: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [o] 色調がアイスブルー系に変わっていること
   - [o] ページロード時にヒーロー画像がフェードイン
   - [o] ページロード時にヘッダーが順次フェードイン
   - [o] スクロール時に商品タイルが順次フェードイン
   - [o] タブ切り替え時にコンテンツがフェードイン
   - [o] 商品カードのホバー時の影が淡いブルー

2. **アクセシビリティ確認**
   - [o] Framer Motionが自動的に `prefers-reduced-motion` をサポート
   - 注意: CSSでの追加対応は不要（競合してちらつきの原因になる）

3. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

4. **スマホ確認**
   - [o] スマホサイズでアニメーションが正常に動作すること
   - [o] パフォーマンスに問題がないこと

---

## アクセシビリティ対応

Framer Motionは `prefers-reduced-motion` を自動的にサポート。

**注意**: 以下のCSSは追加しないこと。Framer Motionのアニメーションと競合し、スマホでちらつきが発生する原因になる。

```css
/* 追加しないこと */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Framer Motionが自動的に対応するため、追加のCSS設定は不要。

---

## 変更対象ファイル一覧

| ファイル                                 | 変更内容                              | ステータス |
| ---------------------------------------- | ------------------------------------- | :--------: |
| `package.json`                           | Framer Motion追加                     |    [o]     |
| `app/globals.css`                        | 色調変更                              |    [o]     |
| `app/page.tsx`                           | HeroSectionコンポーネントの使用       |    [o]     |
| `app/components/HeroSection.tsx`         | **新規作成** - ヒーローアニメーション |    [o]     |
| `app/components/Header.tsx`              | ロードアニメーション追加              |    [o]     |
| `app/components/ProductGrid.tsx`         | スクロールアニメーション追加          |    [o]     |
| `app/components/ProductCategoryTabs.tsx` | タブ切り替えアニメーション追加        |    [o]     |
| `app/components/ui/card-product.tsx`     | ホバー色確認（変更不要と確認）        |    [o]     |

---

## 備考

- 既存のホバーアニメーション（CSSベース）は維持
- Framer Motionの `whileInView` で `viewport: { once: true }` を設定し、一度だけアニメーション
- `staggerChildren` で子要素を順次アニメーション
- パフォーマンスを考慮し、アニメーションは控えめに設定

---

## 実装後の更新

### 進捗状況の更新

各タスク完了時に進捗状況テーブルを更新する:

- `[ ]` → `[~]` : 作業開始時
- `[~]` → `[o]` : 作業完了時
- 備考欄に補足情報があれば記載
- タスクの見出しに「[完了]」を追記する

### 仕様変更があった場合

実装中に仕様変更があった場合は、該当タスクのセクションを更新する:

- コード例を実際の実装に合わせて修正
- 変更理由を備考として追記

### 完了時の更新

全タスク完了後:

1. ステータスを「進行中」→「完了」に変更
2. 完了日を追記
3. 実際に変更したファイル一覧を確認・更新
4. 検証結果をチェックリストに記入

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
