/**
 * 商品フォーム価格フィールドコンポーネント
 *
 * Sサイズ・Lサイズの価格入力フィールドを提供。
 * 数値のみの入力制限とカンマ区切り表示（1,000円）に自動フォーマット。
 */

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { formatPriceForInput, parsePrice, isNumericKey } from "@/lib/product-utils";
import type { ProductFormData } from "../../hooks/useProductForm";

interface PriceInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * type="text": カンマ区切り表示のため（type="number"だとカンマが使えない）
 * inputMode="numeric": モバイル端末で数値キーボードを表示
 */
function PriceInput({ id, label, value, onChange }: PriceInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        type="text"
        id={id}
        inputMode="numeric"
        value={formatPriceForInput(value)}
        onKeyDown={(e) => {
          if (!isNumericKey(e)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => onChange(parsePrice(e.target.value))}
      />
    </div>
  );
}

interface ProductPriceFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  fieldPrefix?: string;
}

export default function ProductPriceFields({
  formData,
  setFormData,
  fieldPrefix = "",
}: ProductPriceFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PriceInput
        id={`${fieldPrefix}priceS`}
        label="Sサイズの料金（円）"
        value={formData.priceS}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, priceS: value }))
        }
      />
      <PriceInput
        id={`${fieldPrefix}priceL`}
        label="Lサイズの料金（円）"
        value={formData.priceL}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, priceL: value }))
        }
      />
    </div>
  );
}
