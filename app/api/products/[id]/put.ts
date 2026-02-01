/**
 * 商品更新ハンドラー
 *
 * ## 目的
 * 指定されたIDの商品をデータベースで更新します。
 * 商品情報のバリデーション、画像の更新・削除、公開状態の自動判定を行います。
 *
 * ## 主な機能
 * - 商品情報のバリデーション（別ファイルで実装）
 * - カテゴリーの存在確認
 * - 公開日・終了日に基づく公開状態の自動判定
 * - 画像更新時の古い画像削除（Blobストレージ）
 * - 商品情報の更新
 *
 * ## リクエストボディ
 * すべてのフィールドは任意（更新したいフィールドのみ送信）
 * ```json
 * {
 *   "name": "商品名",
 *   "description": "商品説明",
 *   "imageUrl": "https://...",
 *   "priceS": 500,
 *   "priceL": 700,
 *   "categoryId": 1,
 *   "published": true,
 *   "publishedAt": "2024-01-01T00:00:00Z",
 *   "endedAt": null
 * }
 * ```
 *
 * ## レスポンス
 * ```json
 * {
 *   "product": {
 *     "id": 1,
 *     "name": "更新後の商品名",
 *     ...
 *   }
 * }
 * ```
 *
 * ## 実装の理由
 * - 部分更新: すべてのフィールドが任意のため、送信されたフィールドのみ更新
 * - 画像削除: 古い画像をストレージから削除し、ストレージコストを抑制
 * - 公開状態の自動判定: 公開日・終了日に基づいて自動的に公開状態を更新
 *
 * @module app/api/products/[id]/put
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { determinePublishedStatus, resolveDateValue } from '@/lib/product-utils';
import { deleteFile } from '@/lib/blob';
import { validateProductUpdate } from './put-validation';

/**
 * 商品更新リクエストボディの型定義
 *
 * すべてのフィールドは任意（Optional）です。
 * クライアントは更新したいフィールドのみを送信します。
 *
 * ## 型の理由
 * - string | null: 画像URLのクリア（null）と設定（string）の両方をサポート
 * - number | string | null: 価格フィールドはフォームから文字列で送信される可能性があるため
 */
export interface ProductUpdateRequestBody {
  /** 商品名（任意） */
  name?: string;
  /** 商品説明（任意） */
  description?: string;
  /** 商品画像URL（任意、null でクリア可能） */
  imageUrl?: string | null;
  /** カテゴリーID（任意） */
  categoryId?: number;
  /** Sサイズの価格（任意、null でクリア可能） */
  priceS?: number | string | null;
  /** Lサイズの価格（任意、null でクリア可能） */
  priceL?: number | string | null;
  /** 公開状態（任意） */
  published?: boolean;
  /** 公開日（任意、null でクリア可能） */
  publishedAt?: string | null;
  /** 終了日（任意、null でクリア可能） */
  endedAt?: string | null;
}

/**
 * データベース更新用のデータ型定義
 *
 * リクエストボディとは異なり、データベースに保存する形式に変換されています。
 *
 * ## 型の理由
 * - published: 常に boolean（自動判定されるため必須）
 * - priceS, priceL: 文字列から number に変換済み
 * - publishedAt, endedAt: 文字列から Date オブジェクトに変換済み
 */
interface ProductUpdateData {
  /** 商品名（任意） */
  name?: string;
  /** 商品説明（任意） */
  description?: string;
  /** 商品画像URL（任意） */
  imageUrl?: string | null;
  /** カテゴリーID（任意） */
  categoryId?: number;
  /** Sサイズの価格（任意、数値に変換済み） */
  priceS?: number | null;
  /** Lサイズの価格（任意、数値に変換済み） */
  priceL?: number | null;
  /** 公開状態（必須、自動判定される） */
  published: boolean;
  /** 公開日（任意、Dateオブジェクトに変換済み） */
  publishedAt?: Date | null;
  /** 終了日（任意、Dateオブジェクトに変換済み） */
  endedAt?: Date | null;
}

/**
 * 商品を更新する関数
 *
 * 商品情報のバリデーション、カテゴリーの存在確認、公開日・終了日に基づく公開状態の自動判定を行い、
 * 画像更新時は古い画像を削除してから商品情報を更新します。
 *
 * @param request - リクエストオブジェクト（商品情報を含む）
 * @param params - URLパラメータ（id を含む）
 * @returns 更新された商品情報を含むJSONレスポンス
 * @throws NotFoundError 商品が存在しない場合
 * @throws ValidationError バリデーションエラーが発生した場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - 2回のデータベースクエリ: バリデーション時と更新時に商品を取得
 *   （理由: バリデーションと更新の間に商品が削除される可能性があるため）
 * - 画像削除: 古い画像をストレージから削除し、ストレージコストを抑制
 * - 部分更新: 送信されたフィールドのみを更新するため、updateData に条件付きで追加
 */
export async function putProduct(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  // URLパラメータから商品IDを取得
  const { id } = await params;

  // 商品IDをパース（文字列 → 数値変換 + バリデーション）
  const productId = parseProductId(id);

  // リクエストボディをJSONとしてパース
  const body = await request.json() as ProductUpdateRequestBody;

  // バリデーション処理（別ファイルで実装）
  // 商品の存在確認、商品名・説明・カテゴリーIDのバリデーションを行います
  await validateProductUpdate(productId, body, id);

  // 既存の商品情報を取得
  // 注意: バリデーション時にも商品を取得していますが、ここでも再取得します
  // 理由: バリデーションと更新の間に商品が削除される可能性があるため
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - get existing`
  );

  // 商品が存在しない場合はエラー（念のための防御的プログラミング）
  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 公開日・終了日の解決
  // resolveDateValue: リクエストで指定されていれば新しい値、未指定なら既存の値を使用
  const publishedAt = resolveDateValue(body.publishedAt, existingProduct.publishedAt);
  const endedAt = resolveDateValue(body.endedAt, existingProduct.endedAt);

  // 公開状態を自動判定
  // 公開日・終了日に基づいて、実際の公開状態を決定します
  // デフォルトは既存商品の公開状態
  const published = determinePublishedStatus(
    publishedAt,
    endedAt,
    body.published,
    existingProduct.published // デフォルトは既存商品の公開状態
  );

  // 画像URL の更新処理
  const oldImageUrl = existingProduct.imageUrl;
  // body.imageUrl が undefined なら既存の値を維持、null なら null（クリア）、文字列ならその値を使用
  const newImageUrl = body.imageUrl !== undefined ? (body.imageUrl || null) : oldImageUrl;

  // 画像が更新される場合、古い画像を削除
  // 条件: 古い画像が存在し、新しい画像も存在し、両者が異なる
  // 理由: ストレージコストを抑制するため、不要な画像は削除します
  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    await deleteFile(oldImageUrl);
    log.info("元の画像を削除しました", {
      context: `PUT /api/products/${id}`,
      metadata: { oldImageUrl },
    });
  }

  // 更新用のデータオブジェクトを構築
  // published は常に設定（自動判定されるため）
  const updateData: ProductUpdateData = {
    published,
  };

  // 部分更新: リクエストボディに含まれるフィールドのみを更新
  // 理由: クライアントは更新したいフィールドのみを送信するため、未指定のフィールドは既存の値を維持
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
  // 価格フィールドは文字列で送信される可能性があるため、parseFloat で変換
  if (body.priceS !== undefined) updateData.priceS = body.priceS ? parseFloat(String(body.priceS)) : null;
  if (body.priceL !== undefined) updateData.priceL = body.priceL ? parseFloat(String(body.priceL)) : null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  if (body.publishedAt !== undefined) updateData.publishedAt = publishedAt;
  if (body.endedAt !== undefined) updateData.endedAt = endedAt;

  // データベースで商品を更新
  // safePrismaOperation でラップすることで、エラー時の自動ロギングを実現
  const product = await safePrismaOperation(
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        // カテゴリー情報を含めて返却（レスポンスで使用するため）
        include: {
          category: true,
        },
      }),
    `PUT /api/products/${id}`
  );

  // 商品更新の失敗チェック（念のための防御的プログラミング）
  // 通常は safePrismaOperation 内でエラーがスローされるため、ここには到達しない
  if (!product) {
    throw new NotFoundError('商品');
  }

  // 成功レスポンスを返却（ステータスコード200）
  return apiSuccess({ product });
}
