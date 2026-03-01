import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ScrollToTop from "./ScrollToTop";
import ProductDetail from "@/app/components/ProductDetail";

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
    <>
      <ScrollToTop />

      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-4">
          <ProductDetail
            product={product}
            headerSlot={
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
            }
          />
        </div>
      </main>
    </>
  );
}
