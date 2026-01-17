import type { Category } from "../types";

interface ProductSearchFiltersProps {
  searchName: string;
  setSearchName: (value: string) => void;
  searchPublished: boolean | null;
  setSearchPublished: (value: boolean | null) => void;
  searchCategoryId: number | null;
  setSearchCategoryId: (value: number | null) => void;
  categories: Category[];
}

/**
 * 商品検索フィルターコンポーネント
 *
 * 商品名、カテゴリー、公開状態による検索・フィルタリング機能を提供します。
 * 商品名の検索では、ひらがな・カタカナの区別なく検索できます。
 */
export default function ProductSearchFilters({
  searchName,
  setSearchName,
  searchPublished,
  setSearchPublished,
  searchCategoryId,
  setSearchCategoryId,
  categories,
}: ProductSearchFiltersProps) {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
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
    </div>
  );
}
