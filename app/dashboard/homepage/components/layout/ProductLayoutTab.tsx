/**
 * @file 商品配置変更タブコンポーネント
 *
 * ## 目的
 * ダッシュボードでドラッグ&ドロップによる商品の表示順序変更機能を提供します。
 *
 * ## 主な機能
 * - カテゴリーごとのタブ切り替え
 * - ドラッグ&ドロップによる商品の並び替え
 * - マルチデバイス対応（マウス、タッチ、キーボード操作）
 * - リアルタイム順序更新（API連携）
 * - 公開済み商品のみを対象とした表示と並び替え
 *
 * ## 実装の特性
 * - Client Component（ドラッグ&ドロップのインタラクションを実装）
 * - @dnd-kit/core と @dnd-kit/sortable を使用
 * - カスタムフック（useProductReorder）で並び替えロジックを分離
 *
 * ## ライブラリ選定理由
 * @dnd-kit を採用した理由：
 * - Reactの最新機能に対応（React 18+）
 * - アクセシビリティを標準サポート（キーボード操作、スクリーンリーダー対応）
 * - タッチデバイスとマウス操作の両方に対応
 * - パフォーマンスが優れている（仮想DOM最適化）
 * - TypeScriptの型定義が充実
 *
 * ## 注意点
 * - 非公開商品は表示されない（published: false は除外）
 * - ドラッグ中の誤操作を防ぐため、一定距離/時間のしきい値を設定
 * - API連携が失敗した場合、ユーザーフレンドリーなエラーメッセージを表示
 *
 * @see {@link https://docs.dndkit.com/} @dnd-kit 公式ドキュメント
 */

"use client";

import { useMemo, useCallback } from "react";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { config } from "@/lib/config";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import LayoutCategoryTabs from "./LayoutCategoryTabs";
import SortableProductItem from "./SortableProductItem";
import { useProductReorder } from "../../hooks/useProductReorder";
import { groupProductsByCategory } from "../../utils/productUtils";
import type { Category, Product } from "../../types";

/**
 * ProductLayoutTab コンポーネントのprops型定義
 *
 * @property products - 全商品データ（公開・非公開含む）
 * @property categories - カテゴリー一覧（タブ表示用）
 * @property activeCategoryTab - 現在アクティブなカテゴリータブの名前
 * @property onCategoryTabChange - カテゴリータブ変更時のコールバック
 * @property setProducts - 商品データ更新用のstate setter（楽観的更新で使用）
 * @property refreshProducts - 商品データを再取得する関数（API連携後の同期用）
 */
interface ProductLayoutTabProps {
  products: Product[];
  categories: Category[];
  activeCategoryTab: string;
  onCategoryTabChange: (categoryName: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
}

/**
 * 商品配置変更タブコンポーネント
 *
 * ドラッグ&ドロップによる商品の順序変更機能を提供します。
 * カテゴリーごとにタブを切り替えて、各カテゴリー内の商品の表示順序を変更できます。
 *
 * @param props - ProductLayoutTabProps
 * @param props.products - 全商品データ（公開・非公開含む）
 * @param props.categories - カテゴリー一覧
 * @param props.activeCategoryTab - 現在アクティブなカテゴリータブ
 * @param props.onCategoryTabChange - タブ変更ハンドラー
 * @param props.setProducts - 商品データ更新関数
 * @param props.refreshProducts - 商品データ再取得関数
 *
 * @returns ドラッグ&ドロップ機能を持つ商品配置変更UI
 *
 * ## 構成要素
 * - LayoutCategoryTabs: カテゴリータブの表示
 * - SortableProductItem: ドラッグ可能な商品カード
 * - DndContext: @dnd-kit のドラッグ&ドロップコンテキスト
 *
 * ## 実装の理由
 * マルチデバイス対応のため、3種類のセンサーを設定：
 * - PointerSensor: マウス操作（デスクトップ）
 * - TouchSensor: タッチ操作（スマートフォン、タブレット）
 * - KeyboardSensor: キーボード操作（アクセシビリティ対応）
 */
export default function ProductLayoutTab({
  products,
  categories,
  activeCategoryTab,
  onCategoryTabChange,
  setProducts,
  refreshProducts,
}: ProductLayoutTabProps) {
  // ドラッグ&ドロップセンサーの設定
  // 誤操作を防ぐため、activationConstraint（アクティベーション制約）を設定
  const sensors = useSensors(
    // マウス操作: 一定距離（デフォルト8px）移動しないとドラッグ開始しない
    // クリックとドラッグを区別するため
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: config.dndConfig.POINTER_ACTIVATION_DISTANCE,
      },
    }),
    // タッチ操作: 一定時間（デフォルト250ms）長押ししないとドラッグ開始しない
    // スクロールとドラッグを区別するため
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: config.dndConfig.TOUCH_ACTIVATION_DELAY,
        tolerance: config.dndConfig.TOUCH_TOLERANCE,
      },
    }),
    // キーボード操作: アクセシビリティ対応（スクリーンリーダー使用者など）
    // 矢印キーで移動、Spaceキーで選択/解除
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // カテゴリーごとに公開済み商品をグループ化
  // useMemoでメモ化し、products/categoriesが変更されたときのみ再計算
  // 理由: groupProductsByCategory は全商品をループするため、不要な再計算を避ける
  const publishedProductsByCategory = useMemo(
    () => groupProductsByCategory(products, categories),
    [products, categories]
  );

  // 商品並び替えカスタムフック
  // 楽観的更新（即座にUI更新）→ API送信 → 失敗時はロールバックの処理を内包
  const { reorderProducts } = useProductReorder(setProducts, refreshProducts);

  /**
   * ドラッグ終了時のハンドラー
   *
   * @param event - @dnd-kit のドラッグ終了イベント
   * @param categoryName - 現在アクティブなカテゴリー名
   *
   * ## 処理フロー
   * 1. ドラッグ元（active）とドロップ先（over）を取得
   * 2. 同じ位置にドロップされた場合は何もしない（early return）
   * 3. 該当カテゴリーの商品グループを取得
   * 4. ドラッグ元とドロップ先のインデックスを計算
   * 5. reorderProducts を呼び出して並び替えを実行
   * 6. エラー時はユーザーフレンドリーなメッセージを表示
   *
   * ## 注意点
   * - active.id と over.id は商品のid（文字列）
   * - インデックスが-1の場合は不正な操作なので処理をスキップ
   * - reorderProducts はカスタムフック内で楽観的更新とAPI送信を行う
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent, categoryName: string): Promise<void> => {
      const { active, over } = event;

      // ドロップ先がない、または同じ位置にドロップした場合は何もしない
      if (!over || active.id === over.id) {
        return;
      }

      // 現在アクティブなカテゴリーの商品グループを取得
      const categoryGroup = publishedProductsByCategory.find(
        (g) => g.name === categoryName
      );
      if (!categoryGroup) return;

      // ドラッグ元とドロップ先のインデックスを計算
      const oldIndex = categoryGroup.products.findIndex(
        (p) => p.id === active.id
      );
      const newIndex = categoryGroup.products.findIndex(
        (p) => p.id === over.id
      );

      // インデックスが見つからない場合は不正な操作なので処理をスキップ
      if (oldIndex === -1 || newIndex === -1) return;

      try {
        // 商品の並び替えを実行
        // 内部で楽観的更新（即座にUI更新）→ API送信 → 失敗時はロールバック
        await reorderProducts(categoryGroup, oldIndex, newIndex);
      } catch (error) {
        // エラー時はユーザーフレンドリーなメッセージを表示
        // getUserFriendlyMessageJa は lib/errors.ts で定義されたエラーメッセージ変換関数
        alert(getUserFriendlyMessageJa(error));
      }
    },
    [publishedProductsByCategory, reorderProducts]
  );

  // 現在アクティブなカテゴリーの商品グループを取得
  const activeCategoryGroup = publishedProductsByCategory.find(
    (g) => g.name === activeCategoryTab
  );

  // 公開済み商品があるかどうかを判定（空状態メッセージ表示用）
  const hasProducts = activeCategoryGroup && activeCategoryGroup.products.length > 0;

  return (
    <div>
      {/* カテゴリータブ */}
      <LayoutCategoryTabs
        categories={categories}
        publishedProductsByCategory={publishedProductsByCategory}
        activeCategoryTab={activeCategoryTab}
        onCategoryTabChange={onCategoryTabChange}
      />

      {/* 商品がない場合: 空状態メッセージを表示 */}
      {!hasProducts ? (
        <p className="py-8 text-center text-gray-500">
          {activeCategoryTab}に公開されている商品がありません
        </p>
      ) : (
        // 商品がある場合: ドラッグ&ドロップ可能なグリッド表示
        // DndContext: @dnd-kit のドラッグ&ドロップコンテキスト（センサー設定や衝突検出を提供）
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners} // 最も近いアイテムとの衝突を検出（ドロップ先を決定）
          onDragEnd={(event) => handleDragEnd(event, activeCategoryTab)}
        >
          {/* SortableContext: ソート可能なアイテムのコンテキスト */}
          <SortableContext
            items={activeCategoryGroup.products.map((p) => p.id)} // ソート対象のアイテムID一覧
            strategy={rectSortingStrategy} // グリッドレイアウト用のソート戦略（矩形アイテムの並び替え）
          >
            {/* 3カラムのレスポンシブグリッド */}
            {/* モバイル: gap-1（4px）、タブレット: gap-2（8px）、デスクトップ: gap-4（16px） */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
              {activeCategoryGroup.products.map((product) => (
                // ドラッグ可能な商品カード
                <SortableProductItem key={product.id} product={product} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
