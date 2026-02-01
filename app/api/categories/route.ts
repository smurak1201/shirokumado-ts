/**
 * カテゴリー一覧取得 API エンドポイント
 *
 * ## 目的
 * すべてのカテゴリーをデータベースから取得し、JSON形式で返却します。
 *
 * ## 主な機能
 * - カテゴリーの一覧取得（ID昇順でソート）
 * - レスポンスキャッシュの設定
 * - 日本語を含むJSONの文字化け防止
 *
 * ## HTTPメソッド
 * - GET: カテゴリー一覧を取得
 *
 * ## リクエスト
 * クエリパラメータなし
 *
 * ## レスポンス
 * ```json
 * {
 *   "categories": [
 *     { "id": 1, "name": "カテゴリー1" },
 *     { "id": 2, "name": "カテゴリー2" }
 *   ]
 * }
 * ```
 *
 * ## 認証要件
 * なし（公開エンドポイント）
 *
 * ## エラーハンドリング
 * - withErrorHandling で統一的なエラーハンドリングを実施
 * - データベース操作は safePrismaOperation でラップし、エラーログを自動記録
 *
 * ## パフォーマンス最適化
 * - Cache-Control ヘッダーによるレスポンスキャッシュ
 * - stale-while-revalidate でバックグラウンド更新
 *
 * ## 注意事項
 * 現在このエンドポイントは未使用です。ダッシュボードではサーバーコンポーネントから
 * 直接Prismaで取得しているため、クライアントコンポーネントからの呼び出しは不要です。
 * 将来的にクライアント側でカテゴリー一覧を動的に取得する必要が生じた場合に使用する可能性があります。
 *
 * @module app/api/categories/route
 */

import { withErrorHandling } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

/**
 * 動的レンダリングを強制
 *
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします。
 * これにより、ビルド時の静的生成を回避し、リクエスト時に最新のカテゴリー情報を取得できます。
 */
export const dynamic = 'force-dynamic';

/**
 * カテゴリー一覧を取得する GETハンドラー
 *
 * データベースからすべてのカテゴリーを取得し、ID昇順でソートして返却します。
 * レスポンスには適切なキャッシュヘッダーを設定し、パフォーマンスを向上させています。
 *
 * @returns カテゴリー一覧を含むJSONレスポンス
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - ID昇順ソート: カテゴリーの表示順序を一貫させるため
 * - Cache-Control: 頻繁に変更されないデータのため、キャッシュでパフォーマンス向上
 * - UTF-8指定: 日本語カテゴリー名の文字化けを防ぐため
 */
export const GET = withErrorHandling(async () => {
  // データベースからカテゴリー一覧を取得
  // safePrismaOperation でラップすることで、エラー時の自動ロギングと統一的なエラーハンドリングを実現
  const categoriesList = await safePrismaOperation(
    () =>
      prisma.category.findMany({
        orderBy: {
          // ID昇順でソート（カテゴリーの表示順序を一貫させるため）
          id: 'asc',
        },
      }),
    'GET /api/categories'
  );

  // JSONレスポンスを作成（ステータスコード200）
  const response = NextResponse.json({ categories: categoriesList }, { status: 200 });

  // Content-Typeヘッダーを明示的に設定
  // 理由: 日本語を含むJSONデータの文字化けを防ぐため、UTF-8を明示
  response.headers.set('Content-Type', 'application/json; charset=utf-8');

  // キャッシュヘッダーを設定
  // public: CDNやプロキシでキャッシュ可能
  // s-maxage: 共有キャッシュの有効期限（設定ファイルから取得）
  // stale-while-revalidate: キャッシュ期限切れ後もバックグラウンドで更新しつつ古いデータを返す
  // トレードオフ: キャッシュによりパフォーマンス向上、ただし最新データの反映に遅延が生じる可能性
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.CATEGORY_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );

  return response;
});
