/**
 * @fileoverview 商品フォームコンポーネント - 作成と編集の統合フォーム
 *
 * ## 目的
 * - 商品の新規作成と編集を1つのコンポーネントで処理
 * - モード切り替え（create/edit）による振る舞いの変更
 * - 画像アップロード、バリデーション、API送信を統合管理
 *
 * ## 主な機能
 * - 商品作成モード: 新規商品の登録フォーム
 * - 商品編集モード: 既存商品の更新フォーム
 * - 画像圧縮・アップロード処理との連携
 * - フォーム送信とエラーハンドリング
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/list/ProductListTab.tsx（一覧タブ）
 * - app/dashboard/homepage/components/layout/ProductLayoutTab.tsx（配置変更タブ）
 *
 * ## 実装の特性
 * - **Client Component**: "use client" ディレクティブ使用
 * - **モード切り替え**: mode propsで作成/編集を判定
 * - **状態管理**: useProductFormで統合的に管理
 *
 * ## コンポーネント構成
 * - ProductFormModal: モーダルダイアログの枠組み
 * - ProductFormFields: 入力フィールドの集約
 * - ProductFormFooter: 送信ボタンとローディング表示
 *
 * ## なぜ作成と編集を1つのコンポーネントにしたのか
 * - **コードの再利用**: フォームのUIとロジックが共通
 * - **保守性向上**: 修正が1箇所で済む
 * - **トレードオフ**: mode分岐が増えるが、全体のコード量は削減される
 */

"use client";

import { useProductForm } from "../../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import ProductFormModal from "./ProductFormModal";
import ProductFormFooter from "./ProductFormFooter";
import {
  handleProductCreateSubmit,
  handleProductUpdateSubmit,
} from "../../utils/productFormSubmit";
import { createInitialFormDataFromProduct } from "../../utils/productFormData";
import type { Category, Product } from "../../types";

/**
 * 商品フォームのprops型定義
 *
 * @property categories - カテゴリー一覧（フォームのドロップダウンで使用）
 * @property isOpen - モーダルの開閉状態
 * @property onClose - モーダルを閉じるコールバック
 * @property onSuccess - 商品作成/更新成功時のコールバック（データ再取得など）
 * @property mode - フォームのモード（"create": 新規作成、"edit": 編集）
 * @property product - 編集対象の商品（editモード時のみ必須）
 */
interface ProductFormProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  mode: "create" | "edit";
  product?: Product;
}

/**
 * 商品フォームコンポーネント
 *
 * 商品の新規作成と編集を1つのコンポーネントで処理します。
 * modeプロップで作成/編集を切り替え、適切な初期値とsubmit処理を適用します。
 *
 * @param props - ProductFormProps型のプロップス
 * @returns 商品作成・編集フォームのモーダル
 *
 * ## 処理の流れ
 * 1. modeとproductからeditモードかどうかを判定
 * 2. editモードの場合、既存商品データを初期値としてuseProductFormに渡す
 * 3. フォーム送信時、modeに応じて作成/更新APIを呼び出し
 * 4. 成功時にonSuccessコールバックを実行（一覧再取得）
 *
 * ## editモード判定の理由
 * - mode === "edit" AND product が存在する場合のみeditモード
 * - 理由: productがundefinedの場合、編集できない（TypeScriptの型ガードで安全性確保）
 *
 * ## useProductFormの初期化
 * - editモード: initialImageUrl、initialFormDataを設定
 * - createモード: 空オブジェクト（デフォルト値を使用）
 *
 * ## 実装の理由
 * - **条件付き初期化**: editモードでのみ既存データを初期値に設定
 * - **型安全性**: isEditModeでproductの存在を保証
 */
export default function ProductForm({
  categories,
  isOpen,
  onClose,
  onSuccess,
  mode,
  product,
}: ProductFormProps) {
  // editモード判定: mode が "edit" かつ product が存在する場合
  // TypeScript の型ガード: isEditMode が true の場合、product は確実に存在する
  const isEditMode = mode === "edit" && product;

  // 商品フォームの状態管理
  // editモードの場合は既存商品データを初期値として設定
  // createモードの場合は空オブジェクト（デフォルト値を使用）
  const {
    formData, // フォームの入力データ
    setFormData, // フォームデータの更新関数
    submitting, // 送信中フラグ（true: API送信中）
    setSubmitting, // 送信中フラグの更新関数
    uploading, // 画像アップロード中フラグ
    compressing, // 画像圧縮中フラグ
    imagePreview, // 画像プレビューURL（Object URLまたはHTTP URL）
    handleImageChange, // 画像選択時の処理（圧縮とプレビュー生成）
    uploadImage, // 画像アップロード処理（フォーム送信時に呼び出す）
    hasDateRangeValue, // 公開期間が設定されているかどうか
  } = useProductForm(
    isEditMode
      ? {
          // editモード: 既存商品の画像URLと初期フォームデータを設定
          initialImageUrl: product.imageUrl,
          initialFormData: createInitialFormDataFromProduct(product),
        }
      : {}
      // createモード: 空オブジェクト（useProductForm内でデフォルト値を使用）
  );

  /**
   * フォーム送信処理
   *
   * モードに応じて商品作成または更新のAPI呼び出しを実行します。
   * 画像アップロード、バリデーション、エラーハンドリングは
   * handleProductCreateSubmit / handleProductUpdateSubmit で処理されます。
   *
   * @param e - フォーム送信イベント
   *
   * ## 処理の流れ
   * 1. e.preventDefault(): デフォルトのフォーム送信を防ぐ
   * 2. isEditMode で分岐
   *    - editモード: handleProductUpdateSubmit（PUT /api/products/:id）
   *    - createモード: handleProductCreateSubmit（POST /api/products）
   * 3. 成功時: onSuccessコールバック実行（一覧再取得）
   *
   * ## なぜ async/await を使うのか
   * - API呼び出しは非同期処理
   * - エラーハンドリングはsubmit関数内で実施（try-catch）
   * - 理由: コンポーネントのコードをシンプルに保つ
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    // デフォルトのフォーム送信（ページリロード）を防ぐ
    e.preventDefault();

    if (isEditMode) {
      // editモード: 商品更新API呼び出し
      // product は isEditMode が true の場合、確実に存在する（TypeScriptの型ガード）
      await handleProductUpdateSubmit({
        productId: product.id, // 更新対象の商品ID
        formData, // 編集されたフォームデータ
        uploadImage, // 画像アップロード関数（新しい画像が選択された場合のみ実行）
        imagePreview, // プレビューURL（メモリ解放判定用）
        originalImageUrl: product.imageUrl, // 元の画像URL（プレビューと比較）
        setSubmitting, // ローディング状態の管理
        onUpdated: onSuccess, // 更新成功時のコールバック（一覧再取得）
        onClose, // モーダルを閉じる
      });
    } else {
      // createモード: 商品作成API呼び出し
      await handleProductCreateSubmit({
        formData, // 入力されたフォームデータ
        uploadImage, // 画像アップロード関数（選択された画像をアップロード）
        imagePreview, // プレビューURL（メモリ解放用）
        setSubmitting, // ローディング状態の管理
        setFormData, // フォームリセット用
        onProductCreated: onSuccess, // 作成成功時のコールバック（一覧再取得）
        onClose, // モーダルを閉じる
      });
    }
  };

  // モーダルとフォームの表示テキストをmodeに応じて切り替え
  // 理由: 作成と編集でUIの文言を変更するため
  const title = isEditMode ? "商品を編集" : "新規商品登録";
  const formId = isEditMode ? "product-edit-form" : "product-form";
  const submitLabel = isEditMode ? "更新" : "商品を登録";
  const submittingLabel = isEditMode ? "更新中..." : "登録中...";
  // fieldPrefix: input要素のid属性に付与（edit-name, nameなど）
  // 理由: 作成と編集のフォームが同時に存在する場合、id重複を防ぐ
  const fieldPrefix = isEditMode ? "edit-" : "";

  return (
    // モーダルダイアログの枠組み
    // title, isOpen, onClose でモーダルの表示制御
    // footer で送信ボタンとローディング表示を配置
    <ProductFormModal
      title={title} // モーダルのタイトル（「商品を編集」または「新規商品登録」）
      isOpen={isOpen} // モーダルの開閉状態
      onClose={onClose} // モーダルを閉じるコールバック
      footer={
        // フォームフッター: 送信ボタンとローディング表示
        // submitting, uploading, compressing でボタンの無効化とローディング表示を制御
        <ProductFormFooter
          submitting={submitting} // 送信中フラグ
          uploading={uploading} // 画像アップロード中フラグ
          compressing={compressing} // 画像圧縮中フラグ
          onClose={onClose} // キャンセルボタンのコールバック
          submitLabel={submitLabel} // 送信ボタンのラベル（「更新」または「商品を登録」）
          uploadingLabel="画像をアップロード中..." // 画像アップロード中のラベル
          submittingLabel={submittingLabel} // 送信中のラベル（「更新中...」または「登録中...」）
          formId={formId} // submitボタンのform属性（form要素と紐づける）
        />
      }
    >
      {/* フォーム本体 */}
      {/* id属性でProductFormFooterのsubmitボタンと紐づける */}
      {/* onSubmit で送信処理を実行（preventDefault で通常のsubmitを防ぐ） */}
      {/* className="min-w-0 space-y-4": 最小幅を0に設定し、フィールド間にスペースを配置 */}
      <form id={formId} onSubmit={handleSubmit} className="min-w-0 space-y-4">
        {/* フォームフィールドの集約コンポーネント */}
        {/* 商品名、説明、画像、価格、カテゴリー、公開情報、公開日・終了日の入力フィールド */}
        <ProductFormFields
          formData={formData} // フォームの入力データ
          setFormData={setFormData} // フォームデータの更新関数
          categories={categories} // カテゴリー一覧（ドロップダウンで使用）
          submitting={submitting} // 送信中フラグ（フィールド無効化用）
          uploading={uploading} // 画像アップロード中フラグ
          compressing={compressing} // 画像圧縮中フラグ
          imagePreview={imagePreview} // 画像プレビューURL
          // 画像選択時の処理
          // editモードの場合: 元の画像URL（product.imageUrl）をfallbackとして渡す
          // createモードの場合: undefinedを渡す（fallbackなし）
          // 理由: 編集時に画像選択をキャンセルした場合、元の画像に戻す
          onImageChange={(e) =>
            handleImageChange(e, isEditMode ? product.imageUrl : undefined)
          }
          hasDateRangeValue={hasDateRangeValue} // 公開期間が設定されているか（公開状態の手動変更を制御）
          fieldPrefix={fieldPrefix} // input要素のid属性プレフィックス（id重複防止）
        />
      </form>
    </ProductFormModal>
  );
}
