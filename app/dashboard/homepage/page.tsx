/**
 * @fileoverview ダッシュボードホームページ - 商品管理のメインページ
 *
 * ## 目的
 * - 商品一覧の表示、検索、フィルタリング
 * - 商品の新規作成、編集、削除
 * - 商品の表示順変更（ドラッグ&ドロップ）
 * - 商品の公開/非公開切り替え
 *
 * ## 主な機能
 * - カテゴリー別タブで商品をフィルタリング
 * - 検索機能（商品名、説明文）
 * - 画像アップロード・圧縮
 * - レイアウトモードの切り替え（リスト/グリッド）
 *
 * ## 実装の特性
 * - **Server Component**: サーバーサイドでデータを取得
 * - **動的レンダリング**: 常に最新のデータを取得（force-dynamic）
 * - **並列データ取得**: Promise.all でパフォーマンス最適化
 * - **エラーハンドリング**: 失敗時も画面は表示（空配列で初期化）
 *
 * ## データフロー
 * 1. サーバー側でカテゴリーと商品を取得
 * 2. 型変換（Prisma型 → アプリケーション型）
 * 3. Client Component（DashboardContent）へ渡す
 * 4. Client Componentで商品の操作を処理
 *
 * @see {@link DashboardContent} クライアント側のメインコンポーネント
 */

import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import DashboardContent from "./components/DashboardContent";
import type { Category, Product } from "./types";

/**
 * 動的レンダリングを強制
 *
 * Next.jsに「このページは常に動的にレンダリングする」ことを指示します。
 * これにより、商品の追加・編集・削除が即座に反映されます。
 *
 * ## なぜforce-dynamicが必要か
 * - 商品データは頻繁に変更されるため、キャッシュは不適切
 * - ダッシュボードは常に最新の状態を表示する必要がある
 * - ビルド時の静的生成では変更が反映されない
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = "force-dynamic";

/**
 * ダッシュボードに表示するデータを取得する関数
 *
 * カテゴリー一覧と商品一覧を並列で取得します。
 * 商品データはPrisma型からアプリケーション型に変換します。
 *
 * @returns カテゴリー一覧と商品一覧を含むオブジェクト
 * @throws データベースエラー（ログに記録してから再スロー）
 *
 * ## 並列取得の理由
 * - カテゴリーと商品は独立したデータなので、順次取得する必要がない
 * - Promise.allで並列実行することで、合計取得時間を短縮
 * - 例: カテゴリー100ms + 商品200ms = 200ms（順次なら300ms）
 *
 * ## 型変換の理由
 * - Prismaの`Decimal`型を`number`型に変換（JSONシリアライズ対応）
 * - `Date`型を`string`型に変換（Client Componentへの受け渡し対応）
 * - リレーション（category）を必須フィールドとして保証
 *
 * ## エラーハンドリング
 * - safePrismaOperationでデータベースエラーをキャッチ
 * - エラー時はnullを返すため、|| []でフォールバック
 * - catch節でエラーログを記録してから再スロー
 */
async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    // カテゴリーと商品を並列で取得（パフォーマンス最適化）
    // safePrismaOperationはタイムアウトとエラーハンドリングを提供
    const [categoriesList, productsList] = await Promise.all([
      // カテゴリー: ID昇順で取得（固定順）
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: {
              id: "asc",
            },
          }),
        "getDashboardData - categories"
      ),
      // 商品: カテゴリー情報を含めて取得、作成日降順（新しい順）
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: {
              category: true, // リレーション: カテゴリー情報を含める
            },
            orderBy: {
              createdAt: "desc", // 新しい商品を上に表示
            },
          }),
        "getDashboardData - products"
      ),
    ]);

    // カテゴリー: nullの場合は空配列にフォールバック
    const categories: Category[] = categoriesList || [];

    // 商品: Prisma型からアプリケーション型に変換
    const products: Product[] = (productsList || [])
      // カテゴリーが紐付いていない商品を除外（データ整合性の保証）
      .filter((product) => product.category !== null)
      .map((product) => {
        // TypeScriptの型ガード: filterで除外したが、型システムのために再チェック
        if (!product.category) {
          throw new Error(`Product ${product.id} has no category`);
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          // Prismaの Decimal型 → number型 に変換
          // JSONシリアライズ時にDecimal型は扱えないため、事前に変換
          priceS: product.priceS ? Number(product.priceS) : null,
          priceL: product.priceL ? Number(product.priceL) : null,
          // カテゴリー情報: IDと名前のみ抽出（必要最小限のデータ）
          category: {
            id: product.category.id,
            name: product.category.name,
          },
          published: product.published,
          // Date型 → ISO文字列 に変換
          // Client Componentへ渡す際、Date型はシリアライズできないため文字列化
          publishedAt: product.publishedAt?.toISOString() || null,
          endedAt: product.endedAt?.toISOString() || null,
          displayOrder: product.displayOrder,
        };
      });

    return {
      categories,
      products,
    };
  } catch (error) {
    // エラーログを記録してから再スロー
    // 呼び出し元（DashboardPage）でさらにエラーハンドリング
    log.error("ダッシュボードデータの取得に失敗しました", {
      context: "getDashboardData",
      error,
    });
    throw error;
  }
}

/**
 * ダッシュボードホームページコンポーネント
 *
 * 商品管理ダッシュボードのメインページです。
 * サーバーサイドでカテゴリーと商品のデータを取得し、
 * Client Component（DashboardContent）に渡して表示します。
 *
 * @returns ダッシュボードのUI（DashboardContentコンポーネント）
 *
 * ## データ取得戦略
 * - サーバー側で初期データを取得（SEO不要だが、初期表示を高速化）
 * - エラー時も画面は表示（空配列で初期化、ユーザーに操作の機会を提供）
 * - Client Componentで商品の操作（追加、編集、削除、並び替え）を処理
 *
 * ## エラーハンドリング
 * - try-catchでエラーをキャッチ
 * - エラー時は空配列で初期化（UIは表示されるが、データなし状態）
 * - getDashboardData内でエラーログは記録済み
 * - エラーUIは error.tsx が担当（Next.jsのエラーバウンダリ）
 *
 * ## 実装の注意点
 * - categories と products は let で宣言（try-catch内で再代入するため）
 * - catch節でerror変数を使用しない（既にログ記録済みのため）
 * - 空配列で初期化することで、DashboardContentは常に動作可能
 */
export default async function DashboardPage() {
  // データの初期値を空配列に設定
  // エラー時もUIを表示できるようにするため
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    // サーバー側でデータを取得
    const data = await getDashboardData();
    categories = data.categories;
    products = data.products;
  } catch {
    // エラーハンドリング:
    // - getDashboardData内でエラーログは記録済み
    // - error.tsxでエラーUIが表示される可能性がある
    // - ここでは空配列のまま処理を続行（UIは表示される）
    categories = [];
    products = [];
  }

  // DashboardContent（Client Component）へデータを渡す
  // categories: カテゴリー一覧（タブ表示用）
  // initialProducts: 商品の初期データ（Client Componentで状態管理）
  return <DashboardContent categories={categories} initialProducts={products} />;
}
