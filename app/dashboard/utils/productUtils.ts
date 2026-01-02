import type { Product, Category } from "../types";

/**
 * 公開商品をカテゴリーごとにグループ化する
 */
export function groupProductsByCategory(
  products: Product[],
  categories: Category[]
): Array<{ name: string; products: Product[] }> {
  const published = products.filter((p) => p.published);

  // カテゴリーをID順でソート（小さい順）
  const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
  const categoryOrder = sortedCategories.map((c) => c.name);

  // カテゴリーごとにグループ化
  const grouped: Record<string, Product[]> = {};
  published.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  // 各カテゴリー内でdisplayOrderでソート（nullは最後）
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

  // カテゴリーの順序に従って返す（商品がないカテゴリーも含める）
  return categoryOrder.map((categoryName) => ({
    name: categoryName,
    products: grouped[categoryName] || [],
  }));
}

/**
 * 商品を検索条件でフィルタリングする
 */
export function filterProducts(
  products: Product[],
  searchName: string,
  searchPublished: boolean | null,
  searchCategoryId: number | null
): Product[] {
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

    return true;
  });
}
