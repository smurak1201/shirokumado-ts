'use client';

import { useState, useEffect } from 'react';

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

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    priceS: '',
    priceL: '',
    categoryId: '',
    tagIds: [] as number[],
    publishedAt: '',
    endedAt: '',
  });

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/products'),
        ]);

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();
        const productsData = await productsRes.json();

        setCategories(categoriesData.categories || []);
        setTags(tagsData.tags || []);
        setProducts(productsData.products || []);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'アップロードに失敗しました');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      alert('画像のアップロードが完了しました');
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert(error instanceof Error ? error.message : '画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
          priceS: formData.priceS ? parseFloat(formData.priceS) : null,
          priceL: formData.priceL ? parseFloat(formData.priceL) : null,
          tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
          publishedAt: formData.publishedAt || null,
          endedAt: formData.endedAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登録に失敗しました');
      }

      await response.json();
      alert('商品の登録が完了しました');

      // フォームをリセット
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        priceS: '',
        priceL: '',
        categoryId: '',
        tagIds: [],
        publishedAt: '',
        endedAt: '',
      });

      // 商品一覧を更新
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('登録エラー:', error);
      alert(error instanceof Error ? error.message : '商品の登録に失敗しました');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        {/* 商品登録フォーム */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">新規商品登録</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 商品名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* 商品説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                商品説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* 画像アップロード */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                商品画像
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="mt-2 text-sm text-gray-500">アップロード中...</p>}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="プレビュー"
                    className="h-32 w-32 rounded object-cover"
                  />
                  <p className="mt-1 text-xs text-gray-500">アップロード済み</p>
                </div>
              )}
            </div>

            {/* 価格 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priceS" className="block text-sm font-medium text-gray-700">
                  Sサイズの料金（円）
                </label>
                <input
                  type="number"
                  id="priceS"
                  min="0"
                  step="1"
                  value={formData.priceS}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceS: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="priceL" className="block text-sm font-medium text-gray-700">
                  Lサイズの料金（円）
                </label>
                <input
                  type="number"
                  id="priceL"
                  min="0"
                  step="1"
                  value={formData.priceL}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceL: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            {/* カテゴリー */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                required
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">タグ</label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700">
                  公開日
                </label>
                <input
                  type="datetime-local"
                  id="publishedAt"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endedAt" className="block text-sm font-medium text-gray-700">
                  終了日
                </label>
                <input
                  type="datetime-local"
                  id="endedAt"
                  value={formData.endedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endedAt: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? '登録中...' : '商品を登録'}
              </button>
            </div>
          </form>
        </div>

        {/* 登録済み商品一覧 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">登録済み商品一覧</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">登録されている商品はありません</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex gap-4">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-24 w-24 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {product.category.name}
                        </span>
                        {product.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {product.priceS && <span>S: ¥{product.priceS.toLocaleString()}</span>}
                        {product.priceS && product.priceL && <span className="mx-2">/</span>}
                        {product.priceL && <span>L: ¥{product.priceL.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
