import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

/**
 * フッターコンポーネント
 *
 * 全ページ共通のフッターを表示します。
 * ロゴ画像、Instagramアイコン、店舗情報（住所、営業情報、お問い合わせ）、Googleマップ、コピーライトを含みます。
 * shadcn/uiのCardとSeparatorコンポーネントを使用して実装されています。
 */
export default function Footer() {
  return (
    <footer className="border-t bg-background py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6 lg:px-12">
        <div className="mb-6 flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            href="/"
            className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              style={{ width: "120px", height: "auto" }}
            />
          </Link>
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center transition-opacity",
              "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            )}
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
            />
          </a>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-4">
          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs md:text-sm">
              住所
            </h3>
            <div className="space-y-0.5 text-[10px] leading-relaxed text-muted-foreground sm:space-y-1 sm:text-xs md:text-sm">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs md:text-sm">
              営業情報
            </h3>
            <div className="space-y-1.5 text-[10px] leading-relaxed text-muted-foreground sm:space-y-2 sm:text-xs md:space-y-3 md:text-sm">
              <div>
                <p className="font-medium">営業時間</p>
                <p className="font-medium">11:00～21:00(L.O.20:00)</p>
              </div>
              <div>
                <p className="font-medium">定休日</p>
                <p className="font-medium">通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs md:text-sm">
              お問い合わせ
            </h3>
            <div className="space-y-0.5 text-[10px] leading-relaxed text-muted-foreground sm:space-y-1 sm:text-xs md:text-sm">
              <a
                href="tel:070-9157-3772"
                className={cn(
                  "block transition-colors",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                070-9157-3772
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <Card className="h-32 w-full overflow-hidden sm:h-36 md:h-40 lg:h-48">
              <iframe
                src="https://www.google.com/maps?q=かき氷 白熊堂&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="白熊堂の場所"
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </Card>
          </div>
        </div>

        <Separator className="mt-12" />
        <div className="pt-8 text-center">
          <p className="text-xs text-muted-foreground">© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
