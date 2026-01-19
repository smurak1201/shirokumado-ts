import { formatPriceForInput, parsePrice, isNumericKey } from "@/lib/product-utils";
import type { ProductFormData } from "../hooks/useProductForm";

interface ProductPriceFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  fieldPrefix?: string;
}

/**
 * 商品フォームの価格フィールドコンポーネント
 *
 * SサイズとLサイズの価格入力フィールドを提供します。
 */
export default function ProductPriceFields({
  formData,
  setFormData,
  fieldPrefix = "",
}: ProductPriceFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label
          htmlFor={`${fieldPrefix}priceS`}
          className="block text-sm font-medium text-gray-700"
        >
          Sサイズの料金（円）
        </label>
        <input
          type="text"
          id={`${fieldPrefix}priceS`}
          inputMode="numeric"
          value={formatPriceForInput(formData.priceS)}
          onKeyDown={(e) => {
            if (!isNumericKey(e)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const cleaned = parsePrice(e.target.value);
            setFormData((prev) => ({ ...prev, priceS: cleaned }));
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor={`${fieldPrefix}priceL`}
          className="block text-sm font-medium text-gray-700"
        >
          Lサイズの料金（円）
        </label>
        <input
          type="text"
          id={`${fieldPrefix}priceL`}
          inputMode="numeric"
          value={formatPriceForInput(formData.priceL)}
          onKeyDown={(e) => {
            if (!isNumericKey(e)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const cleaned = parsePrice(e.target.value);
            setFormData((prev) => ({ ...prev, priceL: cleaned }));
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
