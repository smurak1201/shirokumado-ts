/**
 * 404ページ
 *
 * 存在しないURLにアクセスした場合に表示されるページ。
 */
import type { Metadata } from "next";
import Link from 'next/link';
import FixedHeader from './components/FixedHeader';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: {
    index: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      <div style={{ height: 'var(--header-height)' }} />

      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <p className="text-8xl font-bold text-primary/20">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          ホームに戻る
        </Link>
      </main>

      <Footer />
    </div>
  );
}
