/**
 * 商品関連のユーティリティ関数 (lib/product-utils.ts)
 *
 * 商品データの処理、日付管理、価格フォーマットなどのヘルパー関数を提供します。
 *
 * 主な機能:
 * - 日本時間の取得と日付処理（公開日・終了日の自動判定）
 * - 価格フォーマット（表示用、入力用）
 * - 数値入力バリデーション（キーボードイベント）
 * - 公開状態の自動判定（日付範囲ベース）
 *
 * 使用箇所:
 * - 商品一覧ページ（公開/非公開の判定）
 * - 商品作成・編集フォーム（価格入力、日付処理）
 * - API Routes（商品 CRUD 操作）
 *
 * ベストプラクティス:
 * - 日付処理は日本時間（Asia/Tokyo）を基準とする
 * - 価格表示は日本円（¥）とカンマ区切りを使用
 * - 数値入力は制御キー（Backspace、矢印キーなど）を許可
 * - 公開日・終了日が設定されている場合は自動判定を優先
 *
 * 注意点:
 * - タイムゾーンは常に Asia/Tokyo を使用（サーバーのタイムゾーンに依存しない）
 * - null と undefined を明確に区別（API リクエストで意味が異なる）
 */

/**
 * 日本時間の現在日時を取得します
 *
 * サーバーのタイムゾーンに依存せず、常に日本時間（JST, UTC+9）を返します。
 * これにより、どの地域のサーバーでも一貫した時刻判定が可能になります。
 *
 * @returns 日本時間の現在日時（Date オブジェクト）
 *
 * 使用例:
 * ```typescript
 * const now = getJapanTime();
 * console.log(now.toLocaleString('ja-JP')); // 例: "2026/2/1 12:00:00"
 * ```
 *
 * 実装の理由:
 * - サーバーのタイムゾーンが UTC や他の地域に設定されていても、
 *   商品の公開/非公開判定は日本時間を基準とする必要がある
 * - Vercel のサーバーは UTC なので、そのまま new Date() を使うと判定がずれる
 *
 * 技術的な詳細:
 * - toLocaleString() で日本時間の文字列に変換してから Date オブジェクトに戻す
 * - この方法により、タイムゾーン変換が確実に行われる
 *
 * 注意点:
 * - この関数は公開日・終了日の判定に使用されるため、変更する場合は影響範囲を確認すること
 * - サマータイム（夏時間）は日本にはないため、常に UTC+9 で一定
 */
export function getJapanTime(): Date {
  const now = new Date();
  // 日本時間（UTC+9）に変換
  // 理由: サーバーのタイムゾーン（UTC など）に依存せず、常に日本時間を基準とする
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return japanTime;
}

/**
 * 公開日・終了日から公開情報を自動判定します
 *
 * 現在の日本時間と公開日・終了日を比較して、商品を公開すべきかどうかを判定します。
 * この判定は商品一覧の表示やAPIレスポンスで使用されます。
 *
 * @param publishedAt 公開日（null の場合は公開日なし）
 * @param endedAt 終了日（null の場合は終了日なし）
 * @returns 公開情報（true: 公開、false: 非公開）
 *
 * 判定ロジック:
 * 1. 公開日が未来の場合 → 非公開（まだ公開されていない）
 * 2. 終了日が過去の場合 → 非公開（既に終了している）
 * 3. それ以外の場合 → 公開
 *
 * 使用例:
 * ```typescript
 * // 2026年2月1日 12:00 に実行（現在時刻）
 *
 * // ケース1: 公開日が未来（2026年3月1日）→ 非公開
 * calculatePublishedStatus(new Date('2026-03-01'), null); // false
 *
 * // ケース2: 終了日が過去（2026年1月1日）→ 非公開
 * calculatePublishedStatus(null, new Date('2026-01-01')); // false
 *
 * // ケース3: 公開日が過去、終了日が未来 → 公開
 * calculatePublishedStatus(new Date('2026-01-01'), new Date('2026-03-01')); // true
 *
 * // ケース4: 公開日・終了日が両方 null → 公開
 * calculatePublishedStatus(null, null); // true
 * ```
 *
 * 注意点:
 * - 時刻は日本時間（JST）を基準とする（サーバーのタイムゾーンに依存しない）
 * - 公開日と終了日の両方が設定されている場合、両方の条件を満たす必要がある
 * - null は「指定なし」を意味し、その条件は無視される
 */
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  // 日本時間の現在日時を取得
  // 理由: サーバーのタイムゾーンに関わらず、日本時間を基準に判定する
  const now = getJapanTime();

  // 公開日が設定されている場合
  if (publishedAt) {
    const publishedDate = new Date(publishedAt);
    // 公開日が未来の場合は非公開
    if (publishedDate > now) {
      return false;
    }
  }

  // 終了日が設定されている場合
  if (endedAt) {
    const endedDate = new Date(endedAt);
    // 終了日が過去の場合は非公開
    if (endedDate < now) {
      return false;
    }
  }

  // 公開日が過去または未設定、かつ終了日が未来または未設定の場合は公開
  return true;
}

/**
 * 公開日・終了日が設定されているかどうかを判定します
 *
 * どちらか一方でも設定されていれば true を返します。
 * この判定は、自動判定と手動設定のどちらを優先するかを決定する際に使用されます。
 *
 * @param publishedAt 公開日（null の場合は未設定）
 * @param endedAt 終了日（null の場合は未設定）
 * @returns どちらかが設定されている場合は true、両方とも null の場合は false
 *
 * 使用例:
 * ```typescript
 * // 公開日のみ設定
 * hasDateRange(new Date('2026-01-01'), null); // true
 *
 * // 終了日のみ設定
 * hasDateRange(null, new Date('2026-12-31')); // true
 *
 * // 両方設定
 * hasDateRange(new Date('2026-01-01'), new Date('2026-12-31')); // true
 *
 * // 両方未設定
 * hasDateRange(null, null); // false
 * ```
 *
 * 実装の理由:
 * - 日付範囲が設定されている場合は自動判定を優先する
 * - 設定されていない場合は手動設定値（published フラグ）を使用する
 * - この判定により、2つの公開制御方法を適切に使い分けられる
 *
 * @see determinePublishedStatus - この関数を使用して公開状態を決定
 */
export function hasDateRange(publishedAt: Date | null, endedAt: Date | null): boolean {
  // OR 演算子により、どちらか一方でも null でなければ true を返す
  return publishedAt !== null || endedAt !== null;
}

/**
 * 日付の値を解決する
 *
 * リクエストボディで日付が指定されている場合は、その値をDateオブジェクトに変換します。
 * 指定されていない場合は、既存の値をそのまま返します。
 *
 * @param requestValue リクエストボディから来る日付文字列（string | null | undefined）
 * @param existingValue 既存の日付値（Date | null）
 * @returns 解決された日付値（Date | null）
 */
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  // リクエストボディで値が指定されていない場合は、既存の値を返す
  if (requestValue === undefined) {
    return existingValue;
  }

  // リクエストボディでnullが指定されている場合は、nullを返す
  if (requestValue === null) {
    return null;
  }

  // リクエストボディで文字列が指定されている場合は、Dateオブジェクトに変換
  return new Date(requestValue);
}

/**
 * 商品の公開状態を決定する
 *
 * 公開日・終了日が設定されている場合は自動判定を優先し、
 * 設定されていない場合は手動設定値を使用します。
 * 手動設定値が未指定の場合は、デフォルト値（通常はtrue）を使用します。
 *
 * @param publishedAt 公開日（nullの場合は公開日なし）
 * @param endedAt 終了日（nullの場合は終了日なし）
 * @param manualPublished 手動設定された公開状態（undefinedの場合はデフォルト値を使用）
 * @param defaultPublished デフォルトの公開状態（manualPublishedが未指定の場合に使用、デフォルト: true）
 * @returns 公開状態（true: 公開、false: 非公開）
 */
export function determinePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null,
  manualPublished?: boolean,
  defaultPublished: boolean = true
): boolean {
  // 公開日・終了日が設定されている場合は自動判定を優先
  if (publishedAt || endedAt) {
    return calculatePublishedStatus(publishedAt, endedAt);
  }

  // 手動設定値が指定されている場合はそれを使用、未指定の場合はデフォルト値を使用
  return manualPublished !== undefined ? manualPublished : defaultPublished;
}

/**
 * 数値をカンマ区切りの文字列に変換（入力フィールド用）
 * @param value 数値または数値文字列
 * @returns カンマ区切りの文字列（空の場合は空文字列）
 */
export function formatPriceForInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return numValue.toLocaleString("ja-JP");
}

/**
 * 価格をフォーマットして表示用の文字列を返す
 * @param value 価格（数値、数値文字列、null、undefined）
 * @returns フォーマットされた価格文字列（例: "¥1,000"、空の場合は空文字列）
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) {
    return "";
  }
  return `¥${numValue.toLocaleString("ja-JP")}`;
}

/**
 * カンマ区切りの文字列を数値に変換
 * @param value カンマ区切りの文字列
 * @returns 数値文字列（空の場合は空文字列）
 */
export function parsePrice(value: string): string {
  // カンマを除去して数字のみを抽出（小数点は除外）
  const cleaned = value.replace(/,/g, "").replace(/[^\d]/g, "");
  return cleaned;
}

/**
 * キー入力が数字かどうかを判定
 * @param e キーボードイベント
 * @returns 数字または許可された制御キーの場合はtrue
 */
export function isNumericKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  // 数字キー（0-9）
  if (e.key >= "0" && e.key <= "9") {
    return true;
  }
  // 許可する制御キー
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(e.key)) {
    return true;
  }
  // Ctrl/Cmd + A, C, V, X などのコピー&ペースト操作
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
    return true;
  }
  return false;
}
