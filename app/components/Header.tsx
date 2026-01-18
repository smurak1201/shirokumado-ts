import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * ヘッダーコンポーネント
 *
 * 全ページ共通のヘッダーを表示します。
 * ロゴ画像（トップページへのリンク）、Instagramアイコン、ナビゲーションリンクを含みます。
 * shadcn/uiのSeparatorコンポーネントを使用して実装されています。
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-20 overflow-visible border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="relative flex items-center gap-4 overflow-visible">
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
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
              "hover:bg-accent hover:scale-110",
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
        </div>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/faq"
            className={cn(
              "relative text-sm font-medium transition-all md:text-base",
              "text-foreground/70 hover:text-foreground",
              "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all after:duration-300",
              "hover:after:w-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            )}
          >
            よくある質問
          </Link>
        </nav>
      </div>
    </header>
  );
}
