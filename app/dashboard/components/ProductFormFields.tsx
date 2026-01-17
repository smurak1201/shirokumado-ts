import type { Category } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";
import ProductDateFields from "./ProductDateFields";
import ProductImageField from "./ProductImageField";
import ProductPriceFields from "./ProductPriceFields";
import ProductBasicFields from "./ProductBasicFields";

interface ProductFormFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームフィールドコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のフォームフィールドを提供します。
 * 商品名、説明、画像、価格、カテゴリー、公開情報、公開日・終了日の入力フィールドを含みます。
 */
export default function ProductFormFields({
  formData,
  setFormData,
  categories,
  submitting,
  uploading,
  compressing,
  imagePreview,
  onImageChange,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductFormFieldsProps) {
  return (
    <>
      <ProductBasicFields
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        fieldPrefix={fieldPrefix}
      />

      <ProductImageField
        fieldPrefix={fieldPrefix}
        submitting={submitting}
        uploading={uploading}
        compressing={compressing}
        imagePreview={imagePreview}
        onImageChange={onImageChange}
      />

      <ProductPriceFields
        formData={formData}
        setFormData={setFormData}
        fieldPrefix={fieldPrefix}
      />

      <ProductDateFields
        formData={formData}
        setFormData={setFormData}
        hasDateRangeValue={hasDateRangeValue}
        fieldPrefix={fieldPrefix}
      />
    </>
  );
}
