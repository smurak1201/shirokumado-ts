"use client";

type Product = {
  id: number;
  name: string;
  imageUrl: string | null;
};

type ProductTileProps = {
  product: Product;
  onClick: () => void;
};

/**
 * 商品タイルコンポーネント（画像と商品名のみ表示）
 */
export default function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
      aria-label={`${product.name}の詳細を見る`}
    >
      {/* 商品画像 */}
      {product.imageUrl ? (
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* ホバー時のオーバーレイ */}
          <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100" />
      )}

      {/* 商品名 */}
      <div className="p-5 md:p-6">
        <h3 className="text-center text-lg font-medium leading-relaxed text-gray-800 md:text-xl">
          {product.name}
        </h3>
      </div>
    </button>
  );
}
