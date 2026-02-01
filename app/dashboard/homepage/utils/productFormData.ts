/**
 * @fileoverview 商品フォームデータ変換ユーティリティ - データ形式の相互変換
 *
 * ## 目的
 * - フォームデータと商品データの相互変換を提供
 * - 商品作成・編集フォームのデータ操作を一元管理
 * - 型安全な変換処理を実現
 *
 * ## 主な機能
 * - フォームデータのリセット（新規作成時の初期値）
 * - 商品データからフォームデータへの変換（編集時）
 * - フォームデータからAPI送信用データへの変換
 *
 * ## 使用場所
 * - app/dashboard/homepage/hooks/useProductForm.ts（フォームロジック）
 * - app/dashboard/homepage/utils/productFormSubmit.ts（送信処理）
 * - app/dashboard/homepage/components/modals/ProductCreateModal.tsx（作成モーダル）
 * - app/dashboard/homepage/components/modals/ProductEditModal.tsx（編集モーダル）
 *
 * ## 実装の特性
 * - **純粋関数**: 副作用なし、テストしやすい
 * - **型安全性**: TypeScript の型チェックを活用
 * - **クライアント・サーバー両用**: Reactフックに依存しない
 *
 * ## データ変換の流れ
 * 1. 新規作成: resetProductFormData() → フォーム → prepareProductSubmitData() → API
 * 2. 編集: 商品データ → createInitialFormDataFromProduct() → フォーム → prepareProductSubmitData() → API
 *
 * ## ベストプラクティス
 * - null と undefined を適切に処理
 * - 数値変換時の NaN チェック（parseFloat, parseInt）
 * - 日時フォーマットの統一（ISO 8601形式）
 */

import type { Product } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

/**
 * フォームデータをリセットする関数
 *
 * 商品作成モーダルの初期値や、フォーム送信後のクリーンアップに使用します。
 * すべてのフィールドを空の状態に初期化します。
 *
 * @returns 空のフォームデータ
 *
 * ## デフォルト値の設定理由
 * - **published: true**: 新規商品は通常公開するため（非公開にする場合は明示的に変更）
 * - **価格フィールド: ""**: 未入力状態を表現（0 だと「0円」と区別がつかない）
 * - **日時フィールド: ""**: 未設定状態を表現（null より空文字の方がinput[type="datetime-local"]と相性が良い）
 *
 * ## 使用例
 * ```tsx
 * // 新規作成モーダルを開く時
 * setFormData(resetProductFormData());
 *
 * // 送信完了後のクリーンアップ
 * setFormData(resetProductFormData());
 * ```
 */
export function resetProductFormData(): ProductFormData {
  return {
    name: "", // 商品名は必須項目なので空文字
    description: "", // 説明は任意項目なので空文字
    imageFile: null, // 画像ファイルは未選択状態
    imageUrl: "", // 既存画像URLは空（新規作成時は不要）
    priceS: "", // Sサイズ価格は未入力状態
    priceL: "", // Lサイズ価格は未入力状態
    categoryId: "", // カテゴリーは未選択状態（ドロップダウンで選択必須）
    published: true, // 公開状態がデフォルト（商品は基本的に公開する想定）
    publishedAt: "", // 公開日時は未設定（設定しない場合は即座に公開）
    endedAt: "", // 終了日時は未設定（設定しない場合は無期限公開）
  };
}

/**
 * 商品データからフォームの初期データを生成する関数
 *
 * 商品編集時に、既存の商品情報をフォームの入力形式に変換します。
 * APIから取得した商品データ（number型の価格など）を
 * フォームで編集可能な形式（string型の価格など）に変換します。
 *
 * @param product - 編集対象の商品データ（APIから取得した形式）
 * @returns フォームの初期データ（Partial型: imageFileは含まれない）
 *
 * ## Partial<ProductFormData> を返す理由
 * - imageFile フィールドは編集時には存在しない（新しい画像を選択した時のみ設定される）
 * - 既存の imageUrl を保持し、新しい画像をアップロードしない限りそのまま使用
 *
 * ## 型変換の詳細
 * - **number → string**: 価格（priceS, priceL）、カテゴリーID
 *   - 理由: input要素は文字列を扱うため
 *   - null の場合は空文字に変換（未入力として表示）
 * - **Date → string**: 日時（publishedAt, endedAt）
 *   - ISO 8601形式の最初の16文字を使用（"YYYY-MM-DDTHH:mm"）
 *   - 理由: input[type="datetime-local"] の仕様に準拠
 *
 * ## null チェックと ?? 演算子
 * - published ?? true: published が null/undefined の場合は true にフォールバック
 * - 理由: データベースで published が null の可能性に対応
 *
 * ## 日時フォーマットの詳細
 * - toISOString(): "2025-01-15T12:30:00.000Z" の形式で返す
 * - slice(0, 16): "2025-01-15T12:30" を抽出（秒とタイムゾーンを除外）
 * - 理由: datetime-local は秒とタイムゾーンを受け付けない
 *
 * ## 使用例
 * ```tsx
 * // 編集モーダルを開く時
 * const initialData = createInitialFormDataFromProduct(product);
 * setFormData({ ...resetProductFormData(), ...initialData });
 * ```
 */
export function createInitialFormDataFromProduct(
  product: Product
): Partial<ProductFormData> {
  return {
    name: product.name, // 商品名（必須）
    description: product.description, // 説明（任意）
    imageUrl: product.imageUrl || "", // 既存画像URL（null の場合は空文字）
    // 価格を number から string に変換（input要素で編集可能にするため）
    priceS: product.priceS?.toString() || "", // Sサイズ価格（null なら空文字）
    priceL: product.priceL?.toString() || "", // Lサイズ価格（null なら空文字）
    // カテゴリーIDを number から string に変換（select要素で選択するため）
    categoryId: product.category.id.toString(),
    // 公開状態（null の場合は true にフォールバック）
    published: product.published ?? true,
    // 公開日時を ISO 8601 形式に変換し、datetime-local 用にフォーマット
    publishedAt: product.publishedAt
      ? new Date(product.publishedAt).toISOString().slice(0, 16)
      : "", // 未設定の場合は空文字
    // 終了日時を ISO 8601 形式に変換し、datetime-local 用にフォーマット
    endedAt: product.endedAt
      ? new Date(product.endedAt).toISOString().slice(0, 16)
      : "", // 未設定の場合は空文字
  };
}

/**
 * 商品フォームの送信データを準備する関数
 *
 * フォーム入力データ（string型の価格など）を
 * API送信用の形式（number型の価格など）に変換します。
 * この関数は商品作成と商品更新の両方で使用されます。
 *
 * @param formData - フォームの入力データ
 * @param imageUrl - アップロード済みの画像URL（アップロードしない場合は null）
 * @returns API送信用のデータオブジェクト
 *
 * ## 型変換の詳細
 * - **string → number**: 価格（priceS, priceL）、カテゴリーID
 *   - parseInt: カテゴリーIDを整数に変換
 *   - parseFloat: 価格を浮動小数点数に変換（小数点を許容）
 *   - 空文字の場合は null に変換（未設定を表現）
 *
 * ## なぜ parseFloat を使うのか
 * - 価格は小数点を含む可能性がある（例: 350.5円）
 * - parseInt だと小数点以下が切り捨てられてしまう
 * - データベースの DECIMAL 型に対応
 *
 * ## なぜ parseInt を使うのか
 * - カテゴリーIDは整数のみ（小数点は不要）
 * - 明示的に整数変換することで意図を明確にする
 *
 * ## null と空文字の処理
 * - publishedAt: 空文字なら null、値があればそのまま送信
 * - endedAt: 空文字なら null、値があればそのまま送信
 * - 理由: APIでは日時未設定を null で表現する
 *
 * ## imageUrl の処理
 * - 引数として受け取る理由: アップロード処理と変換処理を分離するため
 * - null を許容: 画像なしの商品を許可（既存画像を削除する場合など）
 *
 * ## 返り値の型を明示的に定義する理由
 * - API契約を明確にする（送信するデータ構造を保証）
 * - 型チェックでフィールドの漏れを防ぐ
 * - 後から API の仕様を変更する際に影響範囲を把握しやすい
 *
 * ## 使用例
 * ```tsx
 * // 画像アップロード後、送信データを準備
 * const imageUrl = await uploadImage();
 * const submitData = prepareProductSubmitData(formData, imageUrl);
 * await fetch("/api/products", {
 *   method: "POST",
 *   body: JSON.stringify(submitData),
 * });
 * ```
 */
export function prepareProductSubmitData(
  formData: ProductFormData,
  imageUrl: string | null
): {
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  priceS: number | null;
  priceL: number | null;
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
} {
  return {
    name: formData.name, // 商品名（そのまま送信）
    description: formData.description, // 説明（そのまま送信）
    imageUrl, // アップロード済みの画像URL（または null）
    // カテゴリーIDを string から number に変換
    categoryId: parseInt(formData.categoryId),
    // Sサイズ価格を string から number に変換（空なら null）
    // parseFloat: 小数点を許容（例: "350.5" → 350.5）
    priceS: formData.priceS ? parseFloat(formData.priceS) : null,
    // Lサイズ価格を string から number に変換（空なら null）
    priceL: formData.priceL ? parseFloat(formData.priceL) : null,
    published: formData.published, // 公開状態（そのまま送信）
    // 公開日時（空文字なら null、値があればそのまま送信）
    publishedAt: formData.publishedAt || null,
    // 終了日時（空文字なら null、値があればそのまま送信）
    endedAt: formData.endedAt || null,
  };
}
