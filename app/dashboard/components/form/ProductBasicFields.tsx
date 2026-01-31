"use client";

import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Category } from "../../types";
import type { ProductFormData } from "../../hooks/useProductForm";

interface ProductBasicFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  fieldPrefix?: string;
}

/**
 * 商品フォームの基本フィールドコンポーネント
 *
 * 商品名、説明、カテゴリーの入力フィールドを提供します。
 */
export default function ProductBasicFields({
  formData,
  setFormData,
  categories,
  fieldPrefix = "",
}: ProductBasicFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}name`}>
          商品名 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id={`${fieldPrefix}name`}
          required
          rows={2}
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}description`}>
          商品説明 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id={`${fieldPrefix}description`}
          required
          rows={6}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}categoryId`}>
          カテゴリー <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, categoryId: value }))
          }
          required
        >
          <SelectTrigger id={`${fieldPrefix}categoryId`}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
