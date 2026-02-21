/**
 * 固定ヘッダーコンポーネント
 *
 * 画面上部に固定表示されるヘッダー。
 * position: fixed のため、使用時は直後にヘッダーの高さ分のスペーサーが必須。
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

const NAV_LINKS = [
  { href: "/about-ice", label: "天然氷について" },
  { href: "/faq", label: "よくある質問" },
] as const;

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

const navLinkClassName = cn(
  "relative text-sm font-normal transition-all md:text-base",
  "text-foreground/70 hover:text-foreground active:scale-95",
  "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-foreground after:transition-all after:duration-300",
  "hover:after:w-full",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
);

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
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-8 overflow-x-hidden">
        <motion.div
          variants={itemVariants}
          className="relative flex items-center gap-4 overflow-visible"
        >
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Image
              src="/logo.svg"
              alt="白熊堂"
              width={120}
              height={45}
              priority
              className="h-auto w-20 md:w-25"
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

        {/* デスクトップ: 横並びナビ */}
        <motion.nav
          variants={itemVariants}
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClassName}>
              {link.label}
            </Link>
          ))}
        </motion.nav>

        {/* モバイル: ハンバーガーメニュー */}
        <motion.div variants={itemVariants} className="md:hidden">
          <MobileMenu navLinks={NAV_LINKS} />
        </motion.div>
      </div>
    </motion.header>
  );
}
