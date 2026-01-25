# ヒーローセクション パララックス効果 スマホ表示の修正

**日付**: 2026-01-25
**ブランチ**: feature/hero-parallax
**対象**: ヒーローセクション（`app/components/HeroSection.tsx`）
**ステータス**: 完了
**完了日**: 2026-01-25

---

## 進捗状況

| #   | タスク                             | 優先度 | ステータス | 備考 |
| --- | ---------------------------------- | :----: | :--------: | ---- |
| 1   | 問題の特定                         |   高   |    [o]     |      |
| 2   | globals.cssに--header-height追加   |   高   |    [o]     |      |
| 3   | globals.cssのパララックスCSS修正   |   高   |    [o]     |      |
| 4   | HeroSection.tsxをnext/imageに変更  |   高   |    [o]     |      |
| 5   | page.tsxのヘッダースペーサー修正   |   中   |    [o]     |      |
| 6   | 動作確認・ビルドテスト             |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

パララックス効果の実装後、スマホ表示で以下の問題が発生した。

### 課題

- **課題1**: スマホで画像がズームされて表示される（画像全体が見えない）
- **課題2**: 画像の下に余白ができる

### 原因分析

```
ビューポート構造:
┌─────────────────┐ 0px     ← 画像の開始位置（top: 0）
│ ヘッダー(80px)   │
├─────────────────┤ 80px    ← セクション開始位置
│                 │
│  セクション      │          ← この範囲を画像がカバーする必要がある
│                 │
├─────────────────┤ 372px   ← セクション終了位置
│                 │
```

- 画像は`top: 0`から始まり、高さは`h-screen`（100vh）
- セクションはヘッダースペーサー（80px）の下から始まる
- `background-size: cover`で画像が100vhに引き伸ばされ、ズームして見える
- セクションの高さ（40vh）と画像の表示位置がずれて余白が発生

### 設計方針

- **方針1**: `next/image`を使用して画像サイズを動的に取得
- **方針2**: セクションの高さを画像のアスペクト比に合わせる
- **方針3**: 画像コンテナの高さ = セクション高さ + ヘッダー高さ
- **方針4**: ヘッダー高さをCSS変数`--header-height`で一元管理

### マジックナンバー回避

画像サイズやヘッダー高さをハードコードすると、変更時に複数箇所の修正が必要になる。

| 項目 | 悪い例（マジックナンバー） | 良い例（動的/変数） |
| --- | --- | --- |
| 画像アスペクト比 | `h-[75vw]`（1108/1477≈0.75） | `aspect-ratio: var(--hero-width) / var(--hero-height)` |
| 画像高さ計算 | `calc(100vw * 0.75 + 80px)` | `calc(100vw * var(--hero-height) / var(--hero-width) + var(--header-height))` |
| ヘッダー高さ | `h-20`、`80px` | `var(--header-height)` |

**メリット**:
- 画像を変更しても自動的にアスペクト比が更新される
- ヘッダー高さを変更しても1箇所（`:root`）の修正で済む

---

## タスク詳細

### タスク1: 問題の特定 [完了]

**確認項目**:

1. DevToolsでスマホ表示（390px幅など）を確認
2. `.hero-section`と`.hero-image-container`のサイズを確認
3. 画像がセクション全体をカバーしていないことを確認

---

### タスク2: globals.cssに--header-height追加 [完了]

**対象ファイル**:

- `app/globals.css`（既存・変更）

**修正内容**:

`:root`にヘッダーの高さをCSS変数として追加する。

**実装例（3行目付近、:root内）**:

```css
/* 変更前 */
:root {
  --background: #ffffff;
  --foreground: #171717;
  /* ... */
}

/* 変更後 */
:root {
  /*
   * ヘッダーの高さ
   * 使用箇所:
   * - page.tsx: ヘッダースペーサーの高さ
   * - .hero-image-container: パララックス画像の高さ計算
   */
  --header-height: 5rem;
  --background: #ffffff;
  --foreground: #171717;
  /* ... */
}
```

**チェックリスト**:

- [o] `--header-height: 5rem`を追加
- [o] コメントで使用箇所を明記

---

### タスク3: globals.cssのパララックスCSS修正 [完了]

**対象ファイル**:

- `app/globals.css`（既存・変更）

**修正内容**:

パララックス効果のCSSを、CSS変数を使用した動的な高さ計算に変更する。

**実装例（パララックス効果セクションを置き換え）**:

```css
/* app/globals.css（パララックス効果セクション） */

/*
 * パララックス効果（スマホ対応）
 * 参考: https://daian-kichijitsu.com/parallax/
 *
 * ## 仕組み
 * 1. .hero-image-container: position: fixedで画像を固定
 * 2. .section-inner: clip-path: inset(0)で「窓」として機能
 * 3. スクロール時、窓（セクション）が動き、固定画像の異なる部分が見える
 *
 * ## スマホでの課題と解決策
 * 課題: セクションはヘッダースペーサー分（--header-height）下にあるが、
 *       画像はtop: 0から始まるため、画像の高さが足りないと下に余白ができる
 *
 * ビューポート構造:
 * ┌─────────────────┐ 0px
 * │ ヘッダー(80px)   │
 * ├─────────────────┤ 80px ← セクション開始
 * │ セクション       │        ↑ 画像はここをカバーする必要がある
 * ├─────────────────┤        ← セクション終了
 * │                 │
 *
 * 解決策: 画像の高さ = セクション高さ + ヘッダー高さ
 */

/* clip-pathで切り抜き、「窓」として機能させる */
.section-inner {
  clip-path: inset(0 0 0 0);
}

/*
 * ヒーローセクション
 * --hero-width, --hero-height: HeroSection.tsxから画像サイズが渡される
 */
.hero-section {
  width: 100vw;
  /* スマホ: 画像のアスペクト比に合わせてセクションの高さを決定 */
  aspect-ratio: var(--hero-width) / var(--hero-height);
}

/* パララックス用の画像コンテナ */
.hero-image-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  /*
   * スマホ: セクションの高さ + ヘッダー分の高さ
   * これにより、ヘッダー下から始まるセクション全体を画像がカバーできる
   */
  height: calc(100vw * var(--hero-height) / var(--hero-width) + var(--header-height));
}

/* デスクトップ（768px以上）: vhベースの高さに切り替え */
@media (min-width: 768px) {
  .hero-section {
    aspect-ratio: unset;
    height: 60vh;
    min-height: 125px;
  }

  .hero-image-container {
    /* デスクトップ: 画面全体をカバーしてパララックス効果を実現 */
    height: 100vh;
  }
}

/* 大画面（1024px以上）: セクションを大きく表示 */
@media (min-width: 1024px) {
  .hero-section {
    height: 70vh;
    min-height: 150px;
  }
}
```

**チェックリスト**:

- [o] `.hero-bg`クラスを削除（`next/image`に移行するため）
- [o] `.hero-section`に`aspect-ratio`を追加
- [o] `.hero-image-container`の高さ計算を追加
- [o] メディアクエリでデスクトップ/大画面の設定を追加
- [o] コメントで仕組みを説明

---

### タスク4: HeroSection.tsxをnext/imageに変更 [完了]

**対象ファイル**:

- `app/components/HeroSection.tsx`（既存・変更）

**修正内容**:

`background-image`から`next/image`に変更し、画像サイズをCSS変数として渡す。

**実装例（全体を置き換え）**:

```tsx
// app/components/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/public/hero.webp";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 *
 * ## パララックス効果の仕組み（スマホ対応）
 * 参考: https://daian-kichijitsu.com/parallax/
 *
 * 1. 画像を`position: fixed`で画面に固定
 * 2. セクションに`clip-path: inset(0)`を設定し「窓」として機能させる
 * 3. スクロールすると窓（セクション）が動き、固定された画像の異なる部分が見える
 *
 * ## スマホ対応のポイント
 * - 画像サイズをCSS変数で渡し、セクションの高さを画像のアスペクト比に合わせる
 * - 画像コンテナの高さは「セクション高さ + ヘッダー高さ」でセクション全体をカバー
 *   （セクションはヘッダースペーサー分だけ下にあるため）
 * - 画像を変更してもCSS変数で自動対応（マジックナンバー不要）
 *
 * 関連ファイル:
 * - globals.css: パララックス効果のCSS定義
 * - page.tsx: ヘッダースペーサー（--header-height）
 */
export default function HeroSection() {
  return (
    <section
      className="hero-section relative w-full"
      style={
        {
          // 画像サイズをCSS変数として渡す（globals.cssでアスペクト比計算に使用）
          "--hero-width": heroImage.width,
          "--hero-height": heroImage.height,
        } as React.CSSProperties
      }
    >
      {/*
       * clip-pathで切り抜くコンテナ
       * このセクションが「窓」となり、固定された画像の一部だけが見える
       */}
      <div className="section-inner absolute inset-0 w-full h-full">
        {/*
         * パララックス効果用の背景画像
         * position: fixedで固定され、スクロールしても動かない
         * スタイルはglobals.cssの.hero-image-containerで定義
         */}
        <div className="hero-image-container z-[-1]">
          <Image
            src={heroImage}
            alt="ヒーロー画像"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* フェードインアニメーション用のmotion.div */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* グラデーションオーバーレイ - 淡いブルー系 */}
          <div className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
```

**チェックリスト**:

- [o] `next/image`と画像インポートを追加
- [o] `heroImage.width`と`heroImage.height`をCSS変数として渡す
- [o] `hero-bg`クラスを`hero-image-container`に変更
- [o] `Image`コンポーネントで画像を表示
- [o] JSDocコメントを更新

---

### タスク5: page.tsxのヘッダースペーサー修正 [完了]

**対象ファイル**:

- `app/page.tsx`（既存・変更）

**修正内容**:

ヘッダースペーサーの高さをCSS変数`--header-height`を参照するように変更する。

**実装例（37行目付近）**:

```tsx
// 変更前
<FixedHeader />
<div className="h-20" /> {/* ヘッダーの高さ分のスペーサー */}

// 変更後
<FixedHeader />
{/*
 * ヘッダーの高さ分のスペーサー
 * CSS変数 --header-height（globals.cssで定義）を使用
 * この高さはHeroSectionのパララックス効果の計算にも使用される
 */}
<div style={{ height: "var(--header-height)" }} />
```

**チェックリスト**:

- [o] `h-20`クラスを`style={{ height: "var(--header-height)" }}`に変更
- [o] コメントでCSS変数との関連を説明

---

### タスク6: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **スマホ表示確認** (`npm run dev` + DevTools)
   - [o] 画像全体が表示されること（ズームされていない）
   - [o] 画像の下に余白がないこと
   - [o] スクロール時にパララックス効果が動作すること

2. **デスクトップ表示確認**
   - [o] パララックス効果が動作すること
   - [o] 表示が崩れていないこと

3. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

---

## 変更対象ファイル一覧

| ファイル                         | 変更内容                           | ステータス |
| -------------------------------- | ---------------------------------- | :--------: |
| `app/globals.css`                | `--header-height`追加、CSS修正     |    [o]     |
| `app/components/HeroSection.tsx` | `next/image`使用、CSS変数渡し      |    [o]     |
| `app/page.tsx`                   | ヘッダースペーサーをCSS変数に変更  |    [o]     |

---

## 備考

### なぜこの解決策が有効か

1. **画像サイズを動的に取得**: `next/image`のインポートで`heroImage.width`と`heroImage.height`が自動取得される
2. **CSS変数で連携**: 画像サイズをCSS変数として渡すことで、CSSでアスペクト比を計算できる
3. **ヘッダー高さの考慮**: 画像の高さにヘッダー分を加算することで、セクション全体をカバー
4. **マジックナンバー回避**: 画像を変更しても自動的にアスペクト比が更新される

### 関連ファイルの依存関係

```
globals.css
├── --header-height: 5rem（ヘッダー高さの定義）
├── .hero-section: aspect-ratio計算（--hero-width, --hero-height使用）
└── .hero-image-container: height計算（--header-height使用）

HeroSection.tsx
├── heroImage.width, heroImage.height → CSS変数として渡す
└── .hero-image-container, .hero-section クラス使用

page.tsx
└── ヘッダースペーサー: var(--header-height)使用
```

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` → `[~]` : 作業開始時
- `[~]` → `[o]` : 作業完了時

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - 上記の状態遷移ルールに従って各項目を更新

### 完了時の更新

1. ステータスを「完了」に変更
2. 完了日を追記
3. チェックリストを更新

```markdown
**ステータス**: 完了
**完了日**: 2026-01-25
```
