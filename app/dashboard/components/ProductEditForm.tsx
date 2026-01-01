"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  tags: Tag[];
  publishedAt: string | null;
  endedAt: string | null;
}

interface ProductEditFormProps {
  product: Product;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function ProductEditForm({
  product,
  categories,
  tags,
  onClose,
  onUpdated,
}: ProductEditFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.imageUrl
  );

  // フォーム状態
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    imageFile: null as File | null,
    imageUrl: product.imageUrl || "",
    priceS: product.priceS?.toString() || "",
    priceL: product.priceL?.toString() || "",
    categoryId: product.category.id.toString(),
    tagIds: product.tags.map((tag) => tag.id),
    publishedAt: product.publishedAt
      ? new Date(product.publishedAt).toISOString().slice(0, 16)
      : "",
    endedAt: product.endedAt
      ? new Date(product.endedAt).toISOString().slice(0, 16)
      : "",
  });

  // 画像ファイル選択
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(product.imageUrl);
      return;
    }

    // ファイルタイプの検証
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルのみ選択可能です");
      return;
    }

    // ファイルサイズの検証（5MB制限）
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert("ファイルサイズは5MB以下である必要があります");
      return;
    }

    setFormData((prev) => ({ ...prev, imageFile: file }));

    // プレビュー用のURLを生成
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUploading(false);

    try {
      let imageUrl: string | null = formData.imageUrl || null;

      // 新しい画像ファイルがある場合は先にBlobにアップロード
      if (formData.imageFile) {
        setUploading(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", formData.imageFile);

          const uploadResponse = await fetch("/api/products/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.error || "画像のアップロードに失敗しました");
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          alert(
            error instanceof Error
              ? error.message
              : "画像のアップロードに失敗しました"
          );
          setUploading(false);
          setSubmitting(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // 商品を更新
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
          tagIds: formData.tagIds.length > 0 ? formData.tagIds : [],
          publishedAt: formData.publishedAt || null,
          endedAt: formData.endedAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新に失敗しました");
      }

      await response.json();
      alert("商品の更新が完了しました");

      // プレビューURLをクリーンアップ
      if (imagePreview && imagePreview !== product.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error("更新エラー:", error);
      alert(
        error instanceof Error ? error.message : "商品の更新に失敗しました"
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // タグの選択
  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">商品を編集</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 商品名 */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700"
            >
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* 商品説明 */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700"
            >
              商品説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* 画像アップロード */}
          <div>
            <label
              htmlFor="edit-image"
              className="block text-sm font-medium text-gray-700"
            >
              商品画像
            </label>
            <input
              type="file"
              id="edit-image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting || uploading}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {(uploading || submitting) && (
              <p className="mt-2 text-sm text-gray-500">
                {uploading ? "画像をアップロード中..." : "更新中..."}
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

          {/* 価格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-priceS"
                className="block text-sm font-medium text-gray-700"
              >
                Sサイズの料金（円）
              </label>
              <input
                type="number"
                id="edit-priceS"
                min="0"
                step="1"
                value={formData.priceS}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priceS: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="edit-priceL"
                className="block text-sm font-medium text-gray-700"
              >
                Lサイズの料金（円）
              </label>
              <input
                type="number"
                id="edit-priceL"
                min="0"
                step="1"
                value={formData.priceL}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priceL: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          {/* カテゴリー */}
          <div>
            <label
              htmlFor="edit-categoryId"
              className="block text-sm font-medium text-gray-700"
            >
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-categoryId"
              required
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              タグ
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.tagIds.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="mr-2"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          {/* 公開日・終了日 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="edit-publishedAt"
                className="block text-sm font-medium text-gray-700"
              >
                公開日
              </label>
              <div className="relative mt-1">
                <input
                  type="datetime-local"
                  id="edit-publishedAt"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publishedAt: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                htmlFor="edit-endedAt"
                className="block text-sm font-medium text-gray-700"
              >
                終了日
              </label>
              <div className="relative mt-1">
                <input
                  type="datetime-local"
                  id="edit-endedAt"
                  value={formData.endedAt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endedAt: e.target.value }))
                  }
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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

          {/* ボタン */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
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
