"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * 固定ヘッダーコンポーネント
 *
 * position: fixed で画面上部に固定されるヘッダーです。
 * このコンポーネントは通常のドキュメントフローから外れるため、
 * 使用する際は直後にヘッダーの高さ分のスペーサーが必要です。
 *
 * 高さ: 5rem (80px) - CSS変数 --header-height で管理（globals.css）
 *
 * 含まれる要素:
 * - ロゴ画像（トップページへのリンク）
 * - Instagramアイコン
 * - ナビゲーションリンク
 *
 * アニメーション:
 * - Framer Motionを使用
 * - トップページ（/）を開いたときのみ実行
 *
 * @example
 * // 使用例（page.tsx）
 * <FixedHeader />
 * <div style={{ height: "var(--header-height)" }} /> // スペーサー必須
 * <main>...</main>
 */
export default function FixedHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <motion.header
      initial={isHomePage ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
      className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-2 md:px-6 overflow-x-hidden">
        <motion.div
          variants={itemVariants}
          className="relative flex items-center gap-4 overflow-visible"
        >
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              priority
              style={{ width: "120px", height: "auto" }}
            />
          </Link>
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-all",
              "hover:bg-accent hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6 md:h-7 md:w-7"
            />
          </a>
        </motion.div>

        <motion.nav
          variants={itemVariants}
          className="flex items-center gap-4 md:gap-6"
        >
          <Link
            href="/faq"
            className={cn(
              "relative text-sm font-medium transition-all md:text-base",
              "text-foreground/70 hover:text-foreground active:scale-95",
              "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all after:duration-300",
              "hover:after:w-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            )}
          >
            よくある質問
          </Link>
        </motion.nav>
      </div>
    </motion.header>
  );
}
