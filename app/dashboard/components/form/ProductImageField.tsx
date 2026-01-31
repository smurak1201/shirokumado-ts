import Image from "next/image";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";

interface ProductImageFieldProps {
  fieldPrefix?: string;
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 商品フォームの画像フィールドコンポーネント
 *
 * 商品画像のアップロードとプレビュー機能を提供します。
 */
export default function ProductImageField({
  fieldPrefix = "",
  submitting,
  uploading,
  compressing,
  imagePreview,
  onImageChange,
}: ProductImageFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${fieldPrefix}image`}>商品画像</Label>
      <Input
        type="file"
        id={`${fieldPrefix}image`}
        accept="image/*"
        onChange={onImageChange}
        disabled={submitting || uploading || compressing}
        className="file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />
      {compressing && (
        <p className="text-sm text-gray-500">画像を圧縮中...</p>
      )}
      {(uploading || submitting) && (
        <p className="text-sm text-gray-500">
          {uploading ? "画像をアップロード中..." : "処理中..."}
        </p>
      )}
      {imagePreview && (
        <div>
          <div className="relative h-32 w-32">
            <Image
              src={imagePreview}
              alt="プレビュー"
              fill
              className="rounded object-cover"
              unoptimized
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">プレビュー</p>
        </div>
      )}
    </div>
  );
}
