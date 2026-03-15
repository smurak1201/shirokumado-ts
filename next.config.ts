import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    const cspDirectives = [
      "default-src 'self'",
      // JSON-LD（dangerouslySetInnerHTML）やNext.jsのインラインスクリプトに必要
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://maps.googleapis.com",
      // Tailwind CSSのインラインスタイルとGoogle Fontsに必要
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://maps.googleapis.com https://maps.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      // Google Maps Embed APIのiframeに必要
      "frame-src https://www.google.com https://maps.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
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
    // CSSをHTMLにインライン化し、<link>タグによるレンダリングブロッキングを解消
    inlineCss: true,
  },

  // 型チェックの設定
  typescript: {
    // 本番ビルド時に型エラーがある場合、ビルドを失敗させる
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
