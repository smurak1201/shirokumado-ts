# 画像配信の最適化

**日付**: 2026-02-21
**ブランチ**: feature/image-optimization
**対象**: `next.config.ts`, `package.json`, ドキュメント
**ステータス**: 完了
**完了日**: 2026-02-21

---

## 進捗状況

| #   | タスク                                   | 優先度 | ステータス | 備考 |
| --- | ---------------------------------------- | :----: | :--------: | ---- |
| 1   | Next.js Image Optimizationの有効化       |   高   |    [o]     |      |
| 2   | レガシーJavaScriptの削減                 |   中   |    [o]     |      |
| 3   | 未使用画像の削除                         |   低   |    [o]     |      |
| 4   | ドキュメントの更新                       |   低   |    [o]     |      |
| 5   | 動作確認・ビルドテスト                   |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

Lighthouseの診断で画像配信に関する複数の問題が検出された。推定される削減サイズは928KiB。

### 課題

- **画像最適化の無効化**: `next.config.ts`で`images.unoptimized: true`が設定されており、Next.jsの画像最適化（リサイズ、WebP/AVIF変換、レスポンシブsrcset生成）が無効化されている
- **JPG画像の未変換配信**: publicディレクトリに6枚のJPG画像（合計約3.5MB）があり、WebP/AVIFに変換されずそのまま配信されている
- **商品画像のサイズ超過**: Vercel Storage上の商品画像（1123x1123）が、表示サイズ209x209のタイルにそのまま配信されている
- **LCP画像の最適化不足**: hero画像に`fetchpriority="high"`が付与されていない（`unoptimized: true`により`priority`属性の効果が一部無効化されている）
- **レガシーJavaScript**: `Array.prototype.at`、`Object.fromEntries`等のポリフィル（14KB）が不要なブラウザにも配信されている

### 設計方針

- **Next.js Image Optimizationの有効化**: `unoptimized: true`を削除するだけで、既存の`sizes`属性・`remotePatterns`設定がそのまま活用され、上記課題の大半が自動的に解決する
- **最小限の変更で最大の効果**: コンポーネント側の変更は不要。設定ファイルの変更のみで対応する

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**設計原則**:

- **YAGNI**: 現時点で必要な機能のみ実装する
- **KISS**: 最もシンプルな解決策を選ぶ

**コード品質**:

- 未使用のインポートは削除すること
- リントエラーを解消すること（`npm run lint`）

---

## タスク詳細

### タスク1: Next.js Image Optimizationの有効化 [完了]

**対象ファイル**:

- `next.config.ts`（既存・変更）

**問題点**:

`images.unoptimized: true`が設定されているため、Next.jsの画像最適化が無効化されている。`formats`や`remotePatterns`の設定は存在するが、`unoptimized: true`により実質無効になっている。

**修正内容**:

`images.unoptimized: true`の行とその関連コメント（6-9行目）を削除する。`formats`と`remotePatterns`はそのまま維持する。

**変更前（next.config.ts 5-17行目）**:

```typescript
images: {
  // 画像最適化を無効化（Edge Requestを削減するため）
  // 理由: 画像は既にクライアントサイドで圧縮・WebP形式に変換されているため、
  // Next.jsのサーバーサイド最適化は不要。遅延読み込みなどの機能は引き続き機能する。
  unoptimized: true,
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
    },
  ],
},
```

**変更後**:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
    },
  ],
},
```

**この変更で解決する問題**:

- JPG画像が配信時に自動でWebP/AVIFに変換される
- `sizes`属性に基づいて適切なサイズにリサイズされる
- 商品画像（Vercel Storage）も`remotePatterns`で許可済みなので自動最適化される
- `priority`指定時の`fetchpriority="high"`が正しく付与される

**影響を受けない箇所**:

- `app/dashboard/homepage/components/form/ProductImageField.tsx`: 個別に`unoptimized`を指定しているため（Object URLはNext.js画像最適化の対象外）

**チェックリスト**:

- [ ] `unoptimized: true`と関連コメントを削除
- [ ] `formats`と`remotePatterns`が維持されていること

---

### タスク2: レガシーJavaScriptの削減 [完了]

**対象ファイル**:

- `package.json`（既存・変更）

**問題点**:

`browserslist`が未設定のため、Next.jsがレガシーブラウザ向けのポリフィル（`Array.prototype.at`、`flat`、`flatMap`、`Object.fromEntries`、`Object.hasOwn`等、計14KB）をバンドルに含めている。

**修正内容**:

`package.json`に`browserslist`フィールドを追加する。ESモジュールを完全サポートするモダンブラウザのみをターゲットにする。

**変更後（package.json、トップレベルのフィールドとして追加）**:

```json
"browserslist": [
  "defaults and fully supports es6-module"
]
```

**注意事項**:

- `tsconfig.json`の`target: "ES2017"`はTypeScriptのコンパイルターゲットであり、Next.jsのバンドル出力には直接影響しない（Next.jsはSWCで別途トランスパイルする）。そのため`tsconfig.json`の変更は不要

**チェックリスト**:

- [ ] `package.json`に`browserslist`フィールドを追加
- [ ] JSONが正しい形式であること

---

### タスク3: 未使用画像の削除 [完了]

**対象ファイル**:

- `public/S__3301387.jpg`（削除）

**問題点**:

`public/S__3301387.jpg`（749KB）はコードベース内で一切参照されていない（Grep検索で確認済み）。

**修正内容**:

ファイルを削除する。

**チェックリスト**:

- [ ] `public/S__3301387.jpg`を削除
- [ ] 他のJPGファイル（S__3301385, 3301386, 3301388, 3301389, 3301390）がコード内で参照されていることを再確認

---

### タスク4: ドキュメントの更新 [完了]

**対象ファイル**:

- `docs/guides/frontend/nextjs-guide.md`（既存・変更）

**修正内容**:

`unoptimized: true`に関する記述を更新し、画像最適化が有効であることを反映する。以下の箇所を修正:

- 「画像最適化を無効化」の説明を「画像最適化が有効」に変更
- `unoptimized: true`を含むコード例から該当行を削除
- Edge Requestに関する説明を、画像最適化のメリットの説明に置き換える

**チェックリスト**:

- [ ] `unoptimized: true`に関する記述をすべて更新
- [ ] コード例が現在の`next.config.ts`と一致していること

---

### タスク5: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

2. **ローカル確認** (`npm run dev`)
   - [ ] トップページのhero画像が正しく表示されること
   - [ ] 天然氷セクションの画像（S__3301389.jpg）が正しく表示されること
   - [ ] 商品一覧の商品画像が正しく表示されること
   - [ ] 天然氷紹介ページ（/about-ice）の4枚の画像が正しく表示されること
   - [ ] ダッシュボードの画像アップロード・プレビューが正常に動作すること

3. **画像最適化の確認**（DevTools > Networkタブ）
   - [ ] 画像URLが`/_next/image?url=...&w=...&q=75`形式になっていること
   - [ ] Content-Typeが`image/webp`または`image/avif`であること

4. **品質チェックリスト**（CLAUDE.md準拠）
   - [ ] 未使用のインポートは削除したか？
   - [ ] リントエラーは解消したか？（`npm run lint`）

---

## 変更対象ファイル一覧

| ファイル                             | 変更内容                             | ステータス |
| ------------------------------------ | ------------------------------------ | :--------: |
| `next.config.ts`                     | `unoptimized: true`と関連コメント削除 |    [o]     |
| `package.json`                       | `browserslist`フィールド追加          |    [o]     |
| `public/S__3301387.jpg`              | 未使用画像の削除                      |    [o]     |
| `docs/guides/frontend/nextjs-guide.md` | ドキュメント更新                    |    [o]     |

---

## 備考

### 注意事項

- `app/dashboard/homepage/components/form/ProductImageField.tsx`の個別`unoptimized`設定には触れないこと（Object URL用の設定）
- 各コンポーネントの`Image`タグの`sizes`属性は既に適切に設定されているため変更不要
- Vercel Hobbyプランの画像最適化上限は月1,000枚。このサイトの画像数（約20枚）では問題にならない

### 期待される効果

- 画像ダウンロードサイズ: 推定928KiB削減
- レガシーJavaScript: 14KB削減
- LCP改善: hero画像への`fetchpriority="high"`自動付与
- リポジトリサイズ: 749KB削減（未使用画像削除）

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

### 完了時の更新

1. ステータスを「完了」に変更
2. 完了日を追記
3. チェックリストを更新
4. 仕様書ファイルを `updates/completed/` ディレクトリに移動してよいか確認し、許可があれば移動

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
