import { formatPrice, parsePrice, isNumericKey } from "@/lib/product-utils";
import type { Category } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

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
          htmlFor={`${fieldPrefix}image`}
          className="block text-sm font-medium text-gray-700"
        >
          商品画像
        </label>
        <input
          type="file"
          id={`${fieldPrefix}image`}
          accept="image/*"
          onChange={onImageChange}
          disabled={submitting || uploading || compressing}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
        {compressing && (
          <p className="mt-2 text-sm text-gray-500">画像を圧縮中...</p>
        )}
        {(uploading || submitting) && (
          <p className="mt-2 text-sm text-gray-500">
            {uploading ? "画像をアップロード中..." : "処理中..."}
          </p>
        )}
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="プレビュー"
              className="h-32 w-32 rounded object-cover"
            />
            <p className="mt-1 text-xs text-gray-500">プレビュー</p>
          </div>
        )}
      </div>

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
            value={formatPrice(formData.priceS)}
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
            value={formatPrice(formData.priceL)}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor={`${fieldPrefix}publishedAt`}
            className="block text-sm font-medium text-gray-700"
          >
            公開日
          </label>
          <div className="relative mt-1">
            <input
              type="datetime-local"
              id={`${fieldPrefix}publishedAt`}
              value={formData.publishedAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  publishedAt: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {formData.publishedAt && (
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, publishedAt: "" }))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="公開日をクリア"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor={`${fieldPrefix}endedAt`}
            className="block text-sm font-medium text-gray-700"
          >
            終了日
          </label>
          <div className="relative mt-1">
            <input
              type="datetime-local"
              id={`${fieldPrefix}endedAt`}
              value={formData.endedAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endedAt: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {formData.endedAt && (
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, endedAt: "" }))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="終了日をクリア"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
