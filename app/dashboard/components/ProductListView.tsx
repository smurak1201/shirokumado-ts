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
 * 各商品カードには編集・削除ボタンが含まれ、公開状態に応じた視覚的な表示を行います。
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
        <div
          key={product.id}
          className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 ${
            !product.published ? "bg-gray-50" : "bg-white"
          }`}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-20 w-full rounded object-cover sm:h-32 md:h-48 ${
                !product.published ? "opacity-50" : ""
              }`}
              loading="lazy"
            />
          ) : (
            <div
              className={`h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48 ${
                !product.published ? "opacity-50" : ""
              }`}
            />
          )}

          <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
            <div
              className={`mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]`}
            >
              <h3
                className={`line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg ${
                  !product.published ? "text-gray-500" : ""
                }`}
              >
                {product.name}
              </h3>
            </div>

            <div className="mb-1 flex flex-wrap gap-0.5 sm:mb-2 sm:gap-1 md:gap-2">
              <span
                className={`rounded-full px-1 py-0.5 text-[8px] font-medium sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  product.published
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {product.published ? "公開" : "非公開"}
              </span>
              <span
                className={`rounded-full px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  !product.published
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {product.category.name}
              </span>
            </div>

            <div
              className={`mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm ${
                !product.published ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {product.priceS && (
                <span>S: ¥{product.priceS.toLocaleString()}</span>
              )}
              {product.priceS && product.priceL && (
                <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
              )}
              {product.priceL && (
                <span>L: ¥{product.priceL.toLocaleString()}</span>
              )}
            </div>

            <div className="mt-auto flex gap-0.5 sm:gap-1 md:gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 rounded-md bg-blue-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-blue-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 rounded-md bg-red-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-red-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
