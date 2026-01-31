"use client";

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Category } from "../../types";

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
        <div className="min-w-0 flex-1 space-y-2">
          <Label>商品名</Label>
          <Input
            type="text"
            placeholder="商品名で検索..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="max-w-[224px]"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label>カテゴリー</Label>
          <Select
            value={searchCategoryId ? String(searchCategoryId) : "all"}
            onValueChange={(value) =>
              setSearchCategoryId(value === "all" ? null : parseInt(value))
            }
          >
            <SelectTrigger className="max-w-[224px]">
              <SelectValue placeholder="すべてのカテゴリー" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリー</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label>公開情報</Label>
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
