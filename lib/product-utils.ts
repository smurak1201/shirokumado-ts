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
 * 日付の値を解決します（商品更新 API 用）
 *
 * リクエストボディで日付が指定されている場合は、その値を Date オブジェクトに変換します。
 * 指定されていない場合（undefined）は、既存の値をそのまま返します。
 * null が指定されている場合は、日付をクリア（削除）します。
 *
 * @param requestValue リクエストボディから来る日付文字列（string | null | undefined）
 * @param existingValue 既存の日付値（Date | null）
 * @returns 解決された日付値（Date | null）
 *
 * 使用例（商品更新 API での使用）:
 * ```typescript
 * // ケース1: リクエストで日付が指定されていない（undefined）→ 既存の値を維持
 * resolveDateValue(undefined, new Date('2026-01-01')); // Date('2026-01-01')
 *
 * // ケース2: リクエストで null が指定されている → 日付をクリア
 * resolveDateValue(null, new Date('2026-01-01')); // null
 *
 * // ケース3: リクエストで新しい日付が指定されている → 新しい日付に更新
 * resolveDateValue('2026-02-01', new Date('2026-01-01')); // Date('2026-02-01')
 * ```
 *
 * 実装の理由:
 * - PATCH リクエストでは、送信されたフィールドのみを更新する必要がある
 * - undefined: フィールドが送信されていない → 変更しない
 * - null: 明示的に null が送信された → 日付を削除
 * - string: 新しい日付文字列が送信された → 更新
 *
 * null と undefined の違い:
 * - undefined: 「このフィールドは更新しない」という意味
 * - null: 「このフィールドを削除（クリア）する」という意味
 *
 * 注意点:
 * - この関数は商品更新 API（PATCH /api/products/:id）で使用される
 * - 日付文字列は ISO 8601 形式（YYYY-MM-DD）を想定
 * - 不正な日付文字列を渡すと Invalid Date になる可能性がある
 */
export function resolveDateValue(
  requestValue: string | null | undefined,
  existingValue: Date | null
): Date | null {
  // リクエストボディで値が指定されていない場合は、既存の値を返す
  // 理由: PATCH リクエストでは、送信されたフィールドのみを更新する
  if (requestValue === undefined) {
    return existingValue;
  }

  // リクエストボディで null が指定されている場合は、null を返す
  // 理由: null は「日付を削除（クリア）する」という明示的な指示
  if (requestValue === null) {
    return null;
  }

  // リクエストボディで文字列が指定されている場合は、Date オブジェクトに変換
  // 理由: データベースには Date 型で保存する必要がある
  return new Date(requestValue);
}

/**
 * 商品の公開状態を決定します
 *
 * 2つの公開制御方法（日付範囲ベースの自動判定 vs 手動設定フラグ）を適切に使い分けます。
 * 公開日・終了日が設定されている場合は自動判定を優先し、
 * 設定されていない場合は手動設定値を使用します。
 *
 * @param publishedAt 公開日（null の場合は公開日なし）
 * @param endedAt 終了日（null の場合は終了日なし）
 * @param manualPublished 手動設定された公開状態（undefined の場合はデフォルト値を使用）
 * @param defaultPublished デフォルトの公開状態（manualPublished が未指定の場合に使用、デフォルト: true）
 * @returns 公開状態（true: 公開、false: 非公開）
 *
 * 優先順位:
 * 1. **日付範囲ベースの自動判定**（publishedAt または endedAt が設定されている場合）
 *    - 現在時刻と比較して自動的に公開/非公開を判定
 *    - 期間限定商品やキャンペーン商品に適している
 * 2. **手動設定フラグ**（日付範囲が設定されていない場合）
 *    - published フラグの値を使用
 *    - 通常の商品（公開日を気にしない商品）に適している
 * 3. **デフォルト値**（手動設定フラグも未指定の場合）
 *    - 新規作成時などに使用
 *
 * 使用例:
 * ```typescript
 * // ケース1: 公開日が設定されている → 自動判定を優先
 * determinePublishedStatus(
 *   new Date('2026-01-01'), // 公開日（過去）
 *   null,
 *   false, // 手動設定は false だが、自動判定が優先される
 * ); // true（公開日が過去なので公開）
 *
 * // ケース2: 日付範囲が設定されていない → 手動設定を使用
 * determinePublishedStatus(
 *   null, // 公開日なし
 *   null, // 終了日なし
 *   false, // 手動設定: 非公開
 * ); // false（手動設定に従う）
 *
 * // ケース3: 日付範囲も手動設定も未指定 → デフォルト値を使用
 * determinePublishedStatus(
 *   null,
 *   null,
 *   undefined, // 手動設定なし
 *   true, // デフォルト: 公開
 * ); // true（デフォルト値に従う）
 * ```
 *
 * 実装の理由:
 * - 2つの公開制御方法を共存させることで、柔軟な運用が可能
 * - 期間限定商品: 日付範囲で自動管理（手間が省ける）
 * - 通常商品: 手動フラグで管理（シンプル）
 *
 * トレードオフ:
 * - 利点: 自動判定と手動設定を両方サポートし、運用の柔軟性が高い
 * - 欠点: 優先順位の理解が必要（日付範囲が常に優先されることを認識する必要がある）
 *
 * 注意点:
 * - 日付範囲が設定されている場合、手動設定フラグは無視される
 * - 日付範囲を削除すると、手動設定フラグが有効になる
 */
export function determinePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null,
  manualPublished?: boolean,
  defaultPublished: boolean = true
): boolean {
  // 公開日・終了日が設定されている場合は自動判定を優先
  // 理由: 日付範囲ベースの自動判定が設定されている場合、手動設定より優先すべき
  if (publishedAt || endedAt) {
    return calculatePublishedStatus(publishedAt, endedAt);
  }

  // 手動設定値が指定されている場合はそれを使用、未指定の場合はデフォルト値を使用
  // 理由: 日付範囲が設定されていない場合は、手動設定フラグで公開/非公開を制御する
  return manualPublished !== undefined ? manualPublished : defaultPublished;
}

/**
 * 数値をカンマ区切りの文字列に変換します（入力フィールド用）
 *
 * 価格入力フィールド（<input type="text">）で、ユーザーに読みやすい形式で表示するために使用します。
 * 通貨記号（¥）は付けず、カンマ区切りのみを適用します。
 *
 * @param value 数値または数値文字列（例: 1000, "1000", "1,000"）
 * @returns カンマ区切りの文字列（例: "1,000"）、空の場合は空文字列
 *
 * 使用例:
 * ```typescript
 * // 入力フィールドでの使用
 * <input
 *   type="text"
 *   value={formatPriceForInput(price)}
 *   onChange={(e) => setPrice(parsePrice(e.target.value))}
 * />
 *
 * // 具体例
 * formatPriceForInput(1000); // "1,000"
 * formatPriceForInput("1000"); // "1,000"
 * formatPriceForInput("1,000"); // "1,000"（既にカンマが含まれていても正しく処理）
 * formatPriceForInput(null); // ""
 * formatPriceForInput(""); // ""
 * formatPriceForInput("abc"); // ""（不正な値は空文字列）
 * ```
 *
 * formatPrice との違い:
 * - formatPriceForInput: カンマ区切りのみ（入力フィールド用）例: "1,000"
 * - formatPrice: 通貨記号付き（表示専用）例: "¥1,000"
 *
 * 実装の理由:
 * - 入力フィールドでは通貨記号（¥）を付けると編集しにくい
 * - ユーザーが数値を入力しやすいよう、カンマ区切りのみを適用
 * - 既にカンマが含まれている文字列も正しく処理できる
 *
 * 注意点:
 * - 小数点は含まれない（整数のみ対応）
 * - 不正な値（NaN）は空文字列として返される
 */
export function formatPriceForInput(value: string | number | null | undefined): string {
  // null, undefined, 空文字列の場合は空文字列を返す
  // 理由: 入力フィールドが空の状態を表現するため
  if (value === null || value === undefined || value === "") {
    return "";
  }
  // 文字列の場合はカンマを除去してから数値に変換
  // 理由: "1,000" のような既にフォーマット済みの文字列も受け入れるため
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  // 数値変換に失敗した場合は空文字列を返す
  // 理由: 不正な値（例: "abc"）を入力フィールドに表示しないため
  if (isNaN(numValue)) {
    return "";
  }
  // 日本のロケールでカンマ区切りに変換（例: 1000 → "1,000"）
  return numValue.toLocaleString("ja-JP");
}

/**
 * 価格をフォーマットして表示用の文字列を返します
 *
 * 通貨記号（¥）とカンマ区切りを付けて、ユーザーに分かりやすい形式で表示します。
 * 商品一覧や詳細ページでの価格表示に使用します。
 *
 * @param value 価格（数値、数値文字列、null、undefined）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）、空の場合は空文字列
 *
 * 使用例:
 * ```typescript
 * // 商品一覧での表示
 * <p className="text-lg font-bold">
 *   {formatPrice(product.price)}
 * </p>
 *
 * // 具体例
 * formatPrice(1000); // "¥1,000"
 * formatPrice("1000"); // "¥1,000"
 * formatPrice("1,000"); // "¥1,000"
 * formatPrice(null); // ""（価格未設定の場合）
 * formatPrice(0); // "¥0"
 * ```
 *
 * formatPriceForInput との違い:
 * - formatPrice: 通貨記号付き（表示専用）例: "¥1,000"
 * - formatPriceForInput: カンマ区切りのみ（入力フィールド用）例: "1,000"
 *
 * 実装の理由:
 * - 日本円の表記として通貨記号（¥）を付ける
 * - 大きな数値を読みやすくするためカンマ区切りを適用
 * - 入力フィールドでは使わない（編集しにくいため）
 *
 * 注意点:
 * - 表示専用であり、入力フィールドでは使用しない
 * - 小数点は含まれない（整数のみ対応）
 * - 0 円も "¥0" として表示される（空文字列にはならない）
 */
export function formatPrice(value: string | number | null | undefined): string {
  // null, undefined, 空文字列の場合は空文字列を返す
  // 理由: 価格が未設定の場合は何も表示しない
  if (value === null || value === undefined || value === "") {
    return "";
  }
  // 文字列の場合はカンマを除去してから数値に変換
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  // 数値変換に失敗した場合は空文字列を返す
  if (isNaN(numValue)) {
    return "";
  }
  // 日本円の形式でフォーマット（通貨記号 + カンマ区切り）
  return `¥${numValue.toLocaleString("ja-JP")}`;
}

/**
 * カンマ区切りの文字列を数値文字列に変換します
 *
 * 入力フィールドの値をパースして、データベースに保存できる形式に変換します。
 * カンマや通貨記号などの余分な文字を除去し、数字のみを抽出します。
 *
 * @param value カンマ区切りの文字列（例: "1,000", "¥1,000", "1000円"）
 * @returns 数値文字列（例: "1000"）、空の場合は空文字列
 *
 * 使用例:
 * ```typescript
 * // 入力フィールドの onChange イベント
 * <input
 *   type="text"
 *   value={formatPriceForInput(price)}
 *   onChange={(e) => {
 *     const cleaned = parsePrice(e.target.value);
 *     setPrice(cleaned);
 *   }}
 * />
 *
 * // 具体例
 * parsePrice("1,000"); // "1000"
 * parsePrice("¥1,000"); // "1000"
 * parsePrice("1000円"); // "1000"
 * parsePrice("abc123def"); // "123"（数字のみ抽出）
 * parsePrice(""); // ""
 * ```
 *
 * 処理の流れ:
 * 1. カンマを除去（"1,000" → "1000"）
 * 2. 数字以外の文字を除去（"¥1000円" → "1000"）
 * 3. 結果を返す
 *
 * 実装の理由:
 * - ユーザーが意図せず入力した記号や文字を自動的に除去
 * - データベースには整数値（文字列形式）で保存する必要がある
 * - カンマ区切りや通貨記号を含む入力を受け入れ可能にする
 *
 * 注意点:
 * - 小数点も除去される（整数のみ対応）
 * - 負の数には対応していない（マイナス記号も除去される）
 * - 返り値は文字列（数値型ではない）
 *
 * トレードオフ:
 * - 利点: ユーザーが自由に入力できる（カンマや通貨記号を入力してもOK）
 * - 欠点: 小数点や負の数を扱えない（現在の要件では不要）
 */
export function parsePrice(value: string): string {
  // カンマを除去して数字のみを抽出（小数点は除外）
  // 理由:
  // 1. replace(/,/g, ""): カンマを除去（"1,000" → "1000"）
  // 2. replace(/[^\d]/g, ""): 数字以外を除去（"¥1000円" → "1000"）
  const cleaned = value.replace(/,/g, "").replace(/[^\d]/g, "");
  return cleaned;
}

/**
 * キー入力が数字かどうかを判定します
 *
 * 入力フィールドで数値のみを受け付けるために、キーボードイベントをフィルタリングします。
 * 数字キー（0-9）、制御キー（Backspace、矢印キーなど）、コピー&ペースト操作のみを許可します。
 *
 * @param e キーボードイベント（React.KeyboardEvent）
 * @returns 数字または許可された制御キーの場合は true、それ以外は false
 *
 * 使用例:
 * ```typescript
 * // 価格入力フィールド（数値のみ受け付ける）
 * <input
 *   type="text"
 *   onKeyDown={(e) => {
 *     if (!isNumericKey(e)) {
 *       e.preventDefault(); // 数字以外の入力を阻止
 *     }
 *   }}
 * />
 * ```
 *
 * 許可されるキー:
 * 1. **数字キー**: 0-9（テンキーも含む）
 * 2. **制御キー**: Backspace, Delete, Tab, Escape, Enter, 矢印キー, Home, End
 * 3. **コピー&ペースト**: Ctrl/Cmd + A, C, V, X
 *
 * 許可されないキー:
 * - 文字キー（a-z, A-Z）※ ただし Ctrl/Cmd との組み合わせは許可
 * - 記号キー（!, @, # など）
 * - 小数点（.）※ 整数のみ対応のため
 * - マイナス記号（-）※ 負の数には非対応
 *
 * 実装の理由:
 * - type="number" は UX が悪い（スピンボタンが表示される、入力制限が厳しい）
 * - type="text" + onKeyDown でフィルタリングすることで、柔軟な入力制御が可能
 * - コピー&ペースト操作を許可することで、ユーザビリティを向上
 *
 * 注意点:
 * - この関数は onKeyDown イベントで使用する（onChange ではない）
 * - コピー&ペーストで数字以外が入力される可能性がある（parsePrice で処理）
 * - IME（日本語入力）による入力は別途処理が必要（現在は未対応）
 *
 * トレードオフ:
 * - 利点: ユーザーが数字以外を入力できないため、エラーを防げる
 * - 欠点: コピー&ペーストで不正な値が入る可能性がある（parsePrice で対処）
 */
export function isNumericKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  // 数字キー（0-9）を許可
  // 理由: 価格入力フィールドで数値を入力できるようにする
  if (e.key >= "0" && e.key <= "9") {
    return true;
  }
  // 許可する制御キー
  // 理由: カーソル移動、削除、フォーカス遷移など、編集に必要な操作を許可
  const allowedKeys = [
    "Backspace", // 前の文字を削除
    "Delete", // 後ろの文字を削除
    "Tab", // フォーカス移動
    "Escape", // 入力キャンセル
    "Enter", // フォーム送信
    "ArrowLeft", // カーソルを左に移動
    "ArrowRight", // カーソルを右に移動
    "ArrowUp", // 上の入力フィールドに移動
    "ArrowDown", // 下の入力フィールドに移動
    "Home", // 行の先頭に移動
    "End", // 行の末尾に移動
  ];
  if (allowedKeys.includes(e.key)) {
    return true;
  }
  // Ctrl/Cmd + A, C, V, X などのコピー&ペースト操作を許可
  // 理由:
  // - Ctrl/Cmd + A: 全選択
  // - Ctrl/Cmd + C: コピー
  // - Ctrl/Cmd + V: ペースト
  // - Ctrl/Cmd + X: カット
  // これらの操作を許可することで、ユーザビリティが向上する
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
    return true;
  }
  // 上記以外のキーは許可しない（例: 文字キー、記号キーなど）
  return false;
}
