"use client";

import { useProductForm } from "../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import type { Category } from "../types";

interface DashboardFormProps {
  categories: Category[];
  onProductCreated?: () => Promise<void>;
  onClose?: () => void;
  isOpen: boolean;
}

/**
 * 新規商品登録フォームコンポーネント
 *
 * モーダル形式で新規商品を登録するためのフォームを表示します。
 * 画像の圧縮・アップロード、公開日・終了日の設定、公開状態の自動判定などの機能を提供します。
 */
export default function DashboardForm({
  categories,
  onProductCreated,
  onClose,
  isOpen,
}: DashboardFormProps) {
  if (!isOpen) return null;

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
  } = useProductForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const imageUrl = await uploadImage();

      const response = await fetch("/api/products", {
        method: "POST",
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
        throw new Error(error.error || "登録に失敗しました");
      }

      await response.json();

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setFormData({
        name: "",
        description: "",
        imageFile: null,
        imageUrl: "",
        priceS: "",
        priceL: "",
        categoryId: "",
        published: true,
        publishedAt: "",
        endedAt: "",
      });

      if (onProductCreated) {
        await onProductCreated();
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("登録エラー:", error);
      alert(
        error instanceof Error ? error.message : "商品の登録に失敗しました"
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
          <h2 className="text-xl font-semibold">新規商品登録</h2>
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
            onImageChange={(e) => handleImageChange(e)}
            hasDateRangeValue={hasDateRangeValue}
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
                ? "登録中..."
                : "商品を登録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
