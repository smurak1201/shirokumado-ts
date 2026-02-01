/**
 * HEIC形式の画像変換ユーティリティ
 *
 * HEIC形式（iPhoneのデフォルト形式）をJPEG/PNG形式に変換する機能を提供します。
 * ブラウザはHEIC形式を直接処理できないため、heic2anyライブラリを使用して変換します。
 *
 * 主な機能:
 * - HEIC形式のファイル判定（拡張子とMIMEタイプの両方で判定）
 * - HEIC → JPEG 変換（高品質0.92で変換）
 * - 動的インポートによるコード分割（HEIC使用時のみライブラリを読み込み）
 *
 * 実装の理由:
 * - **iPhoneユーザー対応**: iPhoneで撮影した写真はデフォルトでHEIC形式
 * - **ブラウザ非対応**: ブラウザのCanvas APIではHEICを直接処理できない
 * - **動的インポート**: heic2anyは約200KBのライブラリのため、必要時のみ読み込み
 * - **高品質変換（0.92）**: 2段階変換（HEIC → JPEG → WebP）の画質劣化を最小限に抑える
 *
 * 使用ライブラリ:
 * - heic2any: HEIC → JPEG/PNG 変換ライブラリ
 *   - GitHub: https://github.com/alexcorvi/heic2any
 *   - ブラウザ側で動作（WebAssembly使用）
 *
 * 注意点:
 * - HEIC形式の変換は時間がかかる（1-3秒程度）
 * - heic2anyライブラリはWebPへの直接変換をサポートしていない
 * - 変換結果は配列で返される場合があるため、最初の要素を取得
 *
 * パフォーマンス最適化:
 * - 動的インポート: HEIC使用時のみheic2anyを読み込み、初期バンドルサイズを削減
 * - 遅延インポート: import()を使用してコード分割を実現
 *
 * トレードオフ:
 * - **変換品質0.92**: 高品質を維持するが、ファイルサイズは大きめ
 *   - 代替案: 0.85など低品質にすればファイルサイズは小さいが、2段階変換で画質劣化が目立つ
 */

import { log } from '../logger';

// heic2anyを動的インポート（コード分割のため）
// 理由: heic2anyは約200KBのライブラリで、HEIC形式のファイルを扱う時のみ必要
// 初期バンドルサイズを削減し、ページ読み込みを高速化
let heic2any: ((options: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>) | null = null;

/**
 * heic2anyライブラリを取得します（動的インポート）
 *
 * HEIC形式のファイルが初めて使用された際にライブラリを読み込みます。
 * 一度読み込んだ後はキャッシュされ、2回目以降は即座に返されます。
 *
 * @returns heic2any関数（読み込み失敗時はnull）
 *
 * 実装の理由:
 * - **動的インポート**: HEIC使用時のみライブラリを読み込み、初期バンドルサイズを削減
 * - **シングルトンパターン**: 一度読み込んだ後はキャッシュして再利用
 * - **ブラウザチェック**: サーバー側レンダリング時は読み込みをスキップ
 *
 * 処理の流れ:
 * 1. **キャッシュ確認**: すでに読み込み済みならそのまま返す
 * 2. **ブラウザ環境チェック**: window が存在する場合のみ読み込み
 * 3. **動的インポート**: import('heic2any') でライブラリを読み込み
 * 4. **デフォルトエクスポート取得**: default または module 自体を取得
 *
 * 注意点:
 * - import()は非同期のため、async/awaitで待機が必要
 * - 読み込み失敗時はnullを返し、呼び出し側でエラーハンドリング
 * - サーバー側レンダリング時は window が undefined のため読み込まない
 */
async function getHeic2Any() {
  // すでに読み込み済みの場合はキャッシュを返す
  // 理由: 毎回import()を実行すると不要なネットワークリクエストが発生
  if (!heic2any && typeof window !== 'undefined') {
    try {
      // 動的インポートでheic2anyライブラリを読み込み
      // コード分割により、HEIC使用時のみバンドルに含まれる
      const heic2anyModule = await import('heic2any');
      // デフォルトエクスポートまたはモジュール自体を取得
      heic2any = heic2anyModule.default || heic2anyModule;
    } catch (error) {
      // 読み込み失敗時は警告ログを出力し、nullを返す
      // 理由: エラーではなく警告にすることで、アプリ全体のクラッシュを防ぐ
      log.warn('heic2anyの読み込みに失敗しました', {
        context: 'getHeic2Any',
        error,
      });
    }
  }
  return heic2any;
}

/**
 * HEIC形式のファイルかどうかを判定します
 *
 * MIMEタイプとファイル拡張子の両方で判定することで、確実にHEIC形式を検出します。
 *
 * @param file - 判定対象の画像ファイル
 * @returns HEIC形式の場合 true、それ以外は false
 *
 * 判定方法:
 * 1. **MIMEタイプ判定**: file.type が HEIC/HEIF 関連の MIME タイプか確認
 * 2. **拡張子判定**: ファイル名が .heic または .heif で終わるか確認
 *
 * 対応するMIMEタイプ:
 * - `image/heic`: 静止画HEIC形式
 * - `image/heif`: HEIF形式（HEICの汎用版）
 * - `image/heic-sequence`: 連続画像HEIC（Live Photosなど）
 * - `image/heif-sequence`: 連続画像HEIF
 *
 * 実装の理由:
 * - **2段階判定**: MIMEタイプが空の場合でも拡張子で判定できる
 * - **大文字小文字を区別しない**: .HEIC も .heic も許容
 * - **HEIF対応**: HEIC は HEIF の一種だが、両方を明示的にチェック
 *
 * 注意点:
 * - iPhoneで撮影した写真は、環境によってMIMEタイプが空になることがある
 * - 拡張子判定は正規表現で行い、大文字小文字を区別しない（/i フラグ）
 *
 * 使用例:
 * ```typescript
 * if (isHeicFile(file)) {
 *   // HEIC形式なので変換が必要
 *   const jpegBlob = await convertHeicToJpeg(file);
 * }
 * ```
 */
export function isHeicFile(file: File): boolean {
  // HEIC/HEIF関連のMIMEタイプ一覧
  const heicTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  // MIMEタイプまたは拡張子で判定
  // 理由: 環境によってMIMEタイプが空の場合があるため、両方をチェック
  return heicTypes.includes(file.type.toLowerCase()) ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);
}

/**
 * HEIC形式のファイルをJPEGに変換します
 *
 * heic2anyライブラリを使用して、HEIC形式の画像をJPEG形式に変換します。
 * 変換には1-3秒程度かかる場合があります。
 *
 * @param file - HEIC形式のファイル
 * @returns JPEG形式のBlob（変換後の画像データ）
 * @throws {Error} heic2anyライブラリが読み込めなかった場合
 * @throws {Error} HEIC形式の変換に失敗した場合
 * @throws {Error} 変換結果が無効な場合
 *
 * 処理の流れ:
 * 1. **ライブラリ取得**: getHeic2Any()でheic2anyライブラリを動的読み込み
 * 2. **変換実行**: heic2anyLib()でHEIC → JPEG変換（品質0.92）
 * 3. **結果の検証**: 配列の場合は最初の要素を取得、Blobであることを確認
 * 4. **エラーハンドリング**: 失敗時は詳細なエラーメッセージをスロー
 *
 * 変換オプション:
 * - **toType**: 'image/jpeg' （WebPへの直接変換は非対応）
 * - **quality**: 0.92 （高品質、2段階変換の画質劣化を最小化）
 *
 * 実装の理由:
 * - **高品質0.92**: 次のWebP変換でさらに圧縮されるため、ここでは高品質を維持
 * - **配列対応**: heic2anyは複数画像（Live Photosなど）を配列で返すことがある
 * - **Blob型チェック**: 予期しない型が返された場合のエラーを防止
 *
 * 注意点:
 * - HEIC形式の変換は処理が重いため、1-3秒程度かかる場合がある
 * - heic2anyはWebAssemblyを使用するため、古いブラウザでは動作しない可能性
 * - Live Photosなどの連続画像の場合、最初のフレームのみを使用
 *
 * トレードオフ:
 * - **品質0.92**: 高品質だがファイルサイズは大きめ
 *   - 0.85など低品質にすればサイズは小さいが、2段階変換で画質劣化が目立つ
 *
 * 使用例:
 * ```typescript
 * const heicFile = new File([blob], 'photo.heic', { type: 'image/heic' });
 * const jpegBlob = await convertHeicToJpeg(heicFile);
 * const jpegFile = new File([jpegBlob], 'photo.jpg', { type: 'image/jpeg' });
 * ```
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  // heic2anyライブラリを取得（動的インポート）
  const heic2anyLib = await getHeic2Any();
  if (!heic2anyLib) {
    throw new Error('HEIC形式の変換ライブラリが読み込めませんでした');
  }

  try {
    // HEIC → JPEG 変換を実行
    // quality: 0.92 で高品質を維持（次のWebP変換でさらに圧縮されるため）
    const result = await heic2anyLib({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92, // 高品質を維持（2段階変換の画質劣化を最小化）
    });

    // heic2anyは配列を返すことがあるので、最初の要素を取得
    // 理由: Live Photosなどの連続画像は配列で返される
    const blob = Array.isArray(result) ? result[0] : result;
    if (!(blob instanceof Blob)) {
      throw new Error('HEIC変換の結果が無効です');
    }

    return blob;
  } catch (error) {
    // エラーメッセージを詳細化してスロー
    // 理由: ユーザーや開発者が原因を特定しやすくする
    throw new Error(`HEIC形式の変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}
