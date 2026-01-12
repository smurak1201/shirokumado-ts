import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像最適化の設定
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

  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
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
