/**
 * パンくずリストコンポーネント
 *
 * セマンティックHTMLとBreadcrumbList構造化データ（JSON-LD）を出力。
 * 検索結果にパンくずが表示され、ユーザーの現在位置も明確になる。
 */
import Link from "next/link";

const BASE_URL = process.env.SITE_URL!;

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: "トップ", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${BASE_URL}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="パンくずリスト" className="mb-4 md:mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground md:text-sm">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="mx-1">/</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
