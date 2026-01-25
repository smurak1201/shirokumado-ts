# トップページ デザイン改修

**日付**: 2026-01-25
**ブランチ**: feature/frontend-redesign
**対象**: トップページ（app/page.tsx）
**ステータス**: 進行中

---

## 進捗状況

| # | タスク | ステータス | 備考 |
|---|--------|:----------:|------|
| 1 | Framer Motionインストール | [ ] | |
| 2 | 色調変更（CSS変数更新） | [ ] | |
| 3 | ヒーローセクションのアニメーション | [ ] | |
| 4 | ヘッダーのアニメーション | [ ] | |
| 5 | 商品タイルのスクロールアニメーション | [ ] | |
| 6 | タブ切り替えアニメーション | [ ] | |
| 7 | 商品カードのホバー色調整 | [ ] | |
| 8 | 動作確認・ビルドテスト | [ ] | |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

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

### 改修のポイント
1. **色調変更**: 白を基調とし、淡いブルーをアクセントに使用
2. **アニメーション追加**: ページロード時・スクロール時のモダンなアニメーション
3. **アクセシビリティ対応**: 動きを減らす設定のユーザーへの配慮

---

## 変更内容

### 1. 色調変更（白基調 + 淡いブルーアクセント）

白を基調とし、ホバーや区切り線などのアクセントに淡いブルーを使用。清潔感と涼しさを両立。

| 要素 | 変更前 | 変更後 |
|------|--------|--------|
| 背景 | 白 | 白（維持） |
| プライマリ | グレー | 淡いブルー |
| アクセント | グレー | 淡いブルー |
| オーバーレイ | background色 | 淡いブルー系グラデーション |

```css
/* 変更後のカラーパレット */
--primary: 200 60% 65%;        /* 淡いブルー */
--accent: 200 40% 96%;         /* とても淡いブルー */
```

### 2. アニメーション追加（Framer Motion使用）

**使用ライブラリ**: [Framer Motion](https://www.framer.com/motion/)

```bash
npm install framer-motion
```

#### 2.1 ページロード時
- ヒーロー画像: フェードイン + 微細なズーム効果（`motion.div` + `initial`/`animate`）
- ヘッダー: ロゴとナビゲーションの順次フェードイン（`staggerChildren`）

#### 2.2 スクロール連動
- 商品タイル: 画面内に入ったら順次フェードイン（`whileInView` + `staggerChildren`）
- Framer Motionの`whileInView`を使用（Intersection Observer内蔵）

#### 2.3 タブ切り替え
- カテゴリー切り替え時にコンテンツがフェードイン（`AnimatePresence`）

```tsx
// 使用例: スクロールアニメーション
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  {/* コンテンツ */}
</motion.div>
```

### 3. アクセシビリティ対応

Framer Motionは`prefers-reduced-motion`を自動的にサポート。追加でCSSでも対応。

```tsx
// Framer Motionの設定（自動対応）
// ユーザーが動きを減らす設定にしている場合、アニメーションは自動的に無効化される

// 追加のCSS対応
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | Framer Motionの追加 |
| `app/globals.css` | 色調・アニメーション定義 |
| `app/page.tsx` | ヒーローセクションのスタイル・アニメーション |
| `app/components/Header.tsx` | ロードアニメーション |
| `app/components/ProductCategoryTabs.tsx` | タブ切り替えアニメーション |
| `app/components/ProductGrid.tsx` | スクロールアニメーション |
| `app/components/ProductTile.tsx` | タイルアニメーション |
| `app/components/ui/card-product.tsx` | ホバー色調整 |

---

## 検証方法

1. `npm run dev` でローカル開発サーバー起動
2. ブラウザでトップページを確認
   - 白基調のデザインで、アクセントに淡いブルーが使われていることを確認
   - ページロード時のアニメーションを確認
   - スクロールして商品タイルのアニメーションを確認
   - カテゴリータブを切り替えてアニメーションを確認
3. 開発者ツールで「prefers-reduced-motion: reduce」を設定し、アニメーションが無効になることを確認
4. `npm run build` でビルドエラーがないことを確認

---

## 備考

- 既存のホバーアニメーション（商品カードの影・浮き上がり効果など）は維持
- Framer Motionを使用し、宣言的で保守しやすいアニメーションを実装
- 過度なアニメーションを避け、ユーザー体験を損なわないよう配慮
- `prefers-reduced-motion`への対応はFramer Motionが自動的に処理
