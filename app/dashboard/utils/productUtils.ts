import type { Product, Category } from "../types";

/**
 * 公開商品をカテゴリーごとにグループ化する
 *
 * 配置変更タブで使用する関数です。
 * 公開されている商品のみを対象とし、カテゴリーごとにグループ化します。
 * 各カテゴリー内の商品は displayOrder でソートされます。
 *
 * @param products - 商品一覧
 * @param categories - カテゴリー一覧
 * @returns カテゴリーごとにグループ化された商品の配列
 */
export function groupProductsByCategory(
  products: Product[],
  categories: Category[]
): Array<{ name: string; products: Product[] }> {
  // 公開されている商品のみをフィルタリング
  const published = products.filter((p) => p.published);

  // カテゴリーをID順でソート（小さい順）
  // これにより、カテゴリーの表示順序がデータベースのID順になります
  const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
  const categoryOrder = sortedCategories.map((c) => c.name);

  // カテゴリーごとに商品をグループ化
  const grouped: Record<string, Product[]> = {};
  published.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  // 各カテゴリー内で displayOrder でソート
  // displayOrder が null の商品は最後に配置されます
  Object.keys(grouped).forEach((categoryName) => {
    const categoryProducts = grouped[categoryName];
    if (categoryProducts) {
      categoryProducts.sort((a, b) => {
        // 両方 null の場合は順序を変えない
        if (a.displayOrder === null && b.displayOrder === null) return 0;
        // a が null の場合は後ろに
        if (a.displayOrder === null) return 1;
        // b が null の場合は後ろに
        if (b.displayOrder === null) return -1;
        // displayOrder の数値で比較
        return a.displayOrder - b.displayOrder;
      });
    }
  });

  // カテゴリーの順序に従って返す
  // 商品がないカテゴリーも含める（空の配列として返す）
  return categoryOrder.map((categoryName) => ({
    name: categoryName,
    products: grouped[categoryName] || [],
  }));
}

/**
 * 商品を検索条件でフィルタリングする
 *
 * 商品一覧タブの検索機能で使用します。
 * 商品名、公開状態、カテゴリーでフィルタリングできます。
 *
 * @param products - フィルタリング対象の商品一覧
 * @param searchName - 商品名での検索文字列（空文字列の場合は検索しない）
 * @param searchPublished - 公開状態でのフィルタリング（null: すべて, true: 公開のみ, false: 非公開のみ）
 * @param searchCategoryId - カテゴリーIDでのフィルタリング（null の場合はフィルタリングしない）
 * @returns フィルタリングされた商品一覧
 */
export function filterProducts(
  products: Product[],
  searchName: string,
  searchPublished: boolean | null,
  searchCategoryId: number | null
): Product[] {
  /**
   * カタカナをひらがなに変換する関数
   * Unicode のカタカナ範囲（\u30A1-\u30F6）をひらがなに変換します
   */
  const toHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      // カタカナの文字コードから 0x60 を引くとひらがなになる
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  };

  /**
   * 検索用の正規化関数
   * ひらがな・カタカナを統一し、大文字小文字も統一して検索しやすくします
   */
  const normalizeForSearch = (str: string): string => {
    return toHiragana(str.toLowerCase());
  };

  return products.filter((product) => {
    // 商品名で検索（ひらがな・カタカナ、大文字小文字を区別しない）
    if (searchName) {
      const normalizedProductName = normalizeForSearch(product.name);
      const normalizedSearchName = normalizeForSearch(searchName);
      // 正規化した商品名に検索文字列が含まれているか確認
      if (!normalizedProductName.includes(normalizedSearchName)) {
        return false;
      }
    }

    // 公開/非公開でフィルタリング
    // searchPublished が null の場合はフィルタリングしない
    if (searchPublished !== null && product.published !== searchPublished) {
      return false;
    }

    // カテゴリーでフィルタリング
    // searchCategoryId が null の場合はフィルタリングしない
    if (
      searchCategoryId !== null &&
      product.category.id !== searchCategoryId
    ) {
      return false;
    }

    // すべての条件を満たす場合は true を返す
    return true;
  });
}
