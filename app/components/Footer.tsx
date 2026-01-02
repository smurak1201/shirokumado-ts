import Image from "next/image";
import Link from "next/link";

/**
 * フッターコンポーネント
 * 店舗ロゴと店舗情報を表示
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6 lg:px-12">
        {/* ロゴとInstagramアイコン（1列上） */}
        <div className="mb-6 flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              className="h-auto w-auto"
              style={{ maxHeight: "6rem", maxWidth: "180px" }}
              quality={100}
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
              className="h-4 w-4 text-gray-900 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
            />
          </a>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-4">
          {/* 住所 */}
          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-900 sm:text-xs md:text-sm">
              住所
            </h3>
            <div className="space-y-0.5 text-[10px] leading-relaxed text-gray-600 sm:space-y-1 sm:text-xs md:text-sm">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          {/* 営業情報 */}
          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-900 sm:text-xs md:text-sm">
              営業情報
            </h3>
            <div className="space-y-1.5 text-[10px] leading-relaxed text-gray-600 sm:space-y-2 sm:text-xs md:space-y-3 md:text-sm">
              <div>
                <p className="font-medium text-gray-700">営業時間</p>
                <p className="font-medium">11:00～21:00(L.O.20:00)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">定休日</p>
                <p className="font-medium">通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-900 sm:text-xs md:text-sm">
              お問い合わせ
            </h3>
            <div className="space-y-0.5 text-[10px] leading-relaxed text-gray-600 sm:space-y-1 sm:text-xs md:text-sm">
              <a
                href="tel:070-9157-3772"
                className="block transition-colors hover:text-gray-900"
              >
                070-9157-3772
              </a>
            </div>
          </div>

          {/* Googleマップ */}
          <div className="col-span-1">
            <div className="h-32 w-full overflow-hidden rounded-lg border border-gray-200 sm:h-36 md:h-40 lg:h-48">
              <iframe
                src="https://www.google.com/maps?q=かき氷 白熊堂&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-500">© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
