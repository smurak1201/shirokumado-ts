/**
 * @fileoverview 日付入力フィールドコンポーネント - 日付と時刻の入力
 *
 * ## 目的
 * - 日付と時刻を分離した入力フィールドを提供
 * - 日付のみ入力した場合、デフォルト時刻を自動設定
 * - 入力値のクリア機能
 *
 * ## 主な機能
 * - 日付入力（type="date"）
 * - 時刻入力（type="time"、日付が入力されている場合のみ有効）
 * - クリアボタン（値が設定されている場合のみ表示）
 * - デフォルト時刻の自動設定
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductDateFields.tsx
 * - 公開日・終了日の入力フィールド
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **ISO 8601形式**: 内部で "YYYY-MM-DDTHH:mm" 形式で管理
 * - **時刻の自動設定**: 日付のみ入力した場合、defaultTime を使用
 *
 * ## なぜ日付と時刻を分離するのか
 * - type="datetime-local" は UI が使いにくい（ブラウザによって異なる）
 * - 分離することで、日付だけを変更する操作が簡単
 * - トレードオフ: 2つの input を管理する必要があるが、UX が向上
 *
 * ## ISO 8601形式について
 * - "YYYY-MM-DDTHH:mm" 形式（例: "2025-01-15T11:00"）
 * - T で日付と時刻を区切る
 * - datetime-local input と互換性がある
 */

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

/**
 * 日付入力フィールドのprops型定義
 *
 * @property id - input要素のid属性（一意の識別子）
 * @property label - フィールドのラベル（例: "公開日"、"終了日"）
 * @property value - ISO 8601形式の日時文字列（例: "2025-01-15T11:00"）
 * @property onChange - 日付または時刻が変更されたときのコールバック
 * @property onClear - クリアボタンがクリックされたときのコールバック
 * @property ariaLabel - クリアボタンのaria-label属性（アクセシビリティ対応）
 * @property defaultTime - 日付のみ入力時のデフォルト時刻。オプション、デフォルト: "00:00"
 */
interface ProductDateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  ariaLabel: string;
  defaultTime?: string;
}

/**
 * 日付入力フィールドコンポーネント
 *
 * 公開日・終了日の入力に使用する日付と時刻の入力フィールドを提供します。
 * 値が設定されている場合はクリアボタンが表示されます。
 *
 * @param props - ProductDateInputProps型のプロップス
 * @returns 日付入力フィールドのJSX要素
 *
 * ## フィールドの構成
 * 1. 日付入力（type="date"）
 * 2. 時刻入力（type="time"、日付が入力されている場合のみ有効）
 * 3. クリアボタン（値が設定されている場合のみ表示）
 *
 * ## value の分割
 * - value が "2025-01-15T11:00" の場合
 * - split("T") で ["2025-01-15", "11:00"] に分割
 * - datePart: "2025-01-15"（日付部分）
 * - timePart: "11:00"（時刻部分）
 *
 * ## handleDateChange の処理
 * 1. 日付が入力された場合: 時刻を timePart または defaultTime に設定
 * 2. 日付が削除された場合: onClear を呼び出して値を空にする
 *
 * ## handleTimeChange の処理
 * - 日付が入力されている場合のみ、時刻を更新
 * - 理由: 日付なしで時刻だけを設定することはできない
 *
 * ## クリアボタンの表示条件
 * - value が存在する場合のみ表示
 * - type="button": フォーム送信を防ぐ
 * - variant="ghost": 背景なしのボタンスタイル
 */
export default function ProductDateInput({
  id,
  label,
  value,
  onChange,
  onClear,
  ariaLabel,
  defaultTime = "00:00",
}: ProductDateInputProps) {
  // value を日付部分と時刻部分に分割
  // value が空の場合: ["", ""]
  // value が "2025-01-15T11:00" の場合: ["2025-01-15", "11:00"]
  const [datePart, timePart] = value ? value.split("T") : ["", ""];

  /**
   * 日付が変更されたときの処理
   *
   * @param newDate - 新しい日付（"YYYY-MM-DD" 形式）
   *
   * ## 処理の流れ
   * 1. newDate が存在する場合
   *    - 時刻を timePart または defaultTime に設定
   *    - onChange で "YYYY-MM-DDTHH:mm" 形式の値を返す
   * 2. newDate が空の場合（日付が削除された）
   *    - onClear を呼び出して値を空にする
   *
   * ## defaultTime の使用
   * - timePart が存在しない場合（日付のみ入力）、defaultTime を使用
   * - 理由: 日付だけを入力した場合、時刻は自動設定したい
   */
  const handleDateChange = (newDate: string) => {
    if (newDate) {
      // 時刻が既に設定されている場合はそのまま使用、なければ defaultTime
      const time = timePart || defaultTime;
      // ISO 8601形式で onChange に渡す
      onChange(`${newDate}T${time}`);
    } else {
      // 日付が削除された場合、値をクリア
      onClear();
    }
  };

  /**
   * 時刻が変更されたときの処理
   *
   * @param newTime - 新しい時刻（"HH:mm" 形式）
   *
   * ## 処理の流れ
   * - datePart が存在する場合のみ、時刻を更新
   * - 理由: 日付なしで時刻だけを設定することはできない
   *
   * ## 時刻が削除された場合
   * - newTime が空の場合は何もしない
   * - 理由: 時刻だけを削除することは許可しない（日付と時刻はセット）
   */
  const handleTimeChange = (newTime: string) => {
    if (datePart && newTime) {
      // ISO 8601形式で onChange に渡す
      onChange(`${datePart}T${newTime}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* 日付と時刻の入力フィールドを横並びで配置 */}
      {/* flex gap-2: フレックスボックスで横並び、間にスペース */}
      <div className="flex gap-2">
        {/* 日付入力フィールド */}
        {/* type="date": 日付選択のカレンダーUIを表示 */}
        {/* className="flex-1": 利用可能なスペースを最大限使用 */}
        <Input
          type="date"
          id={id}
          value={datePart}
          onChange={(e) => handleDateChange(e.target.value)}
          className="flex-1"
        />

        {/* 時刻入力フィールド */}
        {/* type="time": 時刻選択のUIを表示 */}
        {/* disabled={!datePart}: 日付が入力されていない場合は無効化 */}
        {/* 理由: 日付なしで時刻だけを設定することはできない */}
        {/* className="w-24": 固定幅（時刻は "HH:mm" で短い） */}
        <Input
          type="time"
          id={`${id}-time`}
          value={timePart}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={!datePart}
          className="w-24"
        />

        {/* クリアボタン: 値が設定されている場合のみ表示 */}
        {value && (
          <Button
            type="button" // type="submit" を防ぐ（フォーム送信を防止）
            onClick={onClear} // クリック時に onClear を呼び出す
            variant="ghost" // 背景なしのボタンスタイル
            size="icon" // アイコンサイズ（正方形）
            className="h-10 w-10 shrink-0" // 高さと幅を 10 * 0.25rem = 2.5rem（40px）に設定、縮小を防ぐ
            aria-label={ariaLabel} // スクリーンリーダー用のラベル
          >
            ✕ {/* クローズアイコン */}
          </Button>
        )}
      </div>
    </div>
  );
}
