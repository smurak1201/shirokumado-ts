/**
 * @fileoverview 商品フォーム送信処理ユーティリティ - 作成と更新のロジック
 *
 * ## 目的
 * - 商品作成・更新フォームの送信処理を一元管理
 * - 画像アップロード、API呼び出し、エラーハンドリングを統合
 * - 楽観的UI更新とデータ再取得を実現
 *
 * ## 主な機能
 * - 商品作成の送信処理（画像アップロード → API呼び出し → フォームリセット）
 * - 商品更新の送信処理（画像アップロード → API呼び出し → データ再取得）
 * - エラーハンドリングとユーザーフレンドリーなメッセージ表示
 * - メモリリーク防止（URL.revokeObjectURL）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/modals/ProductCreateModal.tsx（作成モーダル）
 * - app/dashboard/homepage/components/modals/ProductEditModal.tsx（編集モーダル）
 *
 * ## 実装の特性
 * - **非同期処理**: async/await で画像アップロードとAPI呼び出しを順次実行
 * - **エラーハンドリング**: try-catch-finally パターンで確実にローディング状態を解除
 * - **型安全性**: TypeScript の型チェックで引数の誤りを防止
 *
 * ## パフォーマンス最適化
 * - 画像アップロードとAPI呼び出しを直列実行（アップロード完了後に商品登録）
 * - 理由: 画像URLが必要なため並列実行は不可
 * - メモリ管理: URL.revokeObjectURL でプレビューURLを解放
 *
 * ## ベストプラクティス
 * - エラーログにコンテキスト情報を含める（関数名、商品ID）
 * - ユーザーフレンドリーなエラーメッセージを表示（getUserFriendlyMessageJa）
 * - finally ブロックで確実にローディング状態を解除
 */

import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { ProductFormData } from "../hooks/useProductForm";
import {
  resetProductFormData,
  prepareProductSubmitData,
} from "./productFormData";

/**
 * 商品作成フォーム送信の引数型定義
 *
 * handleProductCreateSubmit 関数に渡すパラメータを定義します。
 * 名前付き引数を使用することで、可読性と保守性を向上させています。
 *
 * @property formData - フォームの入力データ（商品名、価格など）
 * @property uploadImage - 画像をアップロードして URL を返す関数
 * @property imagePreview - プレビュー表示用の一時URL（Object URL）
 * @property setSubmitting - 送信中状態を制御する関数（ローディング表示用）
 * @property setFormData - フォームデータを更新する関数（React.useState のセッター）
 * @property onProductCreated - 商品作成成功時のコールバック（データ再取得など）。オプション
 * @property onClose - モーダルを閉じるコールバック。オプション
 */
interface HandleProductCreateSubmitParams {
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  setSubmitting: (value: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onProductCreated?: () => Promise<void>;
  onClose?: () => void;
}

/**
 * 商品作成フォームの送信処理
 *
 * 商品作成モーダルで「登録」ボタンを押した時の処理を実行します。
 * 画像アップロード → API呼び出し → フォームリセット → モーダルを閉じる
 * という一連の流れを管理します。
 *
 * @param params - 送信処理に必要なパラメータ（HandleProductCreateSubmitParams型）
 * @throws エラーが発生した場合、ユーザーフレンドリーなメッセージを表示（alert）
 *
 * ## 処理の流れ
 * 1. ローディング開始（setSubmitting(true)）
 * 2. 画像をアップロード（uploadImage）
 * 3. フォームデータとアップロードした画像URLを結合
 * 4. API呼び出し（POST /api/products）
 * 5. レスポンスのエラーチェック
 * 6. プレビューURLのメモリ解放（URL.revokeObjectURL）
 * 7. フォームをリセット（次回入力のため）
 * 8. コールバック実行（データ再取得、モーダルを閉じる）
 * 9. エラー時はログ記録とアラート表示
 * 10. 最後に必ずローディング解除（finally）
 *
 * ## なぜ画像アップロードを先に行うのか
 * - 商品登録にはimageURLが必要なため、先にアップロードしてURLを取得
 * - 並列実行できない（商品データに画像URLを含める必要がある）
 * - トレードオフ: アップロードに失敗した場合、商品登録は行われない（データ整合性を保つ）
 *
 * ## URL.revokeObjectURLの理由
 * - URL.createObjectURL で作成した一時URLはメモリを消費し続ける
 * - 明示的に解放しないとメモリリークの原因になる
 * - 理由: ブラウザは自動的に解放しない仕様
 *
 * ## エラーハンドリングの詳細
 * - レスポンスが ok でない場合: JSONからエラーメッセージを取得
 * - JSONパース失敗時: "登録に失敗しました" をフォールバック
 * - alert を使用: シンプルで確実にユーザーに通知できる
 * - トレードオフ: トースト通知の方がUX的には良いが、依存関係を減らすためalertを使用
 *
 * ## finally ブロックの重要性
 * - エラーが発生してもローディング状態を解除
 * - 理由: エラー時にローディング状態が残ると、UIが操作不能になる
 *
 * ## 使用例
 * ```tsx
 * <button onClick={() => handleProductCreateSubmit({
 *   formData,
 *   uploadImage,
 *   imagePreview,
 *   setSubmitting,
 *   setFormData,
 *   onProductCreated: async () => await fetchProducts(),
 *   onClose: () => setIsModalOpen(false),
 * })}>
 *   登録
 * </button>
 * ```
 */
export async function handleProductCreateSubmit({
  formData,
  uploadImage,
  imagePreview,
  setSubmitting,
  setFormData,
  onProductCreated,
  onClose,
}: HandleProductCreateSubmitParams): Promise<void> {
  // ステップ1: ローディング開始
  // ボタンを無効化し、二重送信を防止
  setSubmitting(true);

  try {
    // ステップ2: 画像をアップロード
    // 理由: 商品データに画像URLが必要なため、先にアップロード
    // null を返す可能性: 画像が選択されていない場合
    const imageUrl = await uploadImage();

    // ステップ3: API送信用のデータを準備
    // formData（文字列の価格など）を API 用の型（数値の価格など）に変換
    const submitData = prepareProductSubmitData(formData, imageUrl);

    // ステップ4: API呼び出し（商品を作成）
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON形式で送信
      },
      body: JSON.stringify(submitData), // オブジェクトをJSON文字列に変換
    });

    // ステップ5: レスポンスのエラーチェック
    // ok が false の場合（ステータスコードが 200-299 以外）
    if (!response.ok) {
      // エラーレスポンスをパース（JSONパースに失敗しても空オブジェクト）
      const error = await response.json();
      // カスタムエラーメッセージ、またはデフォルトメッセージをスロー
      throw new Error(error.error || "登録に失敗しました");
    }

    // ステップ6: レスポンスボディを読み取る
    // 注意: response.json() を呼び出さないと、レスポンスが完全に読み取られない
    await response.json();

    // ステップ7: プレビューURLのメモリ解放
    // URL.createObjectURL で作成した一時URLを解放（メモリリーク防止）
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // ステップ8: フォームをリセット
    // 次回の商品登録時に前回の入力が残らないようにする
    setFormData(resetProductFormData());

    // ステップ9: コールバック実行（商品一覧を再取得）
    // 理由: 新しく作成した商品を一覧に表示するため
    if (onProductCreated) {
      await onProductCreated();
    }

    // ステップ10: モーダルを閉じる
    if (onClose) {
      onClose();
    }
  } catch (error) {
    // エラーログに記録（デバッグ用）
    log.error("商品の登録に失敗しました", {
      context: "handleProductCreateSubmit", // 関数名を記録
      error, // エラーオブジェクトを記録
    });
    // ユーザーにエラーメッセージを表示
    // getUserFriendlyMessageJa: エラーオブジェクトから日本語メッセージを生成
    alert(getUserFriendlyMessageJa(error));
  } finally {
    // ステップ11: 必ずローディング解除
    // 成功・失敗に関わらず実行され、UIを操作可能な状態に戻す
    setSubmitting(false);
  }
}

/**
 * 商品更新フォーム送信の引数型定義
 *
 * handleProductUpdateSubmit 関数に渡すパラメータを定義します。
 * 作成処理との違いは、productId（更新対象のID）と
 * originalImageUrl（元の画像URL）を含む点です。
 *
 * @property productId - 更新対象の商品ID（URLパラメータに使用）
 * @property formData - フォームの入力データ（商品名、価格など）
 * @property uploadImage - 画像をアップロードして URL を返す関数
 * @property imagePreview - プレビュー表示用の一時URL（Object URL）
 * @property originalImageUrl - 元の画像URL（プレビューURLと比較して解放判定に使用）
 * @property setSubmitting - 送信中状態を制御する関数（ローディング表示用）
 * @property onUpdated - 商品更新成功時のコールバック（データ再取得など）。必須
 * @property onClose - モーダルを閉じるコールバック。必須
 */
interface HandleProductUpdateSubmitParams {
  productId: number;
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  originalImageUrl: string | null;
  setSubmitting: (value: boolean) => void;
  onUpdated: () => Promise<void>;
  onClose: () => void;
}

/**
 * 商品更新フォームの送信処理
 *
 * 商品編集モーダルで「更新」ボタンを押した時の処理を実行します。
 * 画像アップロード（変更時のみ） → API呼び出し → データ再取得 → モーダルを閉じる
 * という一連の流れを管理します。
 *
 * @param params - 送信処理に必要なパラメータ（HandleProductUpdateSubmitParams型）
 * @throws エラーが発生した場合、ユーザーフレンドリーなメッセージを表示（alert）
 *
 * ## 処理の流れ
 * 1. ローディング開始（setSubmitting(true)）
 * 2. 新しい画像が選択されている場合のみアップロード
 * 3. フォームデータとアップロードした画像URLを結合
 * 4. API呼び出し（PUT /api/products/:id）
 * 5. レスポンスのエラーチェック
 * 6. プレビューURLのメモリ解放（新しい画像の場合のみ）
 * 7. コールバック実行（データ再取得、モーダルを閉じる）
 * 8. エラー時はログ記録とアラート表示
 * 9. 最後に必ずローディング解除（finally）
 *
 * ## 作成処理との違い
 * - **画像アップロード**: 新しい画像が選択された場合のみ実行
 *   - 理由: 既存の画像を変更しない場合、アップロード不要（パフォーマンス最適化）
 * - **プレビューURL解放**: 元の画像と異なる場合のみ解放
 *   - 理由: 元の画像URLは Object URL でないため、解放不要
 * - **フォームリセット**: 更新後はリセットしない
 *   - 理由: モーダルを閉じるだけで、次回編集時は別の商品を対象とするため
 *
 * ## 画像アップロードの条件分岐
 * - formData.imageFile が存在する: 新しい画像が選択された
 * - formData.imageFile が null: 既存の画像をそのまま使用
 * - 理由: 画像を変更しない編集（商品名や価格のみ変更）でアップロード処理を省略
 *
 * ## 画像アップロードのエラーハンドリング
 * - アップロード失敗時: アラート表示 → ローディング解除 → 処理を中断（return）
 * - 理由: アップロード失敗時に商品更新を続けると、画像が欠落する可能性がある
 * - トレードオフ: 更新処理全体が中断されるが、データ整合性を優先
 *
 * ## プレビューURL解放の条件
 * - imagePreview が存在 AND imagePreview !== originalImageUrl
 * - 理由: 新しい画像を選択した場合のみ Object URL が生成される
 * - 元の画像の場合: originalImageUrl（通常のHTTP URL）なので解放不要
 *
 * ## HTTP メソッドの選択
 * - PUT: リソース全体を更新（商品のすべてのフィールドを送信）
 * - 代替案: PATCH（部分更新）も可能だが、API設計がシンプルになるためPUTを選択
 *
 * ## ログにメタデータを含める理由
 * - productId を記録: どの商品の更新が失敗したかを特定できる
 * - デバッグ時に有用（ログから問題のある商品を追跡）
 *
 * ## 使用例
 * ```tsx
 * <button onClick={() => handleProductUpdateSubmit({
 *   productId: product.id,
 *   formData,
 *   uploadImage,
 *   imagePreview,
 *   originalImageUrl: product.imageUrl,
 *   setSubmitting,
 *   onUpdated: async () => await fetchProducts(),
 *   onClose: () => setIsModalOpen(false),
 * })}>
 *   更新
 * </button>
 * ```
 */
export async function handleProductUpdateSubmit({
  productId,
  formData,
  uploadImage,
  imagePreview,
  originalImageUrl,
  setSubmitting,
  onUpdated,
  onClose,
}: HandleProductUpdateSubmitParams): Promise<void> {
  // ステップ1: ローディング開始
  // ボタンを無効化し、二重送信を防止
  setSubmitting(true);

  try {
    // ステップ2: 画像URLの決定
    // デフォルトは既存の画像URL（新しい画像をアップロードしない場合）
    let imageUrl: string | null = formData.imageUrl || null;

    // ステップ3: 新しい画像が選択されている場合のみアップロード
    // 理由: 既存の画像を変更しない場合、アップロード処理を省略（パフォーマンス最適化）
    if (formData.imageFile) {
      try {
        // 画像をアップロードして新しいURLを取得
        imageUrl = await uploadImage();
      } catch (error) {
        // 画像アップロードのエラーハンドリング
        // 理由: アップロード失敗時に商品更新を続けると、画像が欠落する
        alert(getUserFriendlyMessageJa(error));
        // ローディング解除
        setSubmitting(false);
        // 処理を中断（商品更新API呼び出しをスキップ）
        return;
      }
    }

    // ステップ4: API送信用のデータを準備
    // formData（文字列の価格など）を API 用の型（数値の価格など）に変換
    const submitData = prepareProductSubmitData(formData, imageUrl);

    // ステップ5: API呼び出し（商品を更新）
    // PUT メソッド: リソース全体を更新
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // JSON形式で送信
      },
      body: JSON.stringify(submitData), // オブジェクトをJSON文字列に変換
    });

    // ステップ6: レスポンスのエラーチェック
    // ok が false の場合（ステータスコードが 200-299 以外）
    if (!response.ok) {
      // エラーレスポンスをパース（JSONパースに失敗しても空オブジェクト）
      const error = await response.json();
      // カスタムエラーメッセージ、またはデフォルトメッセージをスロー
      throw new Error(error.error || "更新に失敗しました");
    }

    // ステップ7: レスポンスボディを読み取る
    // 注意: response.json() を呼び出さないと、レスポンスが完全に読み取られない
    await response.json();

    // ステップ8: プレビューURLのメモリ解放（新しい画像の場合のみ）
    // 条件: プレビューが存在 AND 元の画像と異なる
    // 理由: 元の画像（HTTP URL）は Object URL でないため解放不要
    if (imagePreview && imagePreview !== originalImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }

    // ステップ9: コールバック実行（商品一覧を再取得）
    // 理由: 更新した商品を一覧に反映するため
    await onUpdated();

    // ステップ10: モーダルを閉じる
    onClose();
  } catch (error) {
    // エラーログに記録（デバッグ用）
    log.error("商品の更新に失敗しました", {
      context: "handleProductUpdateSubmit", // 関数名を記録
      error, // エラーオブジェクトを記録
      metadata: { productId }, // 更新対象の商品IDを記録（デバッグ時に有用）
    });
    // ユーザーにエラーメッセージを表示
    // getUserFriendlyMessageJa: エラーオブジェクトから日本語メッセージを生成
    alert(getUserFriendlyMessageJa(error));
  } finally {
    // ステップ11: 必ずローディング解除
    // 成功・失敗に関わらず実行され、UIを操作可能な状態に戻す
    setSubmitting(false);
  }
}
