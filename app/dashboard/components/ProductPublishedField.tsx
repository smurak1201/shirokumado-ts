import type { ProductFormData } from "../hooks/useProductForm";

interface ProductPublishedFieldProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームの公開情報フィールドコンポーネント
 *
 * 公開・非公開のラジオボタンを提供します。
 * 公開日・終了日が設定されている場合、公開情報は自動的に判定されます。
 */
export default function ProductPublishedField({
  formData,
  setFormData,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductPublishedFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        公開情報
      </label>
      <div className="mt-2 flex items-center gap-4">
        <label className="flex cursor-pointer items-center">
          <input
            type="radio"
            name={`${fieldPrefix}published`}
            checked={formData.published === true}
            onChange={() =>
              setFormData((prev) => ({ ...prev, published: true }))
            }
            disabled={hasDateRangeValue}
            className="mr-2"
          />
          <span className={hasDateRangeValue ? "text-gray-400" : ""}>
            公開
          </span>
        </label>
        <label className="flex cursor-pointer items-center">
          <input
            type="radio"
            name={`${fieldPrefix}published`}
            checked={formData.published === false}
            onChange={() =>
              setFormData((prev) => ({ ...prev, published: false }))
            }
            disabled={hasDateRangeValue}
            className="mr-2"
          />
          <span className={hasDateRangeValue ? "text-gray-400" : ""}>
            非公開
          </span>
        </label>
      </div>
      {hasDateRangeValue && (
        <p className="mt-1 text-xs text-gray-500">
          公開日・終了日が設定されているため、公開情報は自動的に判定されます
        </p>
      )}
    </div>
  );
}
