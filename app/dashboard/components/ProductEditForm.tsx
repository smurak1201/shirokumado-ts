"use client";

import { useProductForm } from "../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import type { Category, Product } from "../types";

interface ProductEditFormProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export default function ProductEditForm({
  product,
  categories,
  onClose,
  onUpdated,
}: ProductEditFormProps) {
  const {
    formData,
    setFormData,
    submitting,
    setSubmitting,
    uploading,
    compressing,
    imagePreview,
    handleImageChange,
    uploadImage,
    hasDateRangeValue,
  } = useProductForm({
    initialImageUrl: product.imageUrl,
    initialFormData: {
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl || "",
      priceS: product.priceS?.toString() || "",
      priceL: product.priceL?.toString() || "",
      categoryId: product.category.id.toString(),
      published: product.published ?? true,
      publishedAt: product.publishedAt
        ? new Date(product.publishedAt).toISOString().slice(0, 16)
        : "",
      endedAt: product.endedAt
        ? new Date(product.endedAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl: string | null = formData.imageUrl || null;

      if (formData.imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (error) {
          alert(
            error instanceof Error
              ? error.message
              : "画像のアップロードに失敗しました"
          );
          setSubmitting(false);
          return;
        }
      }

      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl,
          categoryId: parseInt(formData.categoryId),
          priceS: formData.priceS ? parseFloat(formData.priceS) : null,
          priceL: formData.priceL ? parseFloat(formData.priceL) : null,
          published: formData.published,
          publishedAt: formData.publishedAt || null,
          endedAt: formData.endedAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新に失敗しました");
      }

      await response.json();

      if (imagePreview && imagePreview !== product.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }

      await onUpdated();
      onClose();
    } catch (error) {
      console.error("更新エラー:", error);
      alert(
        error instanceof Error ? error.message : "商品の更新に失敗しました"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-full sm:max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg bg-white p-4 sm:p-6 shadow-lg mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">商品を編集</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            submitting={submitting}
            uploading={uploading}
            compressing={compressing}
            imagePreview={imagePreview}
            onImageChange={(e) => handleImageChange(e, product.imageUrl)}
            hasDateRangeValue={hasDateRangeValue}
            fieldPrefix="edit-"
          />
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading || compressing}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || compressing}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading
                ? "画像をアップロード中..."
                : submitting
                ? "更新中..."
                : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
