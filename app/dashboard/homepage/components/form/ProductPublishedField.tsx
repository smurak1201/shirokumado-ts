/**
 * 商品フォーム公開状態フィールドコンポーネント
 *
 * 公開/非公開のラジオボタンを提供。
 * 公開期間が設定されている場合、手動変更を無効化し、公開状態は自動計算される。
 */

"use client";

import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import type { ProductFormData } from "../../hooks/useProductForm";

interface ProductPublishedFieldProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

export default function ProductPublishedField({
  formData,
  setFormData,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductPublishedFieldProps) {
  return (
    <div className="space-y-2">
      <Label>公開情報</Label>

      <RadioGroup
        value={formData.published ? "published" : "unpublished"}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, published: value === "published" }))
        }
        disabled={hasDateRangeValue}
        className="flex items-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="published" id={`${fieldPrefix}published-true`} />
          <Label
            htmlFor={`${fieldPrefix}published-true`}
            className={`font-normal ${hasDateRangeValue ? "text-gray-400" : "cursor-pointer"}`}
          >
            公開
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unpublished" id={`${fieldPrefix}published-false`} />
          <Label
            htmlFor={`${fieldPrefix}published-false`}
            className={`font-normal ${hasDateRangeValue ? "text-gray-400" : "cursor-pointer"}`}
          >
            非公開
          </Label>
        </div>
      </RadioGroup>

      {hasDateRangeValue && (
        <p className="text-xs text-gray-500">
          公開日・終了日が設定されているため、公開情報は自動的に判定されます
        </p>
      )}
    </div>
  );
}
