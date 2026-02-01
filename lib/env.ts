/**
 * 環境変数の型定義とバリデーション (lib/env.ts)
 *
 * アプリケーション全体で使用する環境変数を型安全に管理します。
 *
 * 主な機能:
 * - サーバーサイド/クライアントサイド環境変数の型定義
 * - 必須環境変数のバリデーション（起動時にエラーを検出）
 * - 環境判定ユーティリティ（development/production）
 *
 * セキュリティ上の注意点:
 * - サーバー専用の環境変数（DATABASE_URL、BLOB_READ_WRITE_TOKEN など）は
 *   クライアントコンポーネントで使用しないこと
 * - クライアント公開する環境変数には必ず `NEXT_PUBLIC_` プレフィックスを付けること
 *
 * ベストプラクティス:
 * - 環境変数へのアクセスは必ず getServerEnv() または getClientEnv() を経由する
 * - process.env への直接アクセスは避ける（型安全性が失われる）
 * - 必須の環境変数は起動時にバリデーションする
 *
 * @see https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
 */

/**
 * サーバーサイド環境変数の型定義
 *
 * サーバーサイドでのみ使用可能な環境変数です。
 * これらの値はクライアントに送信されないため、機密情報を含めることができます。
 *
 * 注意点:
 * - これらの環境変数はクライアントコンポーネントからはアクセスできない
 * - 誤ってクライアント側で使用するとビルドエラーになる
 */
export interface ServerEnv {
  // データベース接続（必須）
  /**
   * PostgreSQL 接続文字列（プール接続）
   * 形式: postgresql://user:password@host:port/database
   * 用途: Prisma による通常のデータベース操作
   */
  DATABASE_URL: string;

  /**
   * PostgreSQL 接続文字列（非プール接続、オプション）
   * 用途: Prisma マイグレーション実行時に使用（Neon など一部のサービスで必要）
   */
  POSTGRES_URL_NON_POOLING?: string;

  /**
   * PostgreSQL 接続文字列（非プール接続、オプション）
   * DATABASE_URL_UNPOOLED の別名（環境により使い分け）
   */
  DATABASE_URL_UNPOOLED?: string;

  // Vercel Blob Storage（必須）
  /**
   * Vercel Blob Storage のアクセストークン
   * 用途: 商品画像のアップロード・削除
   */
  BLOB_READ_WRITE_TOKEN: string;

  // 認証（オプション）
  /**
   * Stack Auth のサーバー秘密鍵
   * 用途: ユーザー認証（管理画面へのアクセス制御）
   */
  STACK_SECRET_SERVER_KEY?: string;
}

/**
 * クライアントサイド環境変数の型定義
 *
 * クライアントサイドでも使用可能な環境変数です。
 * `NEXT_PUBLIC_` プレフィックスが付いた環境変数のみが含まれます。
 *
 * セキュリティ上の注意:
 * - これらの値はブラウザに送信されるため、機密情報を含めないこと
 * - API キーなどの秘密情報は絶対に NEXT_PUBLIC_ で公開しない
 */
export interface ClientEnv {
  /**
   * Stack Auth のプロジェクト ID
   * 用途: クライアント側での認証フロー
   */
  NEXT_PUBLIC_STACK_PROJECT_ID?: string;

  /**
   * Stack Auth の公開可能なクライアントキー
   * 用途: クライアント側での認証フロー
   */
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
}

/**
 * サーバーサイド環境変数を取得します（型安全）
 *
 * 必須の環境変数をバリデーションし、型安全にアクセスできる形で返します。
 * 必須の環境変数が設定されていない場合は起動時にエラーをスローします。
 *
 * @returns サーバーサイド環境変数のオブジェクト
 * @throws {Error} 必須の環境変数（DATABASE_URL、BLOB_READ_WRITE_TOKEN）が設定されていない場合
 *
 * 使用箇所:
 * - Server Components（app/ 配下のサーバーコンポーネント）
 * - API Routes（app/api/ 配下）
 * - Server Actions（'use server' ディレクティブを使用）
 *
 * 注意点:
 * - クライアントコンポーネント（'use client'）では使用不可
 * - 理由: サーバー専用の環境変数はクライアントに送信されないため
 *
 * バリデーションのタイミング:
 * - この関数が初めて呼ばれた時点でバリデーションされる
 * - アプリケーション起動時にエラーを検出できるため、早期発見が可能
 */
export function getServerEnv(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // 必須環境変数のバリデーション
  // 理由: 起動時にエラーを検出することで、本番環境でのランタイムエラーを防ぐ
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. ' +
      'Please set it to your PostgreSQL connection string (postgresql://user:password@host:port/database).'
    );
  }

  if (!blobToken) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  return {
    DATABASE_URL: databaseUrl,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BLOB_READ_WRITE_TOKEN: blobToken,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  };
}

/**
 * クライアントサイド環境変数を取得します（型安全）
 *
 * `NEXT_PUBLIC_` プレフィックスが付いた環境変数のみを返します。
 * これらの値はブラウザに送信されるため、機密情報を含めないでください。
 *
 * @returns クライアントサイド環境変数のオブジェクト
 *
 * 使用箇所:
 * - Client Components（'use client' ディレクティブを使用）
 * - Server Components でも使用可能（ただし通常は不要）
 *
 * 注意点:
 * - NEXT_PUBLIC_ プレフィックスがない環境変数はアクセスできない
 * - ビルド時に値が埋め込まれるため、実行時の変更は反映されない
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  };
}

/**
 * サーバーとクライアントの環境変数を両方取得します
 *
 * @deprecated この関数は非推奨です。代わりに getServerEnv() または getClientEnv() を使用してください
 *
 * 非推奨の理由:
 * - サーバーとクライアントの環境変数を混在させるとセキュリティリスクがある
 * - どの環境変数がどこで使えるか不明確になる
 * - 明示的に getServerEnv() / getClientEnv() を使うべき
 */
export function getEnv(): ServerEnv & ClientEnv {
  return {
    ...getServerEnv(),
    ...getClientEnv(),
  };
}

/**
 * 開発環境かどうかを判定します
 *
 * @returns 開発環境の場合 true、それ以外は false
 *
 * 使用例:
 * - デバッグログの表示/非表示を切り替える
 * - 開発専用の機能を有効/無効にする
 * - エラーメッセージの詳細度を変更する
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 本番環境かどうかを判定します
 *
 * @returns 本番環境の場合 true、それ以外は false
 *
 * 使用例:
 * - 本番環境でのみアナリティクスを有効化
 * - エラー追跡ツール（Sentry など）の有効化
 * - パフォーマンス最適化の有効化
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
