/**
 * 商品検索フィルターコンポーネント
 *
 * 商品名、カテゴリー、公開状態による検索・フィルタリング機能を提供。
 */
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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
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

export default function ProductSearchFilters({
  searchName,
  setSearchName,
  searchPublished,
  setSearchPublished,
  searchCategoryId,
  setSearchCategoryId,
  categories,
}: ProductSearchFiltersProps) {
  /**
   * 公開状態フィルターの値を RadioGroup 用の文字列に変換
   *
   * RadioGroup は文字列を value として扱うため、boolean | null を
   * "all" | "published" | "unpublished" に変換します。
   *
   * @returns {string} RadioGroup の value
   */
  const getPublishedValue = (): string => {
    if (searchPublished === null) return "all";
    return searchPublished ? "published" : "unpublished";
  };

  return (
    <div className="mb-4 space-y-4">
      {/* フィルターコンテナ: レスポンシブなレイアウト */}
      {/* モバイル: flex-col（縦並び）、デスクトップ: md:flex-row（横並び） */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        {/* 商品名検索フィールド */}
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

        {/* カテゴリーフィルター */}
        <div className="min-w-0 flex-1 space-y-2">
          <Label>カテゴリー</Label>
          <Select
            // Select は文字列を扱うため、数値を文字列に変換
            value={searchCategoryId ? String(searchCategoryId) : "all"}
            onValueChange={(value) =>
              // "all" の場合は null、それ以外は数値に変換
              setSearchCategoryId(value === "all" ? null : parseInt(value))
            }
          >
            <SelectTrigger className="max-w-[224px]">
              <SelectValue placeholder="すべてのカテゴリー" />
            </SelectTrigger>
            <SelectContent>
              {/* すべてのカテゴリーを表示するオプション */}
              <SelectItem value="all">すべてのカテゴリー</SelectItem>

              {/* カテゴリーリストから選択肢を生成 */}
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 公開状態フィルター */}
        <div className="min-w-0 flex-1 space-y-2">
          <Label>公開情報</Label>
          <RadioGroup
            value={getPublishedValue()}
            onValueChange={(value) => {
              // 文字列を boolean | null に変換
              if (value === "all") setSearchPublished(null);
              else if (value === "published") setSearchPublished(true);
              else setSearchPublished(false);
            }}
            className="flex items-center gap-4"
          >
            {/* すべて */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="search-all" />
              <Label htmlFor="search-all" className="cursor-pointer font-normal">
                すべて
              </Label>
            </div>

            {/* 公開のみ */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="published" id="search-published" />
              <Label htmlFor="search-published" className="cursor-pointer font-normal">
                公開
              </Label>
            </div>

            {/* 非公開のみ */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unpublished" id="search-unpublished" />
              <Label htmlFor="search-unpublished" className="cursor-pointer font-normal">
                非公開
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
