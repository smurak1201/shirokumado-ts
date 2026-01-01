"use client";

import { useState, useImperativeHandle, forwardRef, useMemo } from "react";
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
  onNewProductClick?: () => void;
}

export interface ProductListRef {
  refreshProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ initialProducts, categories, tags, onNewProductClick }, ref) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<"list" | "layout">("list");

    // 検索条件の状態
    const [searchName, setSearchName] = useState("");
    const [searchPublished, setSearchPublished] = useState<boolean | null>(
      null
    ); // null: すべて, true: 公開のみ, false: 非公開のみ
    const [searchCategoryId, setSearchCategoryId] = useState<number | null>(
      null
    );
    const [searchTagIds, setSearchTagIds] = useState<number[]>([]);

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

    // カタカナをひらがなに変換する関数
    const toHiragana = (str: string): string => {
      return str.replace(/[\u30A1-\u30F6]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
      });
    };

    // 検索用の正規化関数（ひらがな・カタカナを統一し、大文字小文字も統一）
    const normalizeForSearch = (str: string): string => {
      return toHiragana(str.toLowerCase());
    };

    // 検索条件に基づいて商品をフィルタリング
    const filteredProducts = useMemo(() => {
      return products.filter((product) => {
        // 商品名で検索（ひらがな・カタカナ、大文字小文字を区別しない）
        if (searchName) {
          const normalizedProductName = normalizeForSearch(product.name);
          const normalizedSearchName = normalizeForSearch(searchName);
          if (!normalizedProductName.includes(normalizedSearchName)) {
            return false;
          }
        }

        // 公開/非公開でフィルタリング
        if (searchPublished !== null && product.published !== searchPublished) {
          return false;
        }

        // カテゴリーでフィルタリング
        if (
          searchCategoryId !== null &&
          product.category.id !== searchCategoryId
        ) {
          return false;
        }

        // タグでフィルタリング（選択されたタグのすべてが含まれている必要がある）
        if (searchTagIds.length > 0) {
          const productTagIds = product.tags.map((tag) => tag.id);
          const hasAllTags = searchTagIds.every((tagId) =>
            productTagIds.includes(tagId)
          );
          if (!hasAllTags) {
            return false;
          }
        }

        return true;
      });
    }, [products, searchName, searchPublished, searchCategoryId, searchTagIds]);

    // タグの選択/解除
    const handleTagToggle = (tagId: number) => {
      setSearchTagIds((prev) =>
        prev.includes(tagId)
          ? prev.filter((id) => id !== tagId)
          : [...prev, tagId]
      );
    };

    return (
      <>
        <div
          className="rounded-lg bg-white p-6 shadow"
          style={{ scrollbarGutter: "stable" }}
        >
          {/* タブ */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("list")}
                className={`relative whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                登録済み商品一覧
              </button>
              <button
                onClick={() => setActiveTab("layout")}
                className={`relative whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === "layout"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                配置変更
              </button>
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="min-h-[400px]">
            {activeTab === "list" && (
              <>
                {/* ヘッダー: ボタン */}
                <div className="mb-4">
                  {onNewProductClick && (
                    <button
                      onClick={onNewProductClick}
                      className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      新規商品登録
                    </button>
                  )}
                </div>

                {/* 検索・フィルターエリア */}
                <div className="mb-4 space-y-4">
                  {/* 商品名、カテゴリー、公開情報を横並び */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
                    {/* 商品名検索 */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        商品名
                      </label>
                      <input
                        type="text"
                        placeholder="商品名で検索..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full max-w-[224px] rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>

                    {/* カテゴリーフィルター */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カテゴリー
                      </label>
                      <select
                        value={searchCategoryId || ""}
                        onChange={(e) =>
                          setSearchCategoryId(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="w-full max-w-[224px] rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">すべてのカテゴリー</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 公開/非公開フィルター */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公開情報
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === null}
                            onChange={() => setSearchPublished(null)}
                            className="mr-2"
                          />
                          <span>すべて</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === true}
                            onChange={() => setSearchPublished(true)}
                            className="mr-2"
                          />
                          <span>公開</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="search-published"
                            checked={searchPublished === false}
                            onChange={() => setSearchPublished(false)}
                            className="mr-2"
                          />
                          <span>非公開</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* タグフィルター */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex cursor-pointer items-center rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={searchTagIds.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                            className="mr-2"
                          />
                          {tag.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500">
                    {products.length === 0
                      ? "登録されている商品はありません"
                      : "検索条件に一致する商品がありません"}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
                    {filteredProducts.map((product) => (
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
                              !product.published
                                ? "text-gray-400"
                                : "text-gray-500"
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
              </>
            )}

            {activeTab === "layout" && (
              <div className="py-8 text-center text-gray-500">
                <p>配置変更機能は準備中です</p>
              </div>
            )}
          </div>
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
