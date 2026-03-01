import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { formatPrice } from "@/lib/product-utils";
import ScrollToTop from "./ScrollToTop";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import { Separator } from "@/app/components/ui/separator";
import { PriceBadge } from "@/app/components/ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "@/app/components/ui/card-modal";

const BASE_URL = process.env.SITE_URL!;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return { title: "商品が見つかりません" };
  }

  const product = await getProductById(productId);

  if (!product) {
    return { title: "商品が見つかりません" };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - 白熊堂のメニュー`,
    alternates: {
      canonical: `${BASE_URL}/menu/${id}`,
    },
    openGraph: {
      title: `${product.name} | 白熊堂`,
      description: product.description || `${product.name} - 白熊堂のメニュー`,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
    twitter: {
      card: product.imageUrl ? "summary_large_image" : "summary",
      title: `${product.name} | 白熊堂`,
      description: product.description || `${product.name} - 白熊堂のメニュー`,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function MenuItemPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollToTop />
      <FixedHeader />

      {/* position:fixed のヘッダーに対応するスペーサー */}
      <div style={{ height: "var(--header-height)" }} />

      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-4">
          <div className="transition-transform duration-300 hover:scale-[1.02]">
            <ModalImageCard>
              <ModalCardHeader>
                <div className="relative h-[40vh] min-h-50 max-h-112.5 md:h-[45vh] md:max-h-125 overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center p-4 md:p-6 transition-transform duration-400 hover:scale-105">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
                  )}
                </div>
              </ModalCardHeader>
            </ModalImageCard>
          </div>

          <div>
            <ModalContentCard>
              <ModalCardContent>
                <div className="space-y-3">
                  <h1 className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </ModalCardContent>
            </ModalContentCard>
          </div>

          {(product.priceS || product.priceL) && (
            <div>
              <ModalPriceCard>
                <ModalCardContent>
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                    {product.priceS && (
                      <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                        <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                          Small
                        </span>
                        <PriceBadge className="text-lg md:text-xl">
                          {formatPrice(product.priceS)}
                        </PriceBadge>
                      </div>
                    )}
                    {product.priceS && product.priceL && (
                      <div className="flex flex-col items-center">
                        <Separator
                          orientation="vertical"
                          className="h-12 md:h-16 bg-border/50"
                        />
                      </div>
                    )}
                    {product.priceL && (
                      <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                        <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                          Large
                        </span>
                        <PriceBadge className="text-lg md:text-xl">
                          {formatPrice(product.priceL)}
                        </PriceBadge>
                      </div>
                    )}
                  </div>
                </ModalCardContent>
              </ModalPriceCard>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
