/**
 * @fileoverview 商品フォームカスタムフック - 商品作成・編集の共通ロジック
 *
 * ## 目的
 * - 商品作成・編集フォームの状態管理を統合的に提供
 * - 公開日・終了日に基づく公開状態の自動計算
 * - 画像アップロード処理との連携
 *
 * ## 主な機能
 * - フォームデータの状態管理（商品情報、価格、カテゴリーなど）
 * - 公開日・終了日の変更時に公開状態を自動計算
 * - 画像の圧縮、プレビュー、アップロードの統合管理
 * - フォーム送信状態の管理
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/product/ProductCreateDialog.tsx（新規作成）
 * - app/dashboard/homepage/components/product/ProductEditDialog.tsx（編集）
 *
 * ## 実装の特性
 * - **Client Component専用**: useState、useCallbackに依存
 * - **依存フック**: useImageUploadで画像処理を委譲
 * - **公開状態の自動計算**: lib/product-utilsのcalculatePublishedStatusを使用
 *
 * ## 公開状態の自動計算について
 * - **目的**: 公開日・終了日を変更したときに、公開状態を自動で更新
 * - **タイミング**: publishedAtまたはendedAtが変更されたとき
 * - **ロジック**: 現在時刻が公開期間内かどうかで判定
 * - **トレードオフ**: 自動計算により、ユーザーが手動で公開状態を変更しにくくなる
 *
 * ## データフロー
 * 1. 初期化: initialFormDataから状態を生成
 * 2. 入力変更: setFormDataで状態を更新（公開状態は自動計算）
 * 3. 画像選択: handleImageChangeで圧縮とプレビュー生成
 * 4. フォーム送信: uploadImageでアップロード → 商品データ送信
 */

import { useState, useCallback, type SetStateAction } from "react";
import { calculatePublishedStatus, hasDateRange } from "@/lib/product-utils";
import { useImageUpload } from "./useImageUpload";

/**
 * 商品フォームのデータ型
 *
 * 商品作成・編集フォームで管理するすべてのフィールドを定義します。
 *
 * @property name - 商品名
 * @property description - 商品説明
 * @property imageFile - アップロード前の画像ファイル（圧縮済み、プレビュー用）
 * @property imageUrl - 既存またはアップロード済みの画像URL
 * @property priceS - S サイズの価格（文字列、空文字列可）
 * @property priceL - L サイズの価格（文字列、空文字列可）
 * @property categoryId - カテゴリーID（文字列、選択前は空文字列）
 * @property published - 公開状態（true: 公開、false: 非公開）
 * @property publishedAt - 公開開始日時（ISO 8601形式、空文字列可）
 * @property endedAt - 公開終了日時（ISO 8601形式、空文字列可）
 */
export interface ProductFormData {
  name: string;
  description: string;
  imageFile: File | null;
  imageUrl: string;
  priceS: string;
  priceL: string;
  categoryId: string;
  published: boolean;
  publishedAt: string;
  endedAt: string;
}

/**
 * useProductFormのオプション型
 *
 * @property initialImageUrl - 初期画像URL（編集時の既存画像）
 * @property initialFormData - 初期フォームデータ（編集時の既存データ）
 */
interface UseProductFormOptions {
  initialImageUrl?: string | null;
  initialFormData?: Partial<ProductFormData>;
}

/**
 * 商品フォームの状態管理を行うカスタムフック
 *
 * 商品作成・編集フォームで使用する共通ロジックを提供します。
 * 公開日・終了日の変更時に公開状態を自動計算するカスタムsetFormDataを提供します。
 *
 * @param options - 初期化オプション（画像URL、フォームデータ）
 * @returns フォームデータ、状態更新関数、画像処理関数、ローディング状態
 *
 * ## 使用例（新規作成）
 * ```tsx
 * const { formData, setFormData, handleImageChange, uploadImage, submitting, setSubmitting } = useProductForm();
 * ```
 *
 * ## 使用例（編集）
 * ```tsx
 * const { formData, setFormData, ... } = useProductForm({
 *   initialImageUrl: product.imageUrl,
 *   initialFormData: {
 *     name: product.name,
 *     description: product.description,
 *     ...
 *   }
 * });
 * ```
 *
 * ## 実装の理由
 * - **共通ロジックの再利用**: 作成と編集で同じロジックを使用
 * - **公開状態の自動計算**: 日付変更時に手動で公開状態を変更する手間を削減
 * - **画像処理の統合**: 圧縮、プレビュー、アップロードをワンストップで提供
 */
export function useProductForm(options: UseProductFormOptions = {}) {
  const { initialImageUrl = null, initialFormData = {} } = options;

  // フォーム送信中の状態
  // true: APIリクエスト中（ボタン無効化、ローディング表示）
  const [submitting, setSubmitting] = useState(false);

  // 画像プレビューURL
  // 圧縮後の画像をブラウザ上で表示するためのローカルURL
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);

  // 画像アップロードフックから状態と関数を取得
  const { uploading, compressing, handleImageChange: handleImageChangeInternal, uploadImage: uploadImageInternal } = useImageUpload();

  // フォームデータの内部状態
  // setFormDataInternal は直接使用せず、カスタムsetFormDataを使用
  const [formData, setFormDataInternal] = useState<ProductFormData>({
    name: initialFormData.name || "",
    description: initialFormData.description || "",
    imageFile: null, // アップロード前は常にnull（編集時も新規選択まではnull）
    imageUrl: initialFormData.imageUrl || "",
    priceS: initialFormData.priceS || "",
    priceL: initialFormData.priceL || "",
    categoryId: initialFormData.categoryId || "",
    published: initialFormData.published ?? true, // デフォルトは公開
    publishedAt: initialFormData.publishedAt || "",
    endedAt: initialFormData.endedAt || "",
  });

  /**
   * 公開状態を自動計算するカスタムsetFormData
   *
   * publishedAtまたはendedAtが変更された場合、
   * 現在時刻と比較して公開状態を自動的に更新します。
   *
   * @param updater - 状態更新関数またはオブジェクト
   *
   * ## 処理の流れ
   * 1. updaterを適用して新しい状態を計算
   * 2. publishedAtまたはendedAtが変更されたかチェック
   * 3. 変更されていれば、公開状態を自動計算
   * 4. 新しい状態を返す
   *
   * ## 公開状態の自動計算ロジック
   * - publishedAtまたはendedAtが設定されている場合のみ計算
   * - calculatePublishedStatus: 現在時刻が公開期間内かどうかで判定
   * - 計算結果をpublishedフィールドに反映
   *
   * ## 実装の理由
   * - **UX向上**: 公開日を設定すると自動的に公開状態が更新される
   * - **整合性**: 日付と公開状態が常に一致（手動変更による不整合を防ぐ）
   * - **トレードオフ**: 手動で公開状態を変更しても、日付変更時に上書きされる
   *
   * ## useCallbackの理由
   * - 依存配列が空なので、一度だけ生成される
   * - useEffectの依存配列に含めても再実行されない
   */
  const setFormData = useCallback(
    (updater: SetStateAction<ProductFormData>) => {
      setFormDataInternal((prev) => {
        // updaterが関数の場合は適用、オブジェクトの場合はそのまま使用
        const next = typeof updater === "function" ? updater(prev) : updater;

        // publishedAt/endedAtが変更された場合のみ公開状態を再計算
        // パフォーマンス最適化: 他のフィールド変更時は計算をスキップ
        if (
          next.publishedAt !== prev.publishedAt ||
          next.endedAt !== prev.endedAt
        ) {
          // 文字列をDateオブジェクトに変換（空文字列はnull）
          const publishedAt = next.publishedAt
            ? new Date(next.publishedAt)
            : null;
          const endedAt = next.endedAt ? new Date(next.endedAt) : null;

          // 日付が設定されている場合のみ公開状態を自動計算
          // 両方とも未設定の場合は計算しない（手動で公開状態を変更可能）
          if (publishedAt || endedAt) {
            return {
              ...next,
              published: calculatePublishedStatus(publishedAt, endedAt),
            };
          }
        }
        // 日付未変更、または両方とも未設定の場合はそのまま返す
        return next;
      });
    },
    []
  );

  /**
   * 画像選択時の処理
   *
   * input要素のchangeイベントを受け取り、画像を圧縮してプレビューを表示します。
   * アップロードは行わず、フォーム送信時に uploadImage を呼び出します。
   *
   * @param e - input要素のchangeイベント
   * @param fallbackImageUrl - 圧縮失敗時やキャンセル時のフォールバック画像URL
   *
   * ## 処理の流れ
   * 1. e.target.filesからファイルを取得
   * 2. handleImageChangeInternalで圧縮とプレビュー生成
   * 3. 成功: formDataにファイルを設定、プレビューを更新
   * 4. 失敗: formDataをクリア、プレビューをフォールバックに戻す
   *
   * ## e.target.value = "" の理由
   * - 同じファイルを再選択可能にする
   * - 圧縮失敗後、再度同じファイルを選択するとchangeイベントが発火しない問題を防ぐ
   *
   * ## 実装の理由
   * - **非同期処理**: 圧縮処理を待つためにasyncを使用
   * - **プレビュー表示**: アップロード前にユーザーに画像を確認させる
   * - **状態管理**: imageFileとimagePreviewを同期して更新
   */
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fallbackImageUrl?: string | null
  ) => {
    // input要素から選択されたファイルを取得（未選択の場合はnull）
    const file = e.target.files?.[0] || null;

    // 画像を圧縮してプレビューURLを生成
    const result = await handleImageChangeInternal(file, fallbackImageUrl);

    if (result.file) {
      // 圧縮成功: フォームデータに圧縮済みファイルを設定
      setFormData((prev) => ({ ...prev, imageFile: result.file }));
      // プレビューURLを更新（URL.createObjectURLで生成されたローカルURL）
      setImagePreview(result.previewUrl);
    } else {
      // 圧縮失敗またはキャンセル: フォームデータをクリア
      setFormData((prev) => ({ ...prev, imageFile: null }));
      // プレビューをフォールバックに戻す（編集時は既存画像、新規作成時はnull）
      setImagePreview(result.previewUrl);
      // input要素をリセット（同じファイルを再選択可能にする）
      e.target.value = "";
    }
  };

  /**
   * 画像をアップロードする関数
   *
   * フォーム送信時に呼び出され、圧縮済みの画像をCloudflare R2にアップロードします。
   *
   * @returns アップロードされた画像のURL、または既存URL
   * @throws アップロードに失敗した場合、エラーを再スロー
   *
   * ## 使用タイミング
   * - フォーム送信時（商品作成・編集APIを呼び出す前）
   * - 画像が選択されている場合のみアップロードを実行
   *
   * ## 処理の流れ
   * 1. formData.imageFileが存在する場合: アップロード実行
   * 2. 存在しない場合: 既存のformData.imageUrlを返す
   *
   * ## 実装の理由
   * - **遅延アップロード**: 画像選択時ではなく、フォーム送信時にアップロード
   * - **無駄なアップロード防止**: 画像を選択してもフォームをキャンセルした場合は無駄
   * - **エラーハンドリング**: アップロード失敗時はフォーム送信も中止
   */
  const uploadImage = async (): Promise<string | null> => {
    return uploadImageInternal(formData.imageFile, formData.imageUrl);
  };

  /**
   * 公開期間が設定されているかどうかを判定
   *
   * lib/product-utilsのhasDateRangeを使用して、
   * publishedAtまたはendedAtが設定されているかを判定します。
   *
   * ## 使用場所
   * - フォームUI: 公開期間が設定されている場合のみ「公開状態を手動で変更できない」旨を表示
   * - バリデーション: 公開期間が設定されている場合は公開状態を自動計算
   */
  const hasDateRangeValue = hasDateRange(
    formData.publishedAt ? new Date(formData.publishedAt) : null,
    formData.endedAt ? new Date(formData.endedAt) : null
  );

  return {
    formData, // フォームデータの現在値
    setFormData, // カスタムsetFormData（公開状態を自動計算）
    submitting, // フォーム送信中の状態
    setSubmitting, // フォーム送信状態の更新関数
    uploading, // 画像アップロード中の状態（useImageUploadから）
    compressing, // 画像圧縮中の状態（useImageUploadから）
    imagePreview, // 画像プレビューURL
    handleImageChange, // 画像選択時の処理（圧縮とプレビュー生成）
    uploadImage, // 画像アップロード処理（フォーム送信時）
    hasDateRangeValue, // 公開期間が設定されているか
  };
}
