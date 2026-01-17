import ProductCard from "./ProductCard";
import type { Product } from "../types";

interface ProductListViewProps {
  products: Product[];
  filteredProducts: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

/**
 * 商品一覧表示コンポーネント
 *
 * フィルタリングされた商品一覧を3列グリッドで表示します。
 */
export default function ProductListView({
  products,
  filteredProducts,
  onEdit,
  onDelete,
}: ProductListViewProps) {
  if (filteredProducts.length === 0) {
    return (
      <p className="text-gray-500">
        {products.length === 0
          ? "登録されている商品はありません"
          : "検索条件に一致する商品がありません"}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
