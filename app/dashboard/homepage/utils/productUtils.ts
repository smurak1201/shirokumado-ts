/**
 * @fileoverview 商品データ操作ユーティリティ - グループ化とフィルタリング
 *
 * ## 目的
 * - 商品データのグループ化とフィルタリング処理を提供
 * - ダッシュボードの配置変更タブと商品一覧タブで使用
 * - データの整形と検索機能を担当
 *
 * ## 主な機能
 * - 公開商品のカテゴリー別グループ化とソート
 * - 商品名のあいまい検索（ひらがな・カタカナ変換対応）
 * - 公開状態とカテゴリーによる複合フィルタリング
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/layout/ProductLayoutTab.tsx（配置変更タブ）
 * - app/dashboard/homepage/components/list/ProductListTab.tsx（商品一覧タブ）
 *
 * ## 実装の特性
 * - **純粋関数**: 副作用なし、テストしやすい
 * - **クライアント・サーバー両用**: Reactフックに依存しない
 * - **パフォーマンス最適化**: 効率的なソートとフィルタリング
 *
 * ## ベストプラクティス
 * - null と undefined を適切に処理
 * - 元の配列を変更しない（イミュータブル）
 * - カテゴリーの順序を保持
 */

import type { Product, Category } from "../types";

/**
 * 公開商品をカテゴリーごとにグループ化する関数
 *
 * 配置変更タブで使用する関数です。
 * 公開されている商品のみを対象とし、カテゴリーごとにグループ化します。
 * 各カテゴリー内の商品は displayOrder でソートされ、
 * カテゴリー自体は ID の昇順（登録順）で並びます。
 *
 * @param products - すべての商品の配列（公開・非公開混在）
 * @param categories - すべてのカテゴリーの配列
 * @returns カテゴリー名と商品配列のペア。公開商品がないカテゴリーは空配列を持つ
 *
 * ## グループ化のロジック
 * 1. 公開商品のみをフィルタリング
 * 2. カテゴリーを ID の昇順でソート（登録順を保持）
 * 3. 商品をカテゴリーごとにグループ化
 * 4. 各カテゴリー内で displayOrder でソート
 * 5. カテゴリーの順序を保ちながら結果を構築
 *
 * ## displayOrder のソートルール
 * - displayOrder が null でない商品は昇順でソート
 * - displayOrder が null の商品は最後に配置
 * - 両方 null の場合は順序を変更しない
 *
 * ## なぜカテゴリーの順序を保持するのか
 * - ドラッグ&ドロップUIで一貫した順序を表示するため
 * - カテゴリーの表示順序を管理画面で制御可能にするため
 * - ユーザーが意図した順序で商品を配置できるようにするため
 *
 * ## 使用例
 * ```tsx
 * const groupedProducts = groupProductsByCategory(products, categories);
 * groupedProducts.forEach(({ name, products }) => {
 *   console.log(`カテゴリー: ${name}, 商品数: ${products.length}`);
 * });
 * ```
 */
export function groupProductsByCategory(
  products: Product[],
  categories: Category[]
): Array<{ name: string; products: Product[] }> {
  // ステップ1: 公開商品のみをフィルタリング
  // 理由: 配置変更タブでは公開商品のみを表示・編集対象とする
  const published = products.filter((p) => p.published);

  // ステップ2: カテゴリーをIDの昇順でソート（元の配列を変更しないようスプレッド演算子使用）
  // 理由: カテゴリーの登録順を保持し、一貫した順序でUIに表示する
  const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

  // カテゴリー名の順序を保持（後でこの順序通りに結果を構築）
  const categoryOrder = sortedCategories.map((c) => c.name);

  // ステップ3: 商品をカテゴリーごとにグループ化
  // Record<string, Product[]> を使用して、カテゴリー名をキーとした辞書を構築
  const grouped: Record<string, Product[]> = {};
  published.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      // 新しいカテゴリーの場合、空配列を初期化
      grouped[categoryName] = [];
    }
    // カテゴリーに商品を追加
    grouped[categoryName].push(product);
  });

  // ステップ4: 各カテゴリー内で displayOrder でソート
  // 理由: ドラッグ&ドロップで設定した順序を反映する
  Object.keys(grouped).forEach((categoryName) => {
    const categoryProducts = grouped[categoryName];
    if (categoryProducts) {
      categoryProducts.sort((a, b) => {
        // displayOrder が両方 null の場合は順序を変更しない
        if (a.displayOrder === null && b.displayOrder === null) return 0;
        // a が null の場合は後ろに配置
        if (a.displayOrder === null) return 1;
        // b が null の場合は前に配置
        if (b.displayOrder === null) return -1;
        // 両方 number の場合は昇順ソート
        return a.displayOrder - b.displayOrder;
      });
    }
  });

  // ステップ5: カテゴリーの順序を保ちながら結果を構築
  // 理由: ソート済みのカテゴリー順序を反映し、UIで一貫した表示順を保証
  return categoryOrder.map((categoryName) => ({
    name: categoryName,
    // カテゴリーに商品がない場合は空配列を返す
    products: grouped[categoryName] || [],
  }));
}

/**
 * 商品を検索条件でフィルタリングする関数
 *
 * 商品一覧タブの検索機能で使用します。
 * 商品名、公開状態、カテゴリーの3つの条件で絞り込みができます。
 * 商品名の検索では、ひらがな・カタカナの区別なく検索できる
 * あいまい検索を実現しています。
 *
 * @param products - フィルタリング対象の商品配列
 * @param searchName - 商品名の検索文字列（空文字の場合は商品名でフィルタリングしない）
 * @param searchPublished - 公開状態でのフィルタリング（null の場合はフィルタリングしない）
 * @param searchCategoryId - カテゴリーIDでのフィルタリング（null の場合はフィルタリングしない）
 * @returns フィルタリング後の商品配列
 *
 * ## フィルタリング条件（AND条件）
 * 1. 商品名: 正規化した文字列で部分一致検索
 * 2. 公開状態: boolean値で完全一致
 * 3. カテゴリー: カテゴリーIDで完全一致
 *
 * ## ひらがな・カタカナの正規化
 * - カタカナをひらがなに変換して検索
 * - 「ケーキ」で検索しても「けーき」がヒット
 * - 「けーき」で検索しても「ケーキ」がヒット
 * - 理由: 日本語入力の利便性向上（入力モードを気にせず検索可能）
 *
 * ## パフォーマンス最適化
 * - 内部関数（toHiragana, normalizeForSearch）は呼び出しごとに生成
 * - トレードオフ: useCallback でメモ化する必要はない（検索頻度が低い）
 * - フィルタリングは O(n) で効率的
 *
 * ## 使用例
 * ```tsx
 * const filtered = filterProducts(
 *   products,
 *   "ケーキ", // 商品名検索
 *   true,     // 公開商品のみ
 *   1         // カテゴリーID=1
 * );
 * ```
 */
export function filterProducts(
  products: Product[],
  searchName: string,
  searchPublished: boolean | null,
  searchCategoryId: number | null
): Product[] {
  /**
   * カタカナをひらがなに変換する内部関数
   *
   * Unicode の文字コードを利用してカタカナをひらがなに変換します。
   * カタカナの範囲（U+30A1 - U+30F6）を検出し、
   * 0x60（96）を引いてひらがなの範囲（U+3041 - U+3096）に変換します。
   *
   * @param str - 変換対象の文字列
   * @returns カタカナがひらがなに変換された文字列
   *
   * ## なぜ 0x60 を引くのか
   * - カタカナ「ア」: U+30A1（12449）
   * - ひらがな「あ」: U+3041（12353）
   * - 差分: 12449 - 12353 = 96 = 0x60
   * - カタカナとひらがなは Unicode で 96 離れている
   *
   * ## 変換の範囲
   * - U+30A1（ァ）～ U+30F6（ヶ）のみ対応
   * - 小書き文字や特殊記号も含む
   * - 半角カタカナは非対応（全角カタカナのみ）
   */
  const toHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      // 文字コードを 0x60 減らしてひらがなに変換
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  };

  /**
   * 検索用に文字列を正規化する内部関数
   *
   * 以下の正規化を行います:
   * 1. カタカナをひらがなに変換
   * 2. 小文字に変換
   *
   * これにより、「ケーキ」「けーき」「KEIKI」などの
   * 表記ゆれを吸収できます。
   *
   * @param str - 正規化対象の文字列
   * @returns 正規化された文字列（ひらがな・小文字）
   *
   * ## なぜ小文字変換も行うのか
   * - 英字の大文字・小文字を区別しないため
   * - "Cake" と "cake" を同じとして扱う
   */
  const normalizeForSearch = (str: string): string => {
    return toHiragana(str.toLowerCase());
  };

  // フィルタリング処理
  return products.filter((product) => {
    // 条件1: 商品名でのフィルタリング
    // searchName が空でない場合のみチェック
    if (searchName) {
      const normalizedProductName = normalizeForSearch(product.name);
      const normalizedSearchName = normalizeForSearch(searchName);
      // 部分一致で検索（includes）
      // 理由: 「ケーキ」で「チョコレートケーキ」もヒットさせたい
      if (!normalizedProductName.includes(normalizedSearchName)) {
        return false;
      }
    }

    // 条件2: 公開状態でのフィルタリング
    // searchPublished が null でない場合のみチェック
    // 理由: null は「すべて」を意味する（公開・非公開を区別しない）
    if (searchPublished !== null && product.published !== searchPublished) {
      return false;
    }

    // 条件3: カテゴリーでのフィルタリング
    // searchCategoryId が null でない場合のみチェック
    // 理由: null は「すべて」を意味する（全カテゴリーを対象）
    if (
      searchCategoryId !== null &&
      product.category.id !== searchCategoryId
    ) {
      return false;
    }

    // すべての条件を満たした商品のみ true を返す
    return true;
  });
}
