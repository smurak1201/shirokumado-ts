import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { formatPriceForInput, parsePrice, isNumericKey } from "@/lib/product-utils";
import type { ProductFormData } from "../../hooks/useProductForm";

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
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}priceS`}>Sサイズの料金（円）</Label>
        <Input
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}priceL`}>Lサイズの料金（円）</Label>
        <Input
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
        />
      </div>
    </div>
  );
}
