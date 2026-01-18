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
    <footer className="border-t bg-linear-to-b from-background to-muted/20 py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6 lg:px-12">
        <div className="mb-8 flex items-center gap-3 sm:gap-4 md:gap-5">
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
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
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
            />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground sm:text-sm">
              住所
            </h3>
            <div className="space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground sm:text-sm">
              営業情報
            </h3>
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <div>
                <p className="font-medium text-foreground/90">営業時間</p>
                <p>11:00～21:00(L.O.20:00)</p>
              </div>
              <div>
                <p className="font-medium text-foreground/90">定休日</p>
                <p>通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground sm:text-sm">
              お問い合わせ
            </h3>
            <div className="space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <a
                href="tel:070-9157-3772"
                className={cn(
                  "block font-medium transition-colors",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                070-9157-3772
              </a>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <Card className="h-48 w-full overflow-hidden border-2 shadow-lg sm:h-56 md:h-64 lg:h-72">
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

        <Separator className="my-12" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
