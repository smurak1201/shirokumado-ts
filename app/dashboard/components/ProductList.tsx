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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex flex-col rounded-lg border border-gray-200 p-4 ${
                    !product.published ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {/* 商品画像 */}
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={`h-48 w-full rounded object-cover ${
                        !product.published ? "opacity-50" : ""
                      }`}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`h-48 w-full rounded bg-gray-200 ${
                        !product.published ? "opacity-50" : ""
                      }`}
                    />
                  )}

                  {/* 商品情報 */}
                  <div className="mt-4 flex flex-1 flex-col">
                    {/* 商品名と公開状態 */}
                    <div className="mb-2 flex items-center gap-2">
                      <h3
                        className={`flex-1 text-lg font-semibold ${
                          !product.published ? "text-gray-500" : ""
                        }`}
                      >
                        {product.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.published ? "公開" : "非公開"}
                      </span>
                    </div>

                    {/* カテゴリ・タグ */}
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
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
                          className={`rounded-full px-2 py-1 text-xs ${
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
                      className={`mb-4 text-sm ${
                        !product.published ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {product.priceS && (
                        <span>S: ¥{product.priceS.toLocaleString()}</span>
                      )}
                      {product.priceS && product.priceL && (
                        <span className="mx-2">/</span>
                      )}
                      {product.priceL && (
                        <span>L: ¥{product.priceL.toLocaleString()}</span>
                      )}
                    </div>

                    {/* ボタン */}
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
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
