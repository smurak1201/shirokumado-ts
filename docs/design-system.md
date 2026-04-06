# デジタル庁デザインシステム リファレンス

デジタル庁が公開する、行政機関・公共機関向けのデザインアセット集。
誰でも無料で利用可能。本プロジェクトではUI/アクセシビリティの参考として採用。

- 公式サイト: https://design.digital.go.jp/dads/
- バージョン: v2.11.1
- ミッション: 「誰一人取り残されない、人に優しいデジタル化を。」

## プロジェクトでの導入方法

### Tailwind CSS プラグイン

```css
/* globals.css */
@import 'tailwindcss';
@plugin '@digital-go-jp/tailwind-theme-plugin';
```

パッケージ: `@digital-go-jp/tailwind-theme-plugin` (v0.3.4)

## カラートークン

### ニュートラルカラー（solid-gray）

プロジェクトでは Tailwind デフォルトの `gray-*` ではなく `solid-gray-*` を使用する。

| トークン | HEX | 用途 |
|---------|-----|------|
| `solid-gray-900` | #1a1a1a | 本文テキスト、ボタン背景 |
| `solid-gray-800` | #333333 | 強調テキスト |
| `solid-gray-700` | #4d4d4d | 副テキスト |
| `solid-gray-600` | #666666 | ラベルテキスト |
| `solid-gray-536` | #767676 | 説明テキスト（WCAG AA 4.5:1 達成） |
| `solid-gray-420` | #949494 | フォームのボーダー |
| `solid-gray-200` | #cccccc | カードのボーダー |
| `solid-gray-100` | #e6e6e6 | テーブルのボーダー、ホバー背景 |
| `solid-gray-50` | #f2f2f2 | 非アクティブボタン背景 |

### セマンティックカラー

| トークン | HEX | 用途 |
|---------|-----|------|
| `success-1` | #259d63 | 成功、正の変化 |
| `success-2` | #197a4b | 成功（強調） |
| `error-1` | #ec0000 | エラー |
| `error-2` | #ce0000 | エラー（強調） |
| `warning-orange-1` | #fb5b01 | 警告 |
| `warning-yellow-1` | #b78f00 | 注意 |
| `focus-blue` | #0877d7 | フォーカスリング |

### プリミティブカラー

Blue, Green, Red, Orange 等の各色は 50-1200 の13段階で提供される。
チャートカラーには 600 番台を基本に使用。

## 余白

8px を基準単位とし、倍数で構成する。

| 値 | Tailwind | 用途 |
|----|---------|------|
| 8px | `gap-2`, `p-2` | 要素間の最小間隔 |
| 16px | `gap-4`, `p-4` | カード内パディング |
| 24px | `gap-6`, `p-6` | セクション間 |
| 32px | `gap-8`, `p-8` | 大きなセクション間 |

## タッチターゲット

ボタン・リンク等のクリック/タップ可能な要素は **44px 以上** のターゲット領域を確保する。

```tsx
// ボタン: py-2.5 で約44px
<button className="px-4 py-2.5 text-sm">ボタン</button>

// アイコンボタン: min-h-11 min-w-11 で 44x44px
<button className="min-h-11 min-w-11">
```

## コントラスト比

| 要素 | 最低比率 | 根拠 |
|------|---------|------|
| 通常テキスト | 4.5:1 | WCAG 2.2 SC 1.4.3 |
| 大きいテキスト（18px以上 or 14px太字） | 3:1 | WCAG 2.2 SC 1.4.3 |
| UIコンポーネントの境界 | 3:1 | WCAG 2.2 SC 1.4.11 |

## Border Radius

プラグインが提供するトークン:

| トークン | 値 | 用途 |
|---------|-----|------|
| `rounded-4` | 0.25rem | - |
| `rounded-6` | 0.375rem | ボタン、フォーム |
| `rounded-8` | 0.5rem | カード |
| `rounded-12` | 0.75rem | - |
| `rounded-16` | 1rem | - |
| `rounded-full` | 完全な円 | バッジ |

## Shadow / Elevation

`shadow-1` から `shadow-8` まで 8段階。数字が大きいほど影が強い。

## ブレークポイント

| トークン | 値 | 用途 |
|---------|-----|------|
| `desktop:` | 48em (768px) | デスクトップ |
| `desktop-admin:` | 62em (992px) | 管理画面 |

Tailwind デフォルトの `sm:`, `md:`, `lg:` も引き続き使用可能。

## フォントサイズトークン

プラグインは `text-std-16N-170` のような複合トークンを提供する。
命名規則: `[カテゴリ]-[サイズ][ウェイト]-[行高]`

- `std-16N-170`: 16px, Normal(400), line-height 1.7 (本文)
- `std-20B-160`: 20px, Bold(700), line-height 1.6 (見出し)
- `dns-14N-130`: 14px, Normal(400), line-height 1.3 (Dense/詰め)

## アクセシビリティ

- WCAG 2.2 / JIS X 8341-3:2016 準拠
- 色のみに依存しない情報伝達（下線、アイコン等を併用）
- キーボード操作対応（フォーカスリング表示）
- スクリーンリーダー対応（適切な aria 属性）

### フォーカスリング

```tsx
className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
```

## 外部リソース

- GitHub: https://github.com/digital-go-jp/tailwind-theme-plugin
- npm: https://www.npmjs.com/package/@digital-go-jp/tailwind-theme-plugin
- デザイントークン: https://www.npmjs.com/package/@digital-go-jp/design-tokens
- React サンプル: https://github.com/digital-go-jp/design-system-example-components
- Figma: https://www.figma.com/community/file/1255349027535859598
