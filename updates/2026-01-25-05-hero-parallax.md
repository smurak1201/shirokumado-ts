# ヒーローセクション パララックス効果の実装

**日付**: 2026-01-25
**ブランチ**: feature/hero-parallax
**対象**: ヒーローセクション（`app/components/HeroSection.tsx`）
**ステータス**: 完了
**完了日**: 2026-01-25

---

## 進捗状況

| #   | タスク                          | 優先度 | ステータス | 備考 |
| --- | ------------------------------- | :----: | :--------: | ---- |
| 1   | globals.cssにパララックスCSS追加 |   高   |    [o]     |      |
| 2   | HeroSection.tsxの作成           |   高   |    [o]     |      |
| 3   | page.tsxでの使用                |   高   |    [o]     |      |
| 4   | 動作確認・ビルドテスト          |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

ヒーローセクションにパララックス効果を追加し、視覚的な魅力を向上させる。

### 課題

- **課題1**: `background-attachment: fixed`はiOS Safariで動作しない
- **課題2**: スマホ対応のパララックス効果を実現する必要がある

### 設計方針

- **方針1**: `clip-path`を使用したパララックス手法を採用（参考: https://daian-kichijitsu.com/parallax/）
- **方針2**: 画像を`position: fixed`で固定し、セクションを「窓」として機能させる

---

## タスク詳細

### タスク1: globals.cssにパララックスCSS追加 [完了]

**対象ファイル**:

- `app/globals.css`（既存・変更）

**修正内容**:

パララックス効果用のCSSクラスを追加する。

**実装例**:

```css
/* app/globals.css（末尾に追加） */

/* パララックス効果（スマホ対応） */
/* 参考: https://daian-kichijitsu.com/parallax/ */
.section-inner {
  clip-path: inset(0 0 0 0);
}

.hero-bg {
  background-image: url("/hero.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

**チェックリスト**:

- [o] `.section-inner`クラスを追加（clip-pathで切り抜き）
- [o] `.hero-bg`クラスを追加（背景画像の設定）

---

### タスク2: HeroSection.tsxの作成 [完了]

**対象ファイル**:

- `app/components/HeroSection.tsx`（**新規作成**）

**修正内容**:

パララックス効果を持つヒーローセクションコンポーネントを作成する。

**実装例**:

```tsx
// app/components/HeroSection.tsx（新規作成）
"use client";

import { motion } from "framer-motion";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 *
 * ## パララックス効果の仕組み
 * 参考: https://daian-kichijitsu.com/parallax/
 *
 * 1. 画像を`position: fixed`で画面に固定
 * 2. セクションに`clip-path: inset(0)`を設定し「窓」として機能させる
 * 3. スクロールすると窓（セクション）が動き、固定された画像の異なる部分が見える
 */
export default function HeroSection() {
  return (
    <section className="relative h-[40vh] w-full md:h-[60vh] lg:h-[70vh]">
      {/* セクションの内側コンテナ（clip-pathで切り抜き） */}
      <div className="section-inner absolute inset-0 w-full h-full">
        {/* パララックス効果用の背景画像（position: fixedで固定） */}
        <div className="hero-bg fixed top-0 left-0 z-[-1] w-full h-screen" />

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

- [o] `HeroSection.tsx`を新規作成
- [o] `section-inner`でclip-path適用
- [o] `hero-bg`でposition: fixed適用
- [o] Framer Motionでフェードインアニメーション

---

### タスク3: page.tsxでの使用 [完了]

**対象ファイル**:

- `app/page.tsx`（既存・変更）

**修正内容**:

トップページでHeroSectionコンポーネントを使用する。

**実装例（10行目付近）**:

```tsx
// 変更前
// （HeroSectionのimportなし）

// 変更後
import HeroSection from "./components/HeroSection";
```

**実装例（40行目付近）**:

```tsx
// 変更前
<Header />
<div className="h-20" />
{/* ヒーローセクションなし */}

// 変更後
<Header />
<div className="h-20" /> {/* ヘッダーの高さ分のスペーサー */}

{/* ヒーローバナー */}
<HeroSection />
```

**チェックリスト**:

- [o] HeroSectionをインポート
- [o] ヘッダースペーサーの後にHeroSectionを配置

---

### タスク4: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [o] ヒーロー画像が表示されること
   - [o] スクロール時にパララックス効果が動作すること
   - [o] フェードインアニメーションが動作すること

2. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

---

## 変更対象ファイル一覧

| ファイル                         | 変更内容                        | ステータス |
| -------------------------------- | ------------------------------- | :--------: |
| `app/globals.css`                | パララックスCSS追加（末尾）     |    [o]     |
| `app/components/HeroSection.tsx` | **新規作成**                    |    [o]     |
| `app/page.tsx`                   | HeroSectionのインポート・使用   |    [o]     |

---

## 備考

### パララックス効果の仕組み

```
<section>                     ← セクション（高さ: 40vh〜70vh）
  <div class="section-inner">  ← clip-pathで切り抜き（窓）
    <div class="hero-bg">      ← position: fixed（画面全体に固定）
    </div>
  </div>
</section>
```

スクロールするとセクション（窓）が動き、固定された背景画像の異なる部分が見える。

### 参考

- 実装参考: https://daian-kichijitsu.com/parallax/
- Framer Motion: アニメーションライブラリ

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
