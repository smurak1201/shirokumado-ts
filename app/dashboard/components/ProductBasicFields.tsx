import type { Category } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

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
      <div>
        <label
          htmlFor={`${fieldPrefix}name`}
          className="block text-sm font-medium text-gray-700"
        >
          商品名 <span className="text-red-500">*</span>
        </label>
        <textarea
          id={`${fieldPrefix}name`}
          required
          rows={2}
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor={`${fieldPrefix}description`}
          className="block text-sm font-medium text-gray-700"
        >
          商品説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id={`${fieldPrefix}description`}
          required
          rows={6}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor={`${fieldPrefix}categoryId`}
          className="block text-sm font-medium text-gray-700"
        >
          カテゴリー <span className="text-red-500">*</span>
        </label>
        <select
          id={`${fieldPrefix}categoryId`}
          required
          value={formData.categoryId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {fieldPrefix === "" && <option value="">選択してください</option>}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
