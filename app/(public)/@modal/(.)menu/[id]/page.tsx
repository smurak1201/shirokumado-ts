import { notFound } from "next/navigation";
import ProductModalRoute from "./ProductModalRoute";

interface Props {
  params: Promise<{ id: string }>;
}

// サイト内遷移時はクライアントキャッシュから商品データを取得するため、
// Server Component側でのDB問い合わせは行わない
export default async function InterceptedMenuPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  return <ProductModalRoute productId={productId} />;
}
