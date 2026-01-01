import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像最適化の設定
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  // 実験的な機能（必要に応じて）
  experimental: {
    // サーバーアクションの最適化
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 型チェックの設定
  typescript: {
    // 本番ビルド時に型エラーがある場合、ビルドを失敗させる
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
