import type { ProductFormData } from "../../hooks/useProductForm";
import ProductPublishedField from "./ProductPublishedField";
import ProductDateInput from "./ProductDateInput";

interface ProductDateFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームの日付フィールドコンポーネント
 *
 * 公開日・終了日の入力フィールドを提供します。
 */
export default function ProductDateFields({
  formData,
  setFormData,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductDateFieldsProps) {
  return (
    <>
      <ProductPublishedField
        formData={formData}
        setFormData={setFormData}
        hasDateRangeValue={hasDateRangeValue}
        fieldPrefix={fieldPrefix}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProductDateInput
          id={`${fieldPrefix}publishedAt`}
          label="公開日"
          value={formData.publishedAt}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, publishedAt: value }))
          }
          onClear={() =>
            setFormData((prev) => ({ ...prev, publishedAt: "" }))
          }
          ariaLabel="公開日をクリア"
          defaultTime="11:00"
        />
        <ProductDateInput
          id={`${fieldPrefix}endedAt`}
          label="終了日"
          value={formData.endedAt}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, endedAt: value }))
          }
          onClear={() => setFormData((prev) => ({ ...prev, endedAt: "" }))}
          ariaLabel="終了日をクリア"
          defaultTime="20:00"
        />
      </div>
    </>
  );
}
