# 画像の保存場所ガイド

フロントエンドで使用する画像の保存場所を決定するためのガイドです。

## 📋 使い分けの原則

### ✅ Blob Storage を使用する場合

**動的なコンテンツ**（ユーザーがアップロード・変更する画像）

- ✅ **商品画像**（現在実装済み）

  - ユーザーがアップロードする商品の写真
  - データベースに保存される画像 URL
  - 例: `https://xxx.public.blob.vercel-storage.com/products/1234567890_product.jpg`

- ✅ **ユーザーがアップロードする画像全般**
  - プロフィール画像
  - ギャラリー画像
  - その他、CMS 経由で管理する画像

**メリット**:

- 動的に追加・削除・変更が可能
- データベースと連携しやすい
- CDN 配信で高速アクセス
- ストレージ容量の拡張が容易

### ✅ `public/` ディレクトリを使用する場合

**静的なアセット**（ビルド時に確定している画像）

- ✅ **ロゴ・ブランディング画像**

  - サイトロゴ
  - ファビコン
  - OGP 画像

- ✅ **UI 要素**

  - アイコン
  - ボタンの背景画像
  - デコレーション画像

- ✅ **固定コンテンツ**
  - 店舗の外観写真（変更頻度が低い）
  - メニューの背景画像
  - その他、デザインに組み込まれた画像

**メリット**:

- Next.js の自動最適化が適用される
- ビルド時に最適化されるため高速
- バンドルに含まれるため、CDN 不要で配信可能
- シンプルなパスでアクセス可能（`/logo.png`）

## 🎯 推奨される使い分け

### 現在のプロジェクトでの推奨

```
Blob Storage:
├── products/              # 商品画像（実装済み）
│   └── [timestamp]_[filename].jpg
└── (将来的に追加する場合)
    ├── gallery/           # ギャラリー画像
    └── user-uploads/      # ユーザーアップロード画像

public/:
├── images/
│   ├── logo.png          # サイトロゴ
│   ├── favicon.ico        # ファビコン
│   ├── og-image.jpg       # OGP画像
│   └── icons/            # アイコン類
│       ├── menu-icon.svg
│       └── close-icon.svg
└── (Next.jsデフォルト)
    ├── next.svg
    └── vercel.svg
```

## 📝 実装例

### Blob Storage の画像を使用する場合

```tsx
// 商品画像など、データベースから取得したURLを使用
<img
  src={product.imageUrl} // Blob StorageのURL
  alt={product.name}
  className="..."
/>
```

**注意**: `next.config.ts` で Blob Storage のドメインを許可する必要があります（既に設定済み）

### `public/` の画像を使用する場合

```tsx
import Image from 'next/image';

// Next.js Imageコンポーネントを使用（推奨）
<Image
  src="/images/logo.png"  // public/からの相対パス
  alt="サイトロゴ"
  width={200}
  height={50}
  priority  // 重要画像の場合は優先読み込み
/>

// または通常のimgタグでも可能
<img
  src="/images/logo.png"  // public/からの相対パス
  alt="サイトロゴ"
/>
```

## 🔍 判断基準

以下の質問に答えて、適切な保存場所を決定してください：

1. **画像は動的に変更されますか？**

   - ✅ はい → Blob Storage
   - ❌ いいえ → `public/`

2. **画像はデータベースと連携しますか？**

   - ✅ はい → Blob Storage
   - ❌ いいえ → `public/`

3. **画像はユーザーがアップロードしますか？**

   - ✅ はい → Blob Storage
   - ❌ いいえ → `public/`

4. **画像はデザインの一部として固定されていますか？**
   - ✅ はい → `public/`
   - ❌ いいえ → Blob Storage

## 💡 ベストプラクティス

### Next.js Image コンポーネントの使用

`public/` の画像は、可能な限り Next.js の `Image` コンポーネントを使用してください：

```tsx
import Image from 'next/image';

// ✅ 推奨: Next.js Imageコンポーネント
<Image
  src="/images/logo.png"
  alt="ロゴ"
  width={200}
  height={50}
  priority  // 重要画像の場合
/>

// ❌ 避ける: 通常のimgタグ（最適化されない）
<img src="/images/logo.png" alt="ロゴ" />
```

**メリット**:

- 自動的な画像最適化（WebP/AVIF 変換）
- レスポンシブ画像の自動生成
- 遅延読み込み（`loading="lazy"`）
- レイアウトシフトの防止

### Blob Storage の画像の場合

Blob Storage の画像は、通常の `img` タグを使用します（Next.js Image も使用可能ですが、`next.config.ts` の設定が必要）：

```tsx
// ✅ 通常のimgタグ（シンプル）
<img
  src={product.imageUrl}
  alt={product.name}
  loading="lazy"  // 遅延読み込み
  className="..."
/>

// ✅ Next.js Imageコンポーネント（最適化が必要な場合）
<Image
  src={product.imageUrl}
  alt={product.name}
  width={500}
  height={300}
  className="..."
/>
```

## 📊 パフォーマンス比較

| 項目           | Blob Storage        | public/               |
| -------------- | ------------------- | --------------------- |
| 読み込み速度   | CDN 経由で高速      | ビルド時最適化で高速  |
| 画像最適化     | 手動または API 経由 | Next.js が自動最適化  |
| 動的変更       | ✅ 可能             | ❌ ビルドが必要       |
| ストレージ容量 | 拡張可能            | バンドルサイズに影響  |
| コスト         | 使用量に応じて      | 無料（Vercel の場合） |

## 🎨 フロントエンド開発での推奨

### 1. ロゴ・ブランディング画像

```tsx
// public/images/logo.png に配置
import Image from "next/image";

<Image src="/images/logo.png" alt="白熊堂" width={150} height={50} priority />;
```

### 2. アイコン

```tsx
// public/images/icons/ に配置
<img src="/images/icons/menu-icon.svg" alt="メニュー" className="w-6 h-6" />
```

### 3. 背景画像・デコレーション

```tsx
// public/images/backgrounds/ に配置
<div
  className="bg-cover bg-center"
  style={{ backgroundImage: "url(/images/backgrounds/hero.jpg)" }}
>
  {/* コンテンツ */}
</div>
```

### 4. 商品画像（既存実装）

```tsx
// Blob Storageから取得したURLを使用
<img src={product.imageUrl} alt={product.name} loading="lazy" />
```

## 🔧 設定の確認

### `next.config.ts` の設定

Blob Storage の画像を Next.js Image コンポーネントで使用する場合、以下の設定が必要です（既に設定済み）：

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
    },
  ],
}
```

## 📚 参考リンク

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Static File Serving](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
