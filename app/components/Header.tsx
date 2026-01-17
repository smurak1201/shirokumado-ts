import Link from "next/link";
import Image from "next/image";

/**
 * ヘッダーコンポーネント
 *
 * 全ページ共通のヘッダーを表示します。
 * ロゴ画像（トップページへのリンク）、Instagramアイコン、ナビゲーションリンクを含みます。
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="relative flex items-center gap-3 overflow-visible">
          <Link href="/" className="transition-opacity hover:opacity-80">
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
            className="flex items-center justify-center transition-opacity hover:opacity-80"
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6 text-gray-900 md:h-7 md:w-7"
            />
          </a>
        </div>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/faq"
            className="text-sm text-gray-700 transition-colors hover:text-gray-900 md:text-base"
          >
            よくある質問
          </Link>
        </nav>
      </div>
      <div className="h-px bg-gray-200" />
    </header>
  );
}
