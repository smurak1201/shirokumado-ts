"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import ProductEditForm from "./ProductEditForm";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  tags: Tag[];
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
}

interface ProductListProps {
  initialProducts: Product[];
  categories: Category[];
  tags: Tag[];
}

export interface ProductListRef {
  refreshProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ initialProducts, categories, tags }, ref) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const refreshProducts = async () => {
      try {
        // キャッシュを完全に無効化するためにタイムスタンプを追加
        const response = await fetch(`/api/products?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("商品一覧の更新に失敗しました:", error);
      }
    };

    // 親コンポーネントからrefreshProductsを呼べるようにする
    useImperativeHandle(ref, () => ({
      refreshProducts,
    }));

    const handleEdit = (product: Product) => {
      setEditingProduct(product);
    };

    const handleDelete = async (productId: number) => {
      if (!confirm("本当にこの商品を削除しますか？")) {
        return;
      }

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "削除に失敗しました");
        }

        alert("商品を削除しました");
        await refreshProducts();
      } catch (error) {
        console.error("削除エラー:", error);
        alert(
          error instanceof Error ? error.message : "商品の削除に失敗しました"
        );
      }
    };

    const handleUpdated = async () => {
      await refreshProducts();
      // 編集フォームはProductEditFormのonCloseで閉じられるため、ここでは閉じない
    };

    return (
      <>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">登録済み商品一覧</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">登録されている商品はありません</p>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 ${
                    !product.published ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {/* 商品画像 */}
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

                  {/* 商品情報 */}
                  <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
                    {/* 商品名 */}
                    <h3
                      className={`mb-1 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:mb-2 sm:text-xs md:text-lg ${
                        !product.published ? "text-gray-500" : ""
                      }`}
                    >
                      {product.name}
                    </h3>

                    {/* 公開状態・カテゴリ・タグ */}
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
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className={`rounded-full px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                            !product.published
                              ? "bg-gray-200 text-gray-500"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    {/* 価格 */}
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

                    {/* ボタン */}
                    <div className="mt-auto flex gap-0.5 sm:gap-1 md:gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-md bg-blue-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-blue-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded-md bg-red-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-red-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingProduct && (
          <ProductEditForm
            product={editingProduct}
            categories={categories}
            tags={tags}
            onClose={() => setEditingProduct(null)}
            onUpdated={handleUpdated}
          />
        )}
      </>
    );
  }
);

ProductList.displayName = "ProductList";

export default ProductList;
