/**
 * 商品データ操作ユーティリティ
 */

import type { Product, Category } from "../types";

/**
 * 公開商品をカテゴリーごとにグループ化（配置変更タブ用）
 *
 * カテゴリーはID昇順、各カテゴリー内は displayOrder でソート（null は最後）
 */
export function groupProductsByCategory(
  products: Product[],
  categories: Category[]
): Array<{ name: string; products: Product[] }> {
  const published = products.filter((p) => p.published);
  const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
  const categoryOrder = sortedCategories.map((c) => c.name);

  const grouped: Record<string, Product[]> = {};
  published.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  Object.keys(grouped).forEach((categoryName) => {
    const categoryProducts = grouped[categoryName];
    if (categoryProducts) {
      categoryProducts.sort((a, b) => {
        if (a.displayOrder === null && b.displayOrder === null) return 0;
        if (a.displayOrder === null) return 1;
        if (b.displayOrder === null) return -1;
        return a.displayOrder - b.displayOrder;
      });
    }
  });

  return categoryOrder.map((categoryName) => ({
    name: categoryName,
    products: grouped[categoryName] || [],
  }));
}

/**
 * 商品を検索条件でフィルタリング（商品一覧タブ用）
 *
 * ひらがな・カタカナ変換対応: Unicode で 0x60 離れている特性を利用
 * （カタカナ U+30A1-U+30F6 → ひらがな U+3041-U+3096）
 */
export function filterProducts(
  products: Product[],
  searchName: string,
  searchPublished: boolean | null,
  searchCategoryId: number | null
): Product[] {
  const toHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  };

  const normalizeForSearch = (str: string): string => {
    return toHiragana(str.toLowerCase());
  };

  return products.filter((product) => {
    if (searchName) {
      const normalizedProductName = normalizeForSearch(product.name);
      const normalizedSearchName = normalizeForSearch(searchName);
      if (!normalizedProductName.includes(normalizedSearchName)) {
        return false;
      }
    }

    if (searchPublished !== null && product.published !== searchPublished) {
      return false;
    }

    if (
      searchCategoryId !== null &&
      product.category.id !== searchCategoryId
    ) {
      return false;
    }

    return true;
  });
}
