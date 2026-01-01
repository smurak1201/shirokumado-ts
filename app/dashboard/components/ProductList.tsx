"use client";

import { useState } from "react";

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
  publishedAt: string | null;
  endedAt: string | null;
}

interface ProductListProps {
  initialProducts: Product[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const refreshProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store", // キャッシュを無効化
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("商品一覧の更新に失敗しました:", error);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">登録済み商品一覧</h2>
        <button
          onClick={refreshProducts}
          className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          更新
        </button>
      </div>
      {products.length === 0 ? (
        <p className="text-gray-500">登録されている商品はありません</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="flex gap-4">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-24 w-24 rounded object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {product.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      {product.category.name}
                    </span>
                    {product.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
