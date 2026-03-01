import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductModalRoute from "./ProductModalRoute";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterceptedMenuPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductModalRoute product={product} />;
}
